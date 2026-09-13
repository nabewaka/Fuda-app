 import { FudaState } from "../types";

 // 表示するテキスト
 const LABELS = {
   prep: "営業準備中",
   work: "研究中",
   lunch: "昼休憩中",
   closed: "営業終了",
 };

 // 状態から名前へ
export function Fuda({ state }: { state: FudaState }) {
  return <span>{LABELS[state]}</span>

}