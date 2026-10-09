import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { BEAT, beatPulse, Burst, Confetti, Flash, outlined } from "./fx";
import { fontFamily } from "./font";

const POINTS = ["タップだけ！", "ゲームオーバーなし！", "インストール不要！"];
const URL_AT = 3 * BEAT;
const FINALE = 4 * BEAT;

export const Ending: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Burst color="#4FCBFF" />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
        }}
      >
        {POINTS.map((p, i) => (
          <div
            key={p}
            style={{
              fontSize: 88,
              whiteSpace: "nowrap",
              ...outlined("#000", 20),
              rotate: `${i % 2 ? 3 : -3}deg`,
              scale: interpolate(frame, [i * BEAT, i * BEAT + 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.back(3)),
              }),
            }}
          >
            ✅ {p}
          </div>
        ))}
        <div
          style={{
            marginTop: 70,
            padding: "34px 54px",
            borderRadius: 40,
            background: "white",
            color: "#000",
            border: "10px solid #000",
            boxShadow: "16px 16px 0 #000",
            fontSize: 58,
            rotate: "-2deg",
            scale:
              interpolate(frame, [URL_AT, URL_AT + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.back(3)),
              }) * (frame >= FINALE ? beatPulse(frame, 0.08) : 1),
          }}
        >
          tmokmss.github.io/dopagaki
        </div>
      </AbsoluteFill>
      <Sequence from={FINALE} layout="none">
        <Confetti count={120} seed="end" />
      </Sequence>
      <Sequence from={FINALE} layout="none">
        <Flash />
      </Sequence>
    </AbsoluteFill>
  );
};
