import readingTime from "reading-time";

import type { ReadingTime } from "./types";

export function calculateReadingTime(content: string): ReadingTime {
  const result = readingTime(content);

  return {
    text: result.text,
    minutes: result.minutes,
    words: result.words,
  };
}
