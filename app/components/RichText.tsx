import type { ReactNode } from "react";

export type Pen = "blue" | "red" | "pink";
export const PENS: Record<Pen, string> = { blue: "#4f7cf0", red: "#ee4b52", pink: "#f06cae" };

// A small hand-drawn squiggle tile. Two strokes of different weight plus a little
// noise displacement give it the uneven look of a pen.
const scribble = (color: string) => {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='12' viewBox='0 0 64 12'>` +
    `<defs><filter id='r' x='-5%' y='-30%' width='110%' height='160%'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' seed='4'/>` +
    `<feDisplacementMap in='SourceGraphic' scale='1.8'/></filter></defs>` +
    `<g fill='none' stroke='${color}' stroke-linecap='round' stroke-linejoin='round' filter='url(#r)'>` +
    `<path d='M1 7 Q6 2 11 7 T21 6 T31 8 T41 5 T51 7 T63 6' stroke-width='2.2'/>` +
    `<path d='M0 8.5 Q9 5 18 8 T36 7 T54 8.5 T64 7.5' stroke-width='1.2' opacity='.6'/>` +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export default function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[\[(blue|red|pink):([\s\S]*?)\]\]/g;
  let last = 0, i = 0, m: RegExpExecArray | null;

  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <span
        key={i++}
        style={{
          backgroundImage: scribble(PENS[m[1] as Pen]),
          backgroundRepeat: "repeat-x",
          backgroundPosition: "0 100%",
          backgroundSize: "64px 12px",
          paddingBottom: 5,
          boxDecorationBreak: "clone",          // keeps the underline when a phrase wraps onto a second line
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {m[2]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}