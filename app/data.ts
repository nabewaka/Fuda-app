import { FudaState, ScheduleItem } from "./types";

// 友達の名前と状態
export const FRIENDS: { name: string; state: FudaState; lab: string; schedule: ScheduleItem[] }[] = [
  {
    name: "A",
    state: "work",
    lab: "有機化学",
    schedule: [
      { day: "火", slot: "2限", title: "有機化学TA", kind: "ta" },
      { day: "月", slot: "3限", title: "研究室ゼミ", kind: "seminar" },
    ],
  },
  {
    name: "B",
    state: "work",
    lab: "有機化学",
    schedule: [
      { day: "火", slot: "2限", title: "有機化学TA", kind: "ta" },
      { day: "月", slot: "3限", title: "研究室ゼミ", kind: "seminar" },
    ],
  },
]
export const MEMBERS: Record<string, { name: string; lab: string }> = {
  "0325": { name: "たかし", lab: "有機化学" },
  "1111": { name: "みお",   lab: "情報工学" },
}