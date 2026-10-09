import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const BEAT = 12;

export const beatPulse = (frame: number, amount: number) =>
  1 + amount * Math.exp(-((frame % BEAT) / BEAT) * 6);

const RAYS = [
  0, 9, 14, 31, 38, 52, 60, 79, 83, 104, 117, 131, 136, 158, 170, 188, 195, 214,
  226, 241, 249, 268, 281, 297, 304, 323, 335, 350,
];

export const Burst: React.FC<{ readonly color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const stops = RAYS.map(
    (d, i) => `${i % 2 ? "transparent" : "rgba(255,255,255,0.2)"} ${d}deg`,
  ).join(", ");
  return (
    <AbsoluteFill style={{ background: color, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${frame * 0.9}deg at -60px 360px, ${stops}, transparent 360deg)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${-frame * 0.5}deg at 50% 45%, ${stops}, transparent 360deg)`,
          opacity: 0.5,
        }}
      />
      {Array.from({ length: 14 }, (_, i) => {
        const r = (k: string) => random(`shard-${i}-${k}`);
        const size = 30 + r("s") * 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left:
                ((r("x") * width + frame * (2 + r("v") * 4)) % (width + 200)) -
                100,
              top: r("y") * height - frame * (1 + r("u") * 3),
              width: size,
              height: size,
              background: "rgba(255,255,255,0.3)",
              clipPath:
                r("t") > 0.5 ? "polygon(50% 0, 100% 100%, 0 100%)" : undefined,
              rotate: `${frame * (r("spin") - 0.5) * 8}deg`,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background: "white",
          opacity: 0.18 * Math.exp(-((frame % BEAT) / BEAT) * 8),
        }}
      />
    </AbsoluteFill>
  );
};

const CONFETTI_COLORS = ["#FFFFFF", "#FFFFFF", "#000000"];

export const Confetti: React.FC<{
  readonly count: number;
  readonly seed: string;
}> = ({ count, seed }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const vx = (r("vx") - 0.5) * 50;
        const vy = -25 - r("vy") * 35;
        const t = frame;
        const x = width / 2 + vx * t;
        const y = height * 0.45 + vy * t + 1.1 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 18 + r("w") * 18,
              height: 10 + r("h") * 14,
              borderRadius: r("round") > 0.6 ? 999 : 3,
              background:
                CONFETTI_COLORS[Math.floor(r("c") * CONFETTI_COLORS.length)],
              rotate: `${t * (r("spin") - 0.5) * 40}deg`,
              opacity: y > height + 50 ? 0 : 1,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: "white",
        opacity: interpolate(frame, [0, 5], [0.9, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        pointerEvents: "none",
      }}
    />
  );
};

export const outlined = (
  stroke: string,
  width: number,
): React.CSSProperties => ({
  color: "white",
  WebkitTextStroke: `${width}px ${stroke}`,
  paintOrder: "stroke fill",
  textShadow: `0 ${width / 2}px 0 ${stroke}`,
});
