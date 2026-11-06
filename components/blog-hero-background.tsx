import Image from "next/image";
import dustyFieldSrc from "@/assets/figures/dusty-field.png";
import { ParticleField } from "@/components/particle-field";

export function BlogHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-background"
    >
      <Image
        src={dustyFieldSrc}
        alt=""
        fill
        sizes="100vw"
        className="object-cover motion-safe:hidden"
      />
      <div className="absolute inset-0 motion-reduce:hidden">
        <ParticleField
          src={dustyFieldSrc.src}
          sampleStep={2}
          // This source is intentionally very dark; a threshold of 48 filters
          // out nearly every visible pixel before the particle field can sample it.
          threshold={4}
          dotSize={0.9}
          renderScale={1}
          align="center"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 45%, transparent 35%, color-mix(in srgb, var(--background) 80%, transparent) 95%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--background) 50%, transparent) 35%, color-mix(in srgb, var(--background) 90%, transparent) 70%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
