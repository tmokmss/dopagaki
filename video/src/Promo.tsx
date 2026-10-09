import { Audio } from "@remotion/media";
import { Series, staticFile, useVideoConfig } from "remotion";
import { Ending } from "./Ending";
import { BEAT } from "./fx";
import { GameScene } from "./GameScene";
import { Opening } from "./Opening";

export const Promo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Series>
        <Series.Sequence
          name="Opening"
          durationInFrames={8 * BEAT}
          premountFor={fps}
        >
          <Opening />
        </Series.Sequence>
        <Series.Sequence
          name="Sushi"
          durationInFrames={8 * BEAT}
          premountFor={fps}
        >
          <GameScene
            clip="clips/sushi.mp4"
            icon="🍣"
            title="かいてんずし"
            caption="なんさら たべた？"
            color="#FF1F1F"
            trimBefore={0.8 * fps}
            playbackRate={1.9}
          />
        </Series.Sequence>
        <Series.Sequence
          name="Burger"
          durationInFrames={8 * BEAT}
          premountFor={fps}
        >
          <GameScene
            clip="clips/burger.mp4"
            icon="🍔"
            title="ハンバーガー"
            caption="つんで つくろう！"
            color="#FF8A00"
            trimBefore={0.5 * fps}
            playbackRate={2.8}
          />
        </Series.Sequence>
        <Series.Sequence
          name="Hiragana"
          durationInFrames={8 * BEAT}
          premountFor={fps}
        >
          <GameScene
            clip="clips/hiragana.mp4"
            icon="🥚"
            title="もじの たまご"
            caption="なにが でるかな？"
            color="#2B3BFF"
            trimBefore={0.5 * fps}
            playbackRate={3}
          />
        </Series.Sequence>
        <Series.Sequence
          name="Kutsu"
          durationInFrames={8 * BEAT}
          premountFor={fps}
        >
          <GameScene
            clip="clips/kutsu.mp4"
            icon="👟"
            title="くつを はこう"
            caption="ぴったり！"
            color="#19C219"
            trimBefore={0.3 * fps}
            playbackRate={2.1}
          />
        </Series.Sequence>
        <Series.Sequence
          name="Nazori"
          durationInFrames={8 * BEAT}
          premountFor={fps}
        >
          <GameScene
            clip="clips/nazori.mp4"
            icon="✏️"
            title="なぞりがき"
            caption="なぞると えに なる！"
            color="#FF2BD6"
            trimBefore={0.4 * fps}
            playbackRate={3}
          />
        </Series.Sequence>
        <Series.Sequence
          name="Ending"
          durationInFrames={12 * BEAT}
          premountFor={fps}
        >
          <Ending />
        </Series.Sequence>
      </Series>
      <Audio src={staticFile("bgm.mp3")} premountFor={fps} />
    </>
  );
};
