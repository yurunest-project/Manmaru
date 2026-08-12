import { useEffect, useRef, useState } from "react";
import { Card, Empty } from "../components/ui";
import { daysUntil, fullDate } from "../lib/dates";
import { useApp } from "../state/AppProvider";
import type { DatePlan } from "../types";
import { blankPlan, displayTitle } from "../types";
import { DateDetailSheet, DateEditorSheet } from "./DateSheets";

export function ScheduleScreen() {
  const { sortedDates } = useApp();
  const topRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<DatePlan | null>(null);
  const [editor, setEditor] = useState<DatePlan | null>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <section className="screen">
      <div ref={topRef} />
      <div className="topbar">
        <h1>今後の予定</h1>
        <button className="plus" type="button" onClick={() => setEditor(blankPlan())} aria-label="追加">
          +
        </button>
      </div>
      {sortedDates.length === 0 ? (
        <Empty icon="♡" title="予定はまだないよ" message="右上の＋から、次のデートを登録しよう" />
      ) : (
        <div className="stack">
          {sortedDates.map((plan) => (
            <Card
              key={plan.id}
              className={`schedule-item${daysUntil(plan.date) < 0 ? " past" : ""}`}
              onClick={() => setDetail(plan)}
            >
              <div className="row">
                <div className="date-col">
                  <strong>{plan.date.getDate()}</strong>
                  <p className="muted">{plan.date.getMonth() + 1}月</p>
                </div>
                <div className="grow">
                  <strong>{displayTitle(plan)}</strong>
                  <p className="muted">{fullDate(plan.date)}</p>
                  {plan.destinations.length > 0 && (
                    <p style={{ color: "var(--primary)", marginTop: 4 }}>
                      {plan.destinations.map((item) => item.name).join(" ・ ")}
                    </p>
                  )}
                </div>
                <span className="muted">›</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {detail && <DateDetailSheet plan={detail} onClose={() => setDetail(null)} />}
      {editor && <DateEditorSheet plan={editor} onClose={() => setEditor(null)} />}
    </section>
  );
}

export function SettingsScreen() {
  const { themeId, setTheme, couple, profile, preview, signOut, leaveCouple, updateNickname, busy } =
    useApp();
  const [copied, setCopied] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [nicknameSaved, setNicknameSaved] = useState(false);

  useEffect(() => {
    setNickname(profile?.nickname ?? "");
    setNicknameSaved(false);
  }, [profile?.nickname]);

  const saveNickname = async () => {
    await updateNickname(nickname);
    setNicknameSaved(true);
  };

  const nicknameDirty = nickname.trim() !== (profile?.nickname ?? "").trim();

  return (
    <section className="screen">
      <h1 style={{ marginBottom: 18 }}>設定</h1>
      <div className="stack">
        <h2>デザイン</h2>
        {(
          [
            ["sakura", "さくら", "やわらかいピンクとクリーム", ["#e891a3", "#c9a227", "#fff3f6"]],
            ["hoshizora", "ほしぞら", "深いネイビーと氷のような青", ["#7eb8d4", "#d4e6f0", "#0f1724"]],
            ["hachimitsu", "はちみつ", "アイボリーとテラコッタ", ["#c4784a", "#8b5e3c", "#fbf6ee"]],
          ] as const
        ).map(([id, name, tagline, colors]) => (
          <button
            key={id}
            className={`theme-option${themeId === id ? " selected" : ""}`}
            type="button"
            onClick={() => void setTheme(id)}
          >
            <div className="row space">
              <div className="row">
                <div className="swatches">
                  {colors.map((color) => (
                    <span key={color} className="swatch" style={{ background: color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }} />
                  ))}
                </div>
                <div>
                  <strong>{name}</strong>
                  <p className="muted">{tagline}</p>
                </div>
              </div>
              {themeId === id && <span style={{ color: "var(--primary)" }}>✓</span>}
            </div>
          </button>
        ))}

        <h2>ふたりのつながり</h2>
        <div className="card stack">
          {couple ? (
            <>
              <p className="muted">招待コード</p>
              <div className="row space">
                <span className="invite">{couple.inviteCode}</span>
                <button
                  type="button"
                  style={{ color: "var(--primary)", fontWeight: 700 }}
                  onClick={() => {
                    void navigator.clipboard.writeText(couple.inviteCode);
                    setCopied(true);
                  }}
                >
                  {copied ? "コピー済み" : "コピー"}
                </button>
              </div>
              <p className="muted">
                {couple.memberIds.length >= 2 ? "2人でつながっています" : "相手の参加を待っています"}
              </p>
            </>
          ) : (
            <p className="muted">まだペアがありません</p>
          )}
        </div>
        {couple && (
          <button className="danger-btn" type="button" onClick={() => void leaveCouple()}>
            ペアを解除
          </button>
        )}

        <h2>アカウント</h2>
        <div className="card stack">
          <div>
            <p className="muted">メールアドレス</p>
            <strong>{profile?.email || "—"}</strong>
          </div>
          <div>
            <p className="muted">ニックネーム</p>
            <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
              相手に表示される名前です
            </p>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="field grow"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setNicknameSaved(false);
                }}
                placeholder="ニックネーム"
                maxLength={32}
              />
              <button
                className="secondary"
                type="button"
                disabled={busy || !nicknameDirty || !nickname.trim()}
                onClick={() => void saveNickname()}
              >
                {nicknameSaved && !nicknameDirty ? "保存済み" : "保存"}
              </button>
            </div>
          </div>
          {preview && (
            <p className="muted">
              サンプル表示中です。Firebase を設定すると2人で共有できます。
            </p>
          )}
        </div>
        <button className="ghost" type="button" onClick={() => void signOut()}>
          {preview ? "サンプルを終了" : "ログアウト"}
        </button>
      </div>
    </section>
  );
}
