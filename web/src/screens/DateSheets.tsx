import { useEffect, useState } from "react";
import { Card, Sheet } from "../components/ui";
import { countdownLabel, fullDate } from "../lib/dates";
import { openDrivingRoute } from "../lib/maps";
import { searchPlaces } from "../lib/places";
import { useApp } from "../state/AppProvider";
import type { DatePlan, Destination } from "../types";
import { displayTitle } from "../types";

export function DateDetailSheet({ plan, onClose }: { plan: DatePlan; onClose: () => void }) {
  const { dates, saveDate, deleteDate } = useApp();
  const live = dates.find((item) => item.id === plan.id) ?? plan;
  const [memo, setMemo] = useState(live.memo);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setMemo(live.memo);
  }, [live.memo]);

  useEffect(() => {
    if (memo === live.memo) return;
    const snapshot = { ...live, memo };
    const handle = window.setTimeout(() => {
      void saveDate(snapshot);
    }, 450);
    return () => window.clearTimeout(handle);
    // live / saveDate は入力のたびに最新クロージャを使う
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memo, live.memo]);

  return (
    <>
      <Sheet title="デートの詳細" onClose={onClose}>
        <div className="stack">
          <div className="card stack" style={{ gap: 8 }}>
            <span className="chip">{countdownLabel(live.date)}</span>
            <h1>{fullDate(live.date)}</h1>
            <p className="muted">{displayTitle(live)}</p>
            <div className="row">
              <button className="secondary" type="button" onClick={() => setEditing(true)}>
                編集
              </button>
              <button
                className="danger-btn"
                type="button"
                onClick={() => {
                  if (confirm("この予定を削除しますか？")) {
                    void deleteDate(live).then(onClose);
                  }
                }}
              >
                削除
              </button>
            </div>
          </div>

          <h2>行き先</h2>
          {live.destinations.length === 0 ? (
            <Card>
              <p className="muted">まだ行き先がありません</p>
            </Card>
          ) : (
            live.destinations.map((destination) => (
              <button
                key={destination.id}
                className="card dest"
                type="button"
                onClick={() => openDrivingRoute(destination)}
              >
                <div className="row">
                  <span className="pin">🚗</span>
                  <div className="grow">
                    <strong>{destination.name}</strong>
                    {destination.address && <p className="muted">{destination.address}</p>}
                    <p style={{ color: "var(--primary)", fontWeight: 700, marginTop: 4 }}>
                      現在地から車ルートを開く
                    </p>
                  </div>
                  <span className="muted">↗</span>
                </div>
              </button>
            ))
          )}

          <h2>メモ</h2>
          <div className="card">
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="メモを書く" />
          </div>
        </div>
      </Sheet>
      {editing && <DateEditorSheet plan={live} onClose={() => setEditing(false)} />}
    </>
  );
}

export function DateEditorSheet({ plan, onClose }: { plan: DatePlan; onClose: () => void }) {
  const { dates, saveDate } = useApp();
  const isNew = !dates.some((item) => item.id === plan.id);
  const [draft, setDraft] = useState(plan);
  const [searching, setSearching] = useState(false);

  const dateValue = `${draft.date.getFullYear()}-${String(draft.date.getMonth() + 1).padStart(2, "0")}-${String(draft.date.getDate()).padStart(2, "0")}`;

  return (
    <>
      <Sheet title={isNew ? "デートを登録" : "デートを編集"} onClose={onClose}>
        <div className="stack">
          <h2>日付</h2>
          <div className="card">
            <input
              className="field"
              type="date"
              value={dateValue}
              onChange={(event) => setDraft({ ...draft, date: new Date(`${event.target.value}T00:00:00`) })}
            />
          </div>
          <h2>タイトル（任意）</h2>
          <div className="card">
            <input
              className="field"
              value={draft.title}
              placeholder="例）水族館デート"
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </div>
          <div className="row space">
            <h2 style={{ margin: 0 }}>行き先</h2>
            <button type="button" style={{ color: "var(--primary)", fontWeight: 700 }} onClick={() => setSearching(true)}>
              ＋ 追加
            </button>
          </div>
          {draft.destinations.length === 0 ? (
            <Card>
              <p className="muted">お店や場所を複数登録できます。タップすると車ルートが開きます。</p>
            </Card>
          ) : (
            draft.destinations.map((destination) => (
              <div className="card row space" key={destination.id}>
                <div>
                  <strong>{destination.name}</strong>
                  {destination.address && <p className="muted">{destination.address}</p>}
                </div>
                <button
                  type="button"
                  style={{ color: "var(--danger)" }}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      destinations: draft.destinations.filter((item) => item.id !== destination.id),
                    })
                  }
                >
                  削除
                </button>
              </div>
            ))
          )}
          <h2>メモ</h2>
          <div className="card">
            <textarea
              value={draft.memo}
              placeholder="メモ"
              onChange={(event) => setDraft({ ...draft, memo: event.target.value })}
            />
          </div>
          <button
            className="primary"
            type="button"
            onClick={() => {
              void saveDate(draft).then(onClose);
            }}
          >
            保存する
          </button>
        </div>
      </Sheet>
      {searching && (
        <PlaceSearchSheet
          onClose={() => setSearching(false)}
          onSelect={(destination) => {
            setDraft({ ...draft, destinations: [...draft.destinations, destination] });
            setSearching(false);
          }}
        />
      )}
    </>
  );
}

function PlaceSearchSheet({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (destination: Destination) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      void searchPlaces(query)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <Sheet title="行き先を探す" onClose={onClose}>
      <div className="stack">
        <div className="card">
          <input
            className="field"
            value={query}
            placeholder="お店や場所を検索"
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </div>
        {loading && <p className="muted">検索中...</p>}
        {query.trim().length >= 2 && (
          <button
            className="secondary"
            type="button"
            onClick={() =>
              onSelect({
                id: crypto.randomUUID(),
                name: query.trim(),
                address: "",
                latitude: 0,
                longitude: 0,
              })
            }
          >
            「{query.trim()}」で追加
          </button>
        )}
        <div className="search-list">
          {results.map((item) => (
            <button key={item.id} className="card search-item" type="button" onClick={() => onSelect(item)}>
              <strong>{item.name}</strong>
              {item.address && <p className="muted">{item.address}</p>}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
