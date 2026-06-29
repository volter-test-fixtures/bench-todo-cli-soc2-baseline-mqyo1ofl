/** Represents a single todo task persisted to disk. */
export interface Task {
  id: number;
  description: string;
  done: boolean;
}