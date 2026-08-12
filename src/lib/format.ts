export function friendlyName(value: string): string {
  if (!value) return "Unassigned";
  if (!value.includes("@")) return value;
  const local = value.split("@")[0] || value;
  return local
    .replace(/[._]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "No due date";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(endDate: string | null | undefined, status: string): boolean {
  if (!endDate) return false;
  if ((status || "").toLowerCase() === "complete") return false;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayIso = `${y}-${m}-${day}`;
  return endDate < todayIso;
}

export function formatRefreshed(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
