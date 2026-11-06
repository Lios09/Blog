"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { AppleHelloEffectEnglish } from "../apple-hello-effect-english";
import { ChineseHelloEffect } from "../chinese-hello-effect";

type MotionMode = "pending" | "reduce" | "play";

export default function AppleHelloEffectHero() {
  const [mode, setMode] = useState<MotionMode>("pending");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMode(media.matches ? "reduce" : "play");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (mode !== "play") {
    return (
      <AppleHelloEffectEnglish
        className="h-35"
        motionMode={mode === "reduce" ? "instant" : "frozen"}
      />
    );
  }

  return <HelloLoop />;
}

function HelloLoop() {
  const [index, setIndex] = useState(0);

  const handleAnimationEnd = () => {
    setIndex((prevIndex) => (prevIndex + 1) % 2);
  };

  const demos = [
    <AppleHelloEffectEnglish
      key="english"
      className="h-35"
      onAnimationComplete={handleAnimationEnd}
    />,
    <ChineseHelloEffect
      key="chinese"
      className="h-35"
      durationScale={0.65}
      onAnimationComplete={handleAnimationEnd}
    />,
  ];

  return <AnimatePresence mode="wait">{demos[index]}</AnimatePresence>;
}
