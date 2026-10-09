import { loadFont } from "@remotion/google-fonts/MPLUSRounded1c";

export const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  ignoreTooManyRequestsWarning: true,
});
