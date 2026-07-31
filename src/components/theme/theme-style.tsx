import { getContentBlock } from "@/lib/site-content";
import { themeToCssVariables } from "@/lib/theme";

/** Applies Admin → Site style colors/fonts via CSS variables. Fonts load via next/font. */
export async function ThemeStyle() {
  const theme = await getContentBlock("theme");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: themeToCssVariables(theme),
      }}
    />
  );
}
