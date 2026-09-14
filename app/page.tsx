"use client";
import { useState, useEffect } from "react"
import { FudaState, Profile } from "./types";
import { Fuda } from "./components/Fuda"
import { FRIENDS } from "./data";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";


function todayString(): string {
  const d = new Date();          // 今の日時
  const y = d.getFullYear();     // 年
  const m = d.getMonth() + 1;    // 月（0 始まりなので +1）
  const day = d.getDate();       // 日
  return `${y}-${m}-${day}`;     // "yyyy-m-d"
}


export default function Home() {
  const [label, setLabel] = useState<FudaState>("prep");
  const [labelDate, setLabelDate] = useState<string>(todayString());
  const [note, setNote] = useState("");
  const [noteDate, setNoteDate] = useState<string>(todayString());
  const [selected, setSelected] = useState<Profile | null>(null);
  const ORDER: FudaState[] = ["prep", "work", "lunch", "closed"];

  const [remoteFudas, setRemoteFudas] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "presences"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("受け取ったデータ:", data);   // ← これを足す
    setRemoteFudas(data);
    });
    return () => unsub();   // 後片付け（後述）
  }, []);

  return (
    <div>
      <button onClick={async () => {// ボタンクリックでふだの状態が変化
        const i = ORDER.indexOf(label);
        const next = ORDER[(i + 1) % ORDER.length];  // 次へ。最後なら0に戻る
        setLabel(next);
        setLabelDate(todayString());

        const ref = doc(db, "presences", "me");  // 自分のカード
        await setDoc(ref, {                       // 書き込み
          state: next,
          stateDate: todayString(),
          note: null,
        });
      }
      }> <Fuda state={labelDate === todayString() ? label : "prep"} /></button>

      <input value={note} onChange={(e) => {
        setNote(e.target.value);
        setNoteDate(todayString());
      }} />
      {note && noteDate === todayString() && <p>{note}</p>}


      <div>
        {FRIENDS.map((friend) => (// 友達を並べる。タップしたら詳細を開く
          <div key={friend.name} onClick={() => setSelected(friend)}>
            <h3>{friend.name}</h3>
            <Fuda state={friend.state} />
          </div>
        ))}

        {remoteFudas.map((f) => (
          <div key={f.id}>
            <h3>{f.id}</h3>
            <Fuda state={f.state} />
          </div>
        ))}
      </div>

      {selected && <div> {/** タップしたらの部分 */}
        <button onClick={() => setSelected(null)}> 閉じる </button>

        <h2>{selected.name}</h2>
        <p>{selected.lab}</p>
        {selected.schedule.map((item, index) => (// 友達を並べる。タップしたら詳細を開く
          <div key={index}>
            <h3>{item.day} {item.slot} {item.title} {item.kind}</h3>

          </div>
        ))}

      </div>}



    </div>
  );
}