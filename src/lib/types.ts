export type Priority = "High" | "Medium" | "Low" | string;
export type Status =
  | "Not Started"
  | "In Progress"
  | "Complete"
  | "Tracking"
  | "Follow-up Needed"
  | string;

export interface Todo {
  id: string;
  complete: boolean;
  task: string;
  assignedTo: string;
  ballInCourt: string;
  startDate: string | null;
  endDate: string | null;
  priority: Priority;
  status: Status;
  notes: string;
}

export interface TodosResponse {
  source: "smartsheet" | "fallback";
  fetchedAt: string;
  sheetId?: string;
  sheetName?: string;
  todos: Todo[];
  error?: string;
}
