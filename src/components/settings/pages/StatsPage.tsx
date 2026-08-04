import { useEffect, useState } from "react";
import { type DateRange, type DayStat, getStats } from "../../../lib/ipc";

type DisplayDay = DayStat & { isToday: boolean };

function fmtTime(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLast7Days(): DateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start: dateKey(start), end: dateKey(end) };
}

function buildWeek(stats: DayStat[]): DisplayDay[] {
  const byDate = new Map(stats.map((day) => [day.date, day]));
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dateKey(date);
    const stat = byDate.get(key) ?? {
      date: key,
      work_seconds: 0,
      break_count: 0,
      skip_count: 0,
    };

    return { ...stat, isToday: index === 6 };
  });
}

function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
}

function fullDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function periodLabel(days: DisplayDay[]): string {
  if (days.length === 0) return "";
  const format = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${format(days[0].date)} – ${format(days[days.length - 1].date)}`;
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-white/55 dark:bg-gray-800/40 px-4 py-3.5 ring-1 ring-gray-900/[0.035] dark:ring-white/[0.07]">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <p className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{detail}</p>
      </div>
    </div>
  );
}

function DailyRow({ day, maxWork }: { day: DisplayDay; maxWork: number }) {
  const progress = day.work_seconds > 0 ? Math.max((day.work_seconds / maxWork) * 100, 3) : 0;
  const breakLabel = day.break_count === 1 ? "break" : "breaks";

  return (
    <div
      className={`rounded-2xl px-4 py-3 transition-colors ${
        day.isToday
          ? "bg-blue-50/75 dark:bg-blue-500/10 ring-1 ring-blue-500/10 dark:ring-blue-400/15"
          : "hover:bg-white/50 dark:hover:bg-gray-800/35"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-14 shrink-0">
          <p className={`text-sm font-bold ${day.isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>
            {day.isToday ? "Today" : dayLabel(day.date)}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">{fullDate(day.date)}</p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmtTime(day.work_seconds)}</p>
            <p className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
              {day.break_count} {breakLabel}
              {day.skip_count > 0 && ` · ${day.skip_count} skipped`}
            </p>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200/70 dark:bg-gray-700/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-blue-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<DayStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats(getLast7Days())
      .then(setData)
      .catch((reason) => setError(String(reason)))
      .finally(() => setLoading(false));
  }, []);

  const days = buildWeek(data);
  const totalWork = days.reduce((sum, day) => sum + day.work_seconds, 0);
  const totalBreaks = days.reduce((sum, day) => sum + day.break_count, 0);
  const totalSkips = days.reduce((sum, day) => sum + day.skip_count, 0);
  const activeDays = days.filter((day) => day.work_seconds > 0).length;
  const averageWork = activeDays > 0 ? Math.round(totalWork / activeDays) : 0;
  const maxWork = Math.max(...days.map((day) => day.work_seconds), 1);

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">Statistics</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A clear view of your week, one day at a time.</p>
        </div>
        <span className="mt-1 shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">{periodLabel(days)}</span>
      </div>

      {loading && <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">Loading...</p>}

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Summary label="Focus time" value={fmtTime(totalWork)} detail={`${activeDays} active days`} />
            <Summary
              label="Breaks completed"
              value={String(totalBreaks)}
              detail={totalSkips > 0 ? `${totalSkips} skipped` : "none skipped"}
            />
          </div>

          <section className="mt-7">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Daily activity</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Avg. {fmtTime(averageWork)}</p>
            </div>

            <div className="divide-y divide-gray-900/[0.035] rounded-2xl bg-white/25 py-1 dark:divide-white/[0.06] dark:bg-gray-900/15">
              {days.map((day) => (
                <DailyRow key={day.date} day={day} maxWork={maxWork} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
