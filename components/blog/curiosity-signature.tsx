"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Signature = dynamic(() => import("@/components/ui/signature"));

const TEXT = "Curiosity drives the code.";

export function CuriositySignature() {
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowMotion(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!allowMotion) {
    return (
      <p className="flex h-[90px] items-end font-heading text-[30px] text-foreground">
        {TEXT}
      </p>
    );
  }

  return <Signature text={TEXT} fontSize={30} duration={1} />;
}
