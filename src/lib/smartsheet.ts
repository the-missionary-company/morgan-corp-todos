import { readFile } from "fs/promises";
import path from "path";
import type { Todo, TodosResponse } from "./types";

const SHEET_ID =
  process.env.SMARTSHEET_SHEET_ID?.trim() || "7586973395931012";
const API_BASE = "https://api.smartsheet.com/2.0";

type SmartsheetCell = {
  columnId?: number;
  columnIndex?: number;
  value?: unknown;
  displayValue?: string;
};

type SmartsheetColumn = {
  id: number;
  index: number;
  title: string;
  type?: string;
};

type SmartsheetRow = {
  id: number;
  cells: SmartsheetCell[];
};

type SmartsheetSheet = {
  id: number;
  name: string;
  columns: SmartsheetColumn[];
  rows: SmartsheetRow[];
};

function cellText(cell: SmartsheetCell | undefined): string {
  if (!cell) return "";
  if (cell.displayValue != null && String(cell.displayValue).trim() !== "") {
    return String(cell.displayValue).trim();
  }
  if (cell.value == null) return "";
  if (typeof cell.value === "boolean") return cell.value ? "true" : "";
  return String(cell.value).trim();
}

function cellBool(cell: SmartsheetCell | undefined): boolean {
  if (!cell) return false;
  if (typeof cell.value === "boolean") return cell.value;
  const t = cellText(cell).toLowerCase();
  return t === "true" || t === "1" || t === "yes" || t === "checked";
}

function cellDate(cell: SmartsheetCell | undefined): string | null {
  const raw = cellText(cell);
  if (!raw) return null;
  // Smartsheet dates often YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function mapSheet(sheet: SmartsheetSheet): Todo[] {
  const byTitle = new Map(
    sheet.columns.map((c) => [c.title.trim().toLowerCase(), c.index])
  );
  const idx = (title: string) => byTitle.get(title.toLowerCase());

  const iComplete = idx("Complete");
  const iTasks = idx("Tasks");
  const iAssigned = idx("Assigned To");
  const iBall = idx("Ball in Court");
  const iStart = idx("Start Date");
  const iEnd = idx("End Date");
  const iPriority = idx("Priority");
  const iStatus = idx("Status");
  const iNotes = idx("Notes");

  const todos: Todo[] = [];
  for (const row of sheet.rows || []) {
    const cells = row.cells || [];
    const at = (i: number | undefined) =>
      i == null ? undefined : cells.find((c) => c.columnIndex === i) ?? cells[i];

    const task = cellText(at(iTasks));
    if (!task || task.toLowerCase() === "task") continue;

    const status = cellText(at(iStatus)) || "Not Started";
    const complete =
      cellBool(at(iComplete)) || status.toLowerCase() === "complete";

    todos.push({
      id: String(row.id),
      complete,
      task,
      assignedTo: cellText(at(iAssigned)),
      ballInCourt: cellText(at(iBall)),
      startDate: cellDate(at(iStart)),
      endDate: cellDate(at(iEnd)),
      priority: cellText(at(iPriority)) || "Medium",
      status,
      notes: cellText(at(iNotes)),
    });
  }
  return todos;
}

async function loadFallback(error?: string): Promise<TodosResponse> {
  const file = path.join(process.cwd(), "data", "fallback.json");
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw) as TodosResponse;
  return {
    ...data,
    source: "fallback",
    fetchedAt: data.fetchedAt || new Date().toISOString(),
    error,
  };
}

export async function getTodos(): Promise<TodosResponse> {
  const token = process.env.SMARTSHEET_ACCESS_TOKEN?.trim();
  if (!token) {
    return loadFallback();
  }

  try {
    const res = await fetch(`${API_BASE}/sheets/${SHEET_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return loadFallback(
        `Smartsheet HTTP ${res.status}${body ? `: ${body.slice(0, 180)}` : ""}`
      );
    }

    const sheet = (await res.json()) as SmartsheetSheet;
    return {
      source: "smartsheet",
      fetchedAt: new Date().toISOString(),
      sheetId: String(sheet.id ?? SHEET_ID),
      sheetName: sheet.name || "Morgan Corp To Do Tracking",
      todos: mapSheet(sheet),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown fetch error";
    return loadFallback(msg);
  }
}
