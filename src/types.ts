/** A single task in the todo list. */
export interface Task {
  id: number;
  description: string;
  done: boolean;
}

/** The persisted data model. */
export interface TaskStore {
  nextId: number;
  tasks: Task[];
}