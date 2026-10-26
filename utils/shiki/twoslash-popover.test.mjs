import assert from "node:assert/strict";
import test from "node:test";

import { getTwoslashPopoverPosition } from "./twoslash-popover.ts";

test("places a Twoslash popover below its trigger when there is room", () => {
  assert.deepEqual(
    getTwoslashPopoverPosition(
      { top: 100, right: 180, bottom: 120, left: 100 },
      { width: 240, height: 80 },
      { width: 800, height: 600 },
    ),
    { top: 128, left: 100, side: "bottom" },
  );
});

test("flips above the trigger and keeps the popover inside the viewport", () => {
  assert.deepEqual(
    getTwoslashPopoverPosition(
      { top: 540, right: 790, bottom: 560, left: 760 },
      { width: 240, height: 100 },
      { width: 800, height: 600 },
    ),
    { top: 432, left: 552, side: "top" },
  );
});
