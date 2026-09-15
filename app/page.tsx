"use client";
import { useState, useEffect } from "react"
import { FudaState, Profile } from "./types";
import { Fuda } from "./components/Fuda"
import { FRIENDS, MEMBERS } from "./data";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";


function todayString(): string {
  const d = new Date();          // 今の日時
  const y = d.getFullYear();     // 年
  const m = d.getMonth() + 1;    // 月（0 始まりなので +1）
  const day = d.getDate();       // 日
  return `${y}-${m}-${day}`;     // "yyyy-m-d"
}


export default function Home() {
  const [label, setLabel] = useState<FudaState>("prep");// フダの状態
  const [labelDate, setLabelDate] = useState<string>(todayString());// 状態を変化させた日にち
  const [note, setNote] = useState("");// メモの状態
  const [noteDate, setNoteDate] = useState<string>(todayString());// メモの状態を変化させた日にち
  const [selected, setSelected] = useState<Profile | null>(null);// 誰かを選んでいるか
  const [uid, setUid] = useState<string | null>(null);// ログインした人のid
  const [myName, setMyName] = useState<string | null>(null);// ログインした人の名前 
  const [myLab, setMyLab] = useState<string | null>(null);// ログインした人の名前 
  const [input, setInput] = useState("");

  const ORDER: FudaState[] = ["prep", "work", "lunch", "closed"];


  const [remoteFudas, setRemoteFudas] = useState<any[]>([]);

  useEffect(() => {
    signInAnonymously(auth).catch((e) => console.log("ログイン失敗:", e));
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log("ログイン状態:", user ? user.uid : "未ログイン");
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);

  // 購読
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "presences"), (snapshot) => {
      setRemoteFudas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  if (!myName) {
    return (
      <div>
        <input style={{ border: "1px solid #ccc", marginLeft: 8 }} value={input} onChange={(e) => setInput(e.target.value)} />
        <button
          onClick={() => {
            const member = MEMBERS[input];
            if (member) {
              setMyName(member.name);
              setMyLab(member.lab);
            } else {
              alert("該当者がいません");
            }
          }}
        >
          ログイン
        </button>
      </div>
    );
  }
  const box = {
    padding: 16,
    marginBottom: 16,
    border: "1px solid #ccc",
    borderRadius: 8,
  };

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
      <p>{myName}:{myLab}</p>
      <div style={box}>
        <button onClick={async () => {
          const i = ORDER.indexOf(label);
          const next = ORDER[(i + 1) % ORDER.length];
          setLabel(next);
          setLabelDate(todayString());
          if (!uid) return;
          const ref = doc(db, "presences", uid);
          await setDoc(ref, { name: myName, lab:myLab, state: next, stateDate: todayString(), note: note ? { text: note, date: noteDate } : null });
        }}>
          <Fuda state={labelDate === todayString() ? label : "prep"} />
        </button>

        <input
          style={{ border: "1px solid #ccc", marginLeft: 8 }}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setNoteDate(todayString());
          }}
        />
        <button style={box} onClick={async () => {
          if (!uid) return; 
          const ref = doc(db, "presences", uid);
          await setDoc(ref, { note: note ? { text: note, date: todayString() } : null }, { merge: true });// margeによって他の部分はそのまま

        }}>
          貼る
        </button>
        {note && noteDate === todayString() && <p>{note}</p>}
      </div>

      {/* 友達エリア*/}
      <div>
        {remoteFudas.filter((f) => f.id !== uid).map((f) => (
          <div style={box} key={f.id} onClick={() => setSelected(f)}>
            <h3>{f.name}:{f.lab}</h3>
            <Fuda state={f.state} />
            {f.note && <p>💬 {f.note.text}</p>}
          </div>
        ))}
      </div>

      {/* 詳細シート */}
      {selected && (
        <div style={box}>
          <button onClick={() => setSelected(null)}>閉じる</button>
          <h2>{selected.name}</h2>
          <p>{selected.lab}</p>
          {selected.schedule && selected.schedule.map((item, index) => (
            <div key={index}>
              <h3>{item.day} {item.slot} {item.title} {item.kind}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}