const GLYPH_DELAY_STEP = 0.2;
const SOLID_FILL_DURATION = 0.08;

export function getGlyphFillTransition(
  index: number,
  delay: number,
  duration: number,
) {
  return {
    delay: delay + index * GLYPH_DELAY_STEP + duration,
    duration: SOLID_FILL_DURATION,
  };
}
