"use client";

import { useState } from "react";
import type { Todo } from "@/lib/types";
import { formatDate, friendlyName, isOverdue } from "@/lib/format";

const priorityStyles: Record<string, string> = {
  High: "bg-red-50 text-red-700 ring-red-200",
  Medium: "bg-amber-50 text-amber-800 ring-amber-200",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const statusStyles: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-sky-50 text-sky-800 ring-sky-200",
  Complete: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Tracking: "bg-violet-50 text-violet-700 ring-violet-200",
  "Follow-up Needed": "bg-orange-50 text-orange-800 ring-orange-200",
};

export function TaskCard({ todo }: { todo: Todo }) {
  const [expanded, setExpanded] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const overdue = isOverdue(todo.endDate, todo.status);
  const hasNotes = Boolean(todo.notes?.trim());

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition hover:border-navy/20 hover:shadow-md sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
            priorityStyles[todo.priority] || priorityStyles.Medium
          }`}
        >
          {todo.priority || "Medium"}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
            statusStyles[todo.status] || statusStyles["Not Started"]
          }`}
        >
          {todo.status || "Not Started"}
        </span>
        {overdue && (
          <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            Overdue
          </span>
        )}
      </div>

      <h3
        className={`mt-3 text-[15px] font-semibold leading-snug text-slate-900 sm:text-base ${
          expanded ? "" : "line-clamp-2-pretty"
        }`}
      >
        {todo.task}
      </h3>
      {todo.task.length > 90 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-medium text-navy hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
        <span className="font-medium text-slate-800">
          {todo.ballInCourt || "Unassigned court"}
        </span>
        <span className="text-slate-300">·</span>
        <span>{friendlyName(todo.assignedTo)}</span>
        <span className="text-slate-300">·</span>
        <span className={overdue ? "font-semibold text-red-600" : ""}>
          Due {formatDate(todo.endDate)}
        </span>
      </div>

      {hasNotes && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className="text-xs font-semibold uppercase tracking-wide text-navy/80 hover:text-navy"
          >
            {notesOpen ? "Hide notes" : "Notes"}
          </button>
          {notesOpen && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {todo.notes}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
