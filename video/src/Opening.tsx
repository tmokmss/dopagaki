import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { BEAT, beatPulse, Burst, Confetti, Flash, outlined } from "./fx";
import { fontFamily } from "./font";

const ICONS = ["🍣", "🍔", "🥚", "👟", "✏️"];
const SLAM = 4 * BEAT;

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame >= SLAM && frame < SLAM + 8 ? (SLAM + 8 - frame) * 3 : 0;

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        translate: `${(random(`sx${frame}`) - 0.5) * shake}px ${(random(`sy${frame}`) - 0.5) * shake}px`,
      }}
    >
      <Burst color="#FF1F1F" />
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 80,
          scale: frame >= SLAM ? beatPulse(frame, 0.12) : 1,
        }}
      >
        {ICONS.map((icon, i) => (
          <div
            key={icon}
            style={{
              fontSize: 150,
              scale: interpolate(frame, [i * 6, i * 6 + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 6 }),
              }),
              rotate: `${Math.sin((frame + i * 10) / 4) * 12}deg`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          lineHeight: 1.05,
          fontSize: 210,
          ...outlined("#000", 26),
          rotate: "-4deg",
          scale: interpolate(frame, [SLAM - 1, SLAM, SLAM + 6], [0, 2.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2)),
          }),
        }}
      >
        まちじかん
        <br />
        <span style={{ ...outlined("#000", 26) }}>ゲーム！</span>
      </div>
      <Sequence from={SLAM} layout="none">
        <Confetti count={90} seed="open" />
      </Sequence>
      <Sequence from={SLAM} layout="none">
        <Flash />
      </Sequence>
    </AbsoluteFill>
  );
};
