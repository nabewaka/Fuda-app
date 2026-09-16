"use client";
import { useState, useEffect } from "react"
import { FudaState, Profile, ScheduleItem } from "./types";
import { Fuda, Sticky } from "./components/Fuda"
import { FRIENDS, MEMBERS } from "./data";
import { collection, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";


function todayString(): string {
  const d = new Date();          // 今の日時
  const y = d.getFullYear();     // 年
  const m = d.getMonth() + 1;    // 月（0 始まりなので +1）
  const day = d.getDate();       // 日
  return `${y}-${m}-${day}`;     // "yyyy-m-d"
}

// 薄緑テーマの色（1か所で管理）
const BG = "radial-gradient(120% 80% at 50% -10%, #eef4e6 0%, #dbe8cf 55%, #c7dbb9 100%)";
const INK = "#2f3d2b";       // 濃い文字
const INK_SUB = "#6a7862";   // 薄い文字
const CARD = "#f4f7ee";      // カード/入力欄の白っぽい背景
const LINE = "#c2d2b2";      // 枠線
const ACCENT = "#5c8a4a";    // 緑のアクセント（ボタン）

// 下から出るポップアップの共通枠
function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(40,50,35,0.4)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto",
          background: "#f6f8f0", borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: "22px 18px 30px", boxShadow: "0 -8px 30px rgba(40,50,35,0.25)",
        }}
      >
        {children}
      </div>
    </div>
  );
}


