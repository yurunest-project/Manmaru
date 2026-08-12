const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function daysUntil(date: Date, from = new Date()) {
  const ms = startOfDay(date).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function countdownLabel(date: Date) {
  const days = daysUntil(date);
  if (days < 0) return "終了";
  if (days === 0) return "今日";
  if (days === 1) return "明日";
  return `あと${days}日`;
}

export function fullDate(date: Date) {
  const w = WEEKDAYS[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日（${w}）`;
}

export function monthTitle(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function weekdaySymbols() {
  return WEEKDAYS;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function monthCells(visibleMonth: Date) {
  const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const leading = first.getDay();
  const count = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
