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
    return (
        <div
            style={{
                writingMode: "vertical-rl",
                width: 64,
                height: 170,
                padding: "18px 10px",
                // ↓ 木目の背景（うっすら縦筋）
                background: "repeating-linear-gradient(90deg, #e3cfa4 0px, #ead9b0 3px, #e3cfa4 6px)",
                color: "#2b2b2b",
                fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', serif",
                fontSize: 24,
                fontWeight: 700,
                border: "3px solid #b08d57",
                borderRadius: 6,
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <span style={{ fontSize: 24, fontWeight: 700 }}>{LABELS[state]}</span>
        </div>
    );
}

  export function Sticky({ text, rotate = -2, small = false }: { text: string; rotate?: number; small?: boolean }) {
    return (
      <div
        style={{
          background: "#f4ecd0",
          color: "#4a3d24",
          fontSize: small ? 11 : 13,
          lineHeight: 1.35,
          padding: small ? "5px 8px" : "8px 11px",
          borderRadius: 3,
          boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
          transform: `rotate(${rotate}deg)`,
          maxWidth: small ? 150 : 260,
          fontFamily: "'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif",
          display: "inline-block",
        }}
      >
        {text}
      </div>
    );
  }