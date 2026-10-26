"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { AppleHelloEffectEnglish } from "../apple-hello-effect-english";
import { ChineseHelloEffect } from "../chinese-hello-effect";

export default function AppleHelloEffectHero() {
  const [index, setIndex] = useState(0);

  const handleAnimationEnd = () => {
    setIndex((prevIndex) => (prevIndex + 1) % 2);
  };

  const demos = [
    <AppleHelloEffectEnglish
      key="english"
      className={"h-35"}
      onAnimationComplete={handleAnimationEnd}
    />,
    <ChineseHelloEffect
      key="chinese"
      className={"h-35"}
      durationScale={0.65}
      onAnimationComplete={handleAnimationEnd}
    />,
  ];

  return <AnimatePresence mode="wait">{demos[index]}</AnimatePresence>;
}
