import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { beatPulse, Burst, Confetti, Flash, outlined } from "./fx";
import { fontFamily } from "./font";

export type GameSceneProps = {
  readonly clip: string;
  readonly icon: string;
  readonly title: string;
  readonly caption: string;
  readonly color: string;
  readonly trimBefore: number;
  readonly playbackRate: number;
};

export const GameScene: React.FC<GameSceneProps> = ({
  clip,
  icon,
  title,
  caption,
  color,
  trimBefore,
  playbackRate,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center" }}>
      <Burst color={color} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          scale: interpolate(frame, [0, 6], [1.25, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
        }}
      >
        <div
          style={{
            marginTop: 100,
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 110,
            ...outlined("#000", 20),
            rotate: "-3deg",
            scale: interpolate(frame, [0, 8], [0.3, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.back(3)),
            }),
          }}
        >
          <span
            style={{
              fontSize: 130,
              rotate: `${Math.sin(frame / 3) * 15}deg`,
              display: "inline-block",
            }}
          >
            {icon}
          </span>
          {title}
        </div>
        <div
          style={{
            marginTop: 30,
            width: 576,
            height: 1246,
            borderRadius: 64,
            border: "18px solid white",
            outline: "10px solid #000",
            overflow: "hidden",
            background: "#FBF8F1",
            boxShadow: "24px 28px 0 #000",
            rotate: `${Math.sin(frame / 10) * 2.5}deg`,
            scale: beatPulse(frame, 0.035),
          }}
        >
          <Video
            src={staticFile(clip)}
            trimBefore={trimBefore}
            playbackRate={playbackRate}
            muted
            premountFor={fps}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          fontSize: 104,
          ...outlined("#000", 22),
          rotate: "4deg",
          scale:
            interpolate(frame, [10, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.back(3)),
            }) * beatPulse(Math.max(frame - 10, 0), 0.06),
        }}
      >
        {caption}
      </div>
      <Confetti count={40} seed={clip} />
      <Flash />
    </AbsoluteFill>
  );
};
