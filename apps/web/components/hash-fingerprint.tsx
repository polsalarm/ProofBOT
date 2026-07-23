import type { CSSProperties } from "react";

const SAMPLE_HASH = "8d5f6f426a75102e85973aa40119af924fcb10e9c9186f950c89ec58e12c7d4a";
const COLORS = ["#82aee8", "#4dc4b1", "#e39162", "#c7d7d8"];

type CellStyle = CSSProperties & {
  "--cell-color": string;
  "--cell-opacity": number;
};

export function HashFingerprint({ hash, label = "Hash fingerprint" }: { hash?: string; label?: string }) {
  const digest = (hash?.replace(/^0x/, "") || SAMPLE_HASH).padEnd(64, "0").slice(0, 64);

  return (
    <div className="hash-fingerprint" aria-label={label} role="img">
      {[...digest].map((character, index) => {
        const value = Number.parseInt(character, 16) || 0;
        const style: CellStyle = {
          "--cell-color": COLORS[(value + index) % COLORS.length],
          "--cell-opacity": 0.26 + (value / 15) * 0.74,
        };
        return <span className="hash-cell" style={style} key={`${index}-${character}`} aria-hidden="true" />;
      })}
    </div>
  );
}
