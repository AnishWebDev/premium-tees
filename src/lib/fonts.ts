import {
  Bebas_Neue,
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Instrument_Serif,
  Inter,
  Libre_Baskerville,
  Lora,
  Manrope,
  Merriweather,
  Montserrat,
  Nunito,
  Open_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
  Raleway,
  Roboto,
  Space_Grotesk,
} from "next/font/google";

/**
 * All selectable storefront fonts — self-hosted by Next.js (reliable on Vercel).
 *
 * To add a font later:
 * 1. Import it from `next/font/google` (name uses underscores: `Open_Sans`)
 * 2. Create a loader below with `variable: "--f-your-font"`
 * 3. Add it to `FONT_LOADERS` and `FONT_CATALOG` in `src/lib/theme.ts`
 * 4. Deploy
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--f-dm-sans",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--f-inter",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--f-manrope",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--f-space-grotesk",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--f-outfit",
  display: "swap",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--f-plus-jakarta",
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--f-roboto",
  display: "swap",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--f-open-sans",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--f-montserrat",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-poppins",
  display: "swap",
});
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--f-raleway",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--f-nunito",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-instrument-serif",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--f-playfair",
  display: "swap",
});
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--f-libre-baskerville",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-cormorant",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--f-fraunces",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--f-lora",
  display: "swap",
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--f-merriweather",
  display: "swap",
});
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-bebas-neue",
  display: "swap",
});

/** Maps display name → CSS variable created by next/font */
export const FONT_CSS_VAR: Record<string, string> = {
  "DM Sans": "var(--f-dm-sans)",
  Inter: "var(--f-inter)",
  Manrope: "var(--f-manrope)",
  "Space Grotesk": "var(--f-space-grotesk)",
  Outfit: "var(--f-outfit)",
  "Plus Jakarta Sans": "var(--f-plus-jakarta)",
  Roboto: "var(--f-roboto)",
  "Open Sans": "var(--f-open-sans)",
  Montserrat: "var(--f-montserrat)",
  Poppins: "var(--f-poppins)",
  Raleway: "var(--f-raleway)",
  Nunito: "var(--f-nunito)",
  "Instrument Serif": "var(--f-instrument-serif)",
  "Playfair Display": "var(--f-playfair)",
  "Libre Baskerville": "var(--f-libre-baskerville)",
  "Cormorant Garamond": "var(--f-cormorant)",
  Fraunces: "var(--f-fraunces)",
  Lora: "var(--f-lora)",
  Merriweather: "var(--f-merriweather)",
  "Bebas Neue": "var(--f-bebas-neue)",
};

/** Apply on <html> so every font variable is available */
export const fontVariableClassName = [
  dmSans.variable,
  inter.variable,
  manrope.variable,
  spaceGrotesk.variable,
  outfit.variable,
  plusJakarta.variable,
  roboto.variable,
  openSans.variable,
  montserrat.variable,
  poppins.variable,
  raleway.variable,
  nunito.variable,
  instrumentSerif.variable,
  playfair.variable,
  libreBaskerville.variable,
  cormorant.variable,
  fraunces.variable,
  lora.variable,
  merriweather.variable,
  bebasNeue.variable,
].join(" ");

export function fontFamilyStack(fontName: string, fallback: string) {
  const cssVar = FONT_CSS_VAR[fontName];
  if (cssVar) return `${cssVar}, ${fallback}`;
  return `"${fontName}", ${fallback}`;
}