export default function Home() {
  const [label, setLabel] = useState<FudaState>("prep");// フダの状態
  const [labelDate, setLabelDate] = useState<string>(todayString());// 状態を変化させた日にち

  const [note, setNote] = useState("");// メモの状態
  const [noteDate, setNoteDate] = useState<string>(todayString());// メモの状態を変化させた日にち
  const [postedNote, setPostedNote] = useState("");

  const [myselected, setMySelected] = useState<boolean>(false);// 誰かを選んでいるか
  const [selected, setSelected] = useState<Profile | null>(null);// 誰かを選んでいるか

  const [uid, setUid] = useState<string | null>(null);// ログインした人のid
  const [myName, setMyName] = useState<string | null>(null);// ログインした人の名前 
  const [myLab, setMyLab] = useState<string | null>(null);// ログインした人の名前 

  const [mySchedule, setMySchedule] = useState<ScheduleItem[]>([]);//スケジュール
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [title, setTitle] = useState("");

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

  // 自分の予定を読み込み
  useEffect(() => {
    if (!uid) return;              // uidがまだ無いなら何もしない
    const load = async () => {
      const ref = doc(db, "profiles", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMySchedule(snap.data().schedule || []);   // 読んで mySchedule に入れる
      }
    };
    load();
  }, [uid]);

  const inputStyle = {
    background: CARD, border: `1px solid ${LINE}`, borderRadius: 10,
    padding: "10px 12px", color: INK, fontSize: 14, outline: "none",
  } as const;


  if (!myName) {
    return (
      <div
        style={{
          minHeight: "100vh", background: BG,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontFamily: "system-ui,-apple-system,'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
          padding: 20,
        }}
      >
        <div style={{ fontFamily: "'Hiragino Mincho ProN','Yu Mincho',serif", fontSize: 28, color: INK, letterSpacing: 4, marginBottom: 8 }}>
          研究室のフダ
        </div>
        <div style={{ color: INK_SUB, fontSize: 13, marginBottom: 28 }}>誕生日4桁でログイン</div>
        <input
          style={{ ...inputStyle, fontSize: 16, textAlign: "center", letterSpacing: 4, width: 160 }}
          placeholder="0000"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={() => {
            const member = MEMBERS[input];
            if (member) { setMyName(member.name); setMyLab(member.lab); }
            else alert("該当者がいません");
          }}
          style={{ marginTop: 14, background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 15, cursor: "pointer" }}
        >
          ログイン
        </button>
      </div>
    );
  }

const shownMyLabel: FudaState = labelDate === todayString() ? label : "prep";
  return (
    <div
      style={{
        minHeight: "100vh", background: BG, padding: "28px 18px 48px",
        fontFamily: "system-ui,-apple-system,'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Hiragino Mincho ProN','Yu Mincho',serif", fontSize: 24, color: INK, letterSpacing: 4 }}>
            研究室のフダ
          </div>
        </header>
 
        {/* ── 自分のエリア ── */}
        <section
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingBottom: 24, marginBottom: 24, borderBottom: `1px solid ${LINE}`,
          }}
        >
          <div style={{ color: INK, fontSize: 14, marginBottom: 12, fontWeight: 600 }}>{myName}・{myLab}</div>
 
          <div
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const i = ORDER.indexOf(label);
              const next = ORDER[(i + 1) % ORDER.length];
              setLabel(next);
              setLabelDate(todayString());
              if (!uid) return;
              const ref = doc(db, "presences", uid);
              await setDoc(ref, {
                name: myName, lab: myLab, state: next, stateDate: todayString(),
                note: postedNote ? { text: postedNote, date: noteDate } : null,
              });
            }}
          >
            <Fuda state={shownMyLabel} />
          </div>
          <div style={{ color: INK_SUB, fontSize: 12, marginTop: 8 }}>札をタップして切り替え</div>
 
          {postedNote && noteDate === todayString() && (
            <div style={{ marginTop: 16 }}>
              <Sticky text={postedNote} />
            </div>
          )}
 
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, width: "100%", maxWidth: 340 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="例）昼ごはん行く人募集中！"
              value={note}
              onChange={(e) => { setNote(e.target.value); setNoteDate(todayString()); }}
            />
            <button
              style={{ background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}
              onClick={async () => {
                if (!uid) return;
                const ref = doc(db, "presences", uid);
                await setDoc(ref, { note: note ? { text: note, date: todayString() } : null }, { merge: true });
                setPostedNote(note);
                setNoteDate(todayString());
                setNote("");
              }}
            >
              貼る
            </button>
          </div>
 
          <button
            onClick={() => setMySelected(true)}
            style={{ marginTop: 14, background: "transparent", border: "none", color: INK_SUB, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}
          >
            自分の予定・TA業務を編集
          </button>
        </section>
 
        {/* ── 友達エリア（2列グリッド） ── */}
        <div style={{ color: INK_SUB, fontSize: 13, marginBottom: 16, paddingLeft: 2 }}>友達</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 24, columnGap: 12, justifyItems: "center" }}>
          {remoteFudas.filter((f) => f.id !== uid && f.name).map((f) => (
            <button
              key={f.id}
              onClick={async () => {
                const ref = doc(db, "profiles", f.id);
                const snap = await getDoc(ref);
                setSelected({
                  name: f.name, lab: f.lab,
                  schedule: snap.exists() ? (snap.data().schedule || []) : [],
                } as Profile);
              }}
              style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", padding: 0 }}
            >
              <Fuda state={f.state} />
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <div style={{ color: INK, fontSize: 15, fontWeight: 600 }}>{f.name}</div>
                <div style={{ color: INK_SUB, fontSize: 12, marginTop: 2 }}>{f.lab}</div>
              </div>
              {f.note && (
                <div style={{ marginTop: 8 }}>
                  <Sticky text={f.note.text} small rotate={2} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
 
      {/* ── 自分の予定編集ポップアップ ── */}
      {myselected && (
        <Sheet onClose={() => setMySelected(false)}>
          <div style={{ color: INK, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>予定・TA業務</div>
 
          {mySchedule.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "10px 12px", borderRadius: 10, border: `1px solid ${LINE}` }}>
              <span style={{ flex: 1, color: INK, fontSize: 14 }}>{item.day} {item.slot} {item.title}</span>
              <button
                onClick={() => setMySchedule(mySchedule.filter((_, i) => i !== index))}
                style={{ background: "transparent", border: "none", color: "#b0492f", cursor: "pointer", fontSize: 13 }}
              >
                削除
              </button>
            </div>
          ))}
 
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input placeholder="曜日" value={day} onChange={(e) => setDay(e.target.value)} style={{ ...inputStyle, width: 56 }} />
            <input placeholder="時限" value={slot} onChange={(e) => setSlot(e.target.value)} style={{ ...inputStyle, width: 64 }} />
            <input placeholder="内容" value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
 
          <button
            onClick={() => {
              if (!day || !slot || !title) return;
              const item: ScheduleItem = { day, slot, title, kind: "other" };
              setMySchedule([...mySchedule, item]);
              setDay(""); setSlot(""); setTitle("");
            }}
            style={{ marginTop: 12, background: CARD, color: INK, border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 16px", fontSize: 14, cursor: "pointer" }}
          >
            予定を追加
          </button>
 
          <button
            onClick={async () => {
              if (!uid) return;
              const ref = doc(db, "profiles", uid);
              await setDoc(ref, { schedule: mySchedule }, { merge: true });
              alert("予定を保存しました");
            }}
            style={{ marginTop: 12, marginLeft: 8, background: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, cursor: "pointer" }}
          >
            予定を保存
          </button>
        </Sheet>
      )}
 
      {/* ── 友達の詳細ポップアップ ── */}
      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: INK, fontSize: 20, fontWeight: 700 }}>{selected.name}</div>
            <div style={{ color: INK_SUB, fontSize: 13, marginTop: 2 }}>{selected.lab}</div>
          </div>
 
          <div style={{ color: INK_SUB, fontSize: 13, marginBottom: 12 }}>定期予定・TA業務</div>
          {selected.schedule && selected.schedule.length > 0 ? (
            selected.schedule.map((item, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: "10px 12px", borderRadius: 10, border: `1px solid ${LINE}` }}>
                <span style={{ color: INK, fontSize: 14, fontWeight: 700, width: 24 }}>{item.day}</span>
                <span style={{ color: INK_SUB, fontSize: 13, width: 48 }}>{item.slot}</span>
                <span style={{ flex: 1, color: INK, fontSize: 14 }}>{item.title}</span>
              </div>
            ))
          ) : (
            <div style={{ color: INK_SUB, fontSize: 13 }}>登録された予定はまだありません。</div>
          )}
        </Sheet>
      )}
    </div>
  );
}
 
