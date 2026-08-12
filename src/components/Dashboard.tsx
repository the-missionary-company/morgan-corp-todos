"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Todo, TodosResponse } from "@/lib/types";
import { formatRefreshed } from "@/lib/format";
import { TaskCard } from "./TaskCard";

const SMARTSHEET_URL =
  "https://app.smartsheet.com/sheets/5hXVPJrc2wgHg55mvG8RQ7f9G295xc9w5jhHF4H1";

const PRIORITIES = ["All", "High", "Medium", "Low"] as const;
const STATUSES = [
  "All",
  "Not Started",
  "In Progress",
  "Follow-up Needed",
  "Tracking",
  "Complete",
] as const;

const PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_RANK: Record<string, number> = {
  "In Progress": 0,
  "Follow-up Needed": 1,
  Tracking: 2,
  "Not Started": 3,
  Complete: 4,
};

function normalizeCourt(value: string): string {
  const v = (value || "").trim();
  if (!v) return "Unassigned";
  if (v.toLowerCase() === "little") return "Little";
  if (v.toLowerCase() === "omega") return "Omega";
  if (v.toLowerCase().startsWith("omega")) return "Omega Construction";
  return v;
}

function sortTodos(items: Todo[]): Todo[] {
  return [...items].sort((a, b) => {
    const pr = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
    if (pr !== 0) return pr;
    const sr = (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9);
    if (sr !== 0) return sr;
    return a.task.localeCompare(b.task);
  });
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
        active
          ? "bg-navy text-white shadow-sm"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-navy/5 hover:ring-navy/30"
      }`}
    >
      {children}
    </button>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="min-w-[140px] flex-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${tone || "text-navy"}`}>
        {value}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<TodosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<string>("All");
  const [status, setStatus] = useState<string>("Open");
  const [courts, setCourts] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/todos", { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as TodosResponse;
      setData(json);
      if (json.error) setError(json.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const todos = useMemo(() => data?.todos ?? [], [data]);

  const kpis = useMemo(() => {
    const open = todos.filter((t) => t.status !== "Complete" && !t.complete);
    return {
      open: open.length,
      high: open.filter((t) => t.priority === "High").length,
      inProgress: todos.filter((t) => t.status === "In Progress").length,
      followUp: todos.filter((t) => t.status === "Follow-up Needed").length,
      complete: todos.filter((t) => t.status === "Complete" || t.complete).length,
    };
  }, [todos]);

  const courtOptions = useMemo(() => {
    const set = new Set<string>();
    todos.forEach((t) => set.add(normalizeCourt(t.ballInCourt)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [todos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = todos.filter((t) => {
      const isComplete = t.status === "Complete" || t.complete;
      if (status === "Open" && isComplete) return false;
      if (status !== "All" && status !== "Open" && t.status !== status) return false;
      if (priority !== "All" && t.priority !== priority) return false;
      if (courts.length > 0 && !courts.includes(normalizeCourt(t.ballInCourt))) {
        return false;
      }
      if (!q) return true;
      const hay = [t.task, t.assignedTo, t.ballInCourt, t.notes, t.status, t.priority]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    return sortTodos(items);
  }, [todos, query, priority, status, courts]);

  const toggleCourt = (court: string) => {
    setCourts((prev) =>
      prev.includes(court) ? prev.filter((c) => c !== court) : [...prev, court]
    );
  };

  const demoMode = data?.source === "fallback";

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-card backdrop-blur sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Morgan Corp Office
              </h1>
              <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                2614
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">Action items</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:text-sm">
              <span>
                Last refreshed{" "}
                <span className="font-medium text-slate-700">
                  {formatRefreshed(data?.fetchedAt)}
                </span>
              </span>
              {demoMode && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800 ring-1 ring-amber-200">
                  Demo data — connect Smartsheet token for live
                </span>
              )}
              {data?.source === "smartsheet" && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Live from Smartsheet
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-600 disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <a
              href={SMARTSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-navy ring-1 ring-slate-200 transition hover:bg-navy/5"
            >
              Open in Smartsheet
            </a>
          </div>
        </div>
      </header>

      <section className="mt-5 flex gap-3 overflow-x-auto pb-1">
        <Kpi label="Open" value={kpis.open} />
        <Kpi label="High priority open" value={kpis.high} tone="text-red-600" />
        <Kpi label="In Progress" value={kpis.inProgress} tone="text-sky-700" />
        <Kpi label="Follow-up Needed" value={kpis.followUp} tone="text-orange-700" />
        <Kpi label="Complete" value={kpis.complete} tone="text-emerald-700" />
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <label className="sr-only" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, people, notes…"
              className="w-full rounded-xl border border-slate-200 bg-sand-50 px-4 py-2.5 text-sm outline-none ring-navy/30 placeholder:text-slate-400 focus:border-navy/40 focus:ring-2"
            />
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Priority
            </div>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>
                  {p}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Status
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip active={status === "Open"} onClick={() => setStatus("Open")}>
                Open (hide Complete)
              </Chip>
              {STATUSES.map((s) => (
                <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Ball in Court
              </div>
              {courts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCourts([])}
                  className="text-xs font-medium text-navy hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {courtOptions.map((c) => (
                <Chip key={c} active={courts.includes(c)} onClick={() => toggleCourt(c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Tasks
          </h2>
          <span className="text-sm text-slate-500">
            {loading ? "Loading…" : `${filtered.length} shown`}
          </span>
        </div>

        {loading && !data && (
          <div className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white/70"
              />
            ))}
          </div>
        )}

        {!loading && error && !todos.length && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
            <div className="font-semibold">Couldn’t load action items</div>
            <p className="mt-1 opacity-90">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && data && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
            <div className="text-base font-semibold text-slate-800">No matching items</div>
            <p className="mt-1 text-sm text-slate-500">
              Try clearing filters or switching Status to All.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {filtered.map((todo) => (
            <TaskCard key={todo.id} todo={todo} />
          ))}
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-slate-500">
        Read-only prototype · Data from Smartsheet · StoreyPM
      </footer>
    </div>
  );
}
