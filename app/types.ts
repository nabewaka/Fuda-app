export type FudaState = "prep" | "work" | "lunch" | "closed";

export type ScheduleKind = "seminar" | "ta" | "other";

export interface Note {
  text: string;
  date: string;
}

export interface Presence {
  state: FudaState;
  stateDate: string;
  note: Note | null;
}

export interface ScheduleItem {
  day: "月" | "火" | "水" | "木" | "金";
  slot: string;   // "3限" でも "10:30" でもOK
  title: string;
  kind: ScheduleKind;
}

export interface Profile {
  name: string;
  lab: string;
  schedule: ScheduleItem[];
}