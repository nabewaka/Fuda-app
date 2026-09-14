import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// ① どのカードに書くかを指す
const ref = doc(db, "presences", "taro");

// ② そのカードに中身を書き込む
await setDoc(ref, { state: "work", stateDate: "2026-9-13", note: null });