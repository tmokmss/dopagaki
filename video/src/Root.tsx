import { Composition } from "remotion";
import { Promo } from "./Promo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DopagakiPromo"
      component={Promo}
      durationInFrames={720}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
