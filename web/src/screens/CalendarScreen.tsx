import { useMemo, useState } from "react";
import { Card, Empty } from "../components/ui";
import {
  addMonths,
  countdownLabel,
  fullDate,
  isSameDay,
  monthCells,
  monthTitle,
  weekdaySymbols,
} from "../lib/dates";
import { useApp } from "../state/AppProvider";
import type { DatePlan } from "../types";
import { blankPlan, displayTitle } from "../types";
import { DateDetailSheet, DateEditorSheet } from "./DateSheets";

export function CalendarScreen() {
  const { nextDate, dates, datesOn } = useApp();
  const [month, setMonth] = useState(() => new Date());
  const [detail, setDetail] = useState<DatePlan | null>(null);
  const [editor, setEditor] = useState<DatePlan | null>(null);
  const [dayPlans, setDayPlans] = useState<DatePlan[] | null>(null);
  const cells = useMemo(() => monthCells(month), [month]);

  const tapDay = (day: Date) => {
    const plans = datesOn(day);
    if (plans.length === 0) setEditor(blankPlan(day));
    else if (plans.length === 1) setDetail(plans[0]);
    else setDayPlans(plans);
  };

  return (
    <section className="screen">
      <div className="topbar">
        <h1>カレンダー</h1>
        <button className="plus" type="button" onClick={() => setEditor(blankPlan())} aria-label="追加">
          +
        </button>
      </div>
      <div className="stack">
        <Card onClick={() => (nextDate ? setDetail(nextDate) : setEditor(blankPlan()))}>
          {nextDate ? (
            <div className="stack" style={{ gap: 10 }}>
              <p style={{ color: "var(--accent)", fontWeight: 700 }}>次のデート</p>
              <h1>{fullDate(nextDate.date)}</h1>
              <div className="row">
                <span className="chip">{countdownLabel(nextDate.date)}</span>
                <strong>{displayTitle(nextDate)}</strong>
              </div>
            </div>
          ) : (
            <Empty icon="＋" title="次のデートはまだないよ" message="カレンダーの日付をタップして登録しよう" />
          )}
        </Card>

        <div className="card">
          <div className="month-head">
            <button className="icon-btn" type="button" onClick={() => setMonth((m) => addMonths(m, -1))}>
              ‹
            </button>
            <strong>{monthTitle(month)}</strong>
            <button className="icon-btn" type="button" onClick={() => setMonth((m) => addMonths(m, 1))}>
              ›
            </button>
          </div>
          <div className="weekdays">
            {weekdaySymbols().map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid">
            {cells.map((day, index) => {
              if (!day) return <div key={`e-${index}`} />;
              const has = dates.some((plan) => isSameDay(plan.date, day));
              const isNext = nextDate ? isSameDay(nextDate.date, day) : false;
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  className={`day${isNext ? " next" : ""}${isToday ? " today" : ""}`}
                  type="button"
                  onClick={() => tapDay(day)}
                >
                  <b>{day.getDate()}</b>
                  <span className="dot" style={{ visibility: has ? "visible" : "hidden" }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {dayPlans && (
        <div className="sheet-backdrop" onClick={() => setDayPlans(null)} role="presentation">
          <div className="sheet" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <h2>この日の予定</h2>
            <div className="stack">
              {dayPlans.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => {
                    setDayPlans(null);
                    setDetail(plan);
                  }}
                >
                  <strong>{displayTitle(plan)}</strong>
                  <p className="muted">行き先 {plan.destinations.length}件</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      {detail && <DateDetailSheet plan={detail} onClose={() => setDetail(null)} />}
      {editor && <DateEditorSheet plan={editor} onClose={() => setEditor(null)} />}
    </section>
  );
}
