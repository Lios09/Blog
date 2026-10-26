"use client";

import { motion } from "motion/react";
import * as opentype from "opentype.js";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { getGlyphFillTransition } from "./signature-animation";

interface SignatureProps {
  /** Text to generate signature for */
  text?: string;
  /** Color of the signature path */
  color?: string;
  /** Font size of the signature */
  fontSize?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
  /** Only animate when in view */
  inView?: boolean;
  /** Only animate once */
  once?: boolean;
  /** Custom font URL to load */
  fontUrl?: string;
}

interface GlyphPath {
  d: string;
  key: string;
}

export function Signature({
  text = "Signature",
  color = "currentColor",
  fontSize = 32,
  duration = 1.5,
  delay = 0,
  className,
  inView = false,
  once = true,
  fontUrl,
}: SignatureProps) {
  const [paths, setPaths] = useState<GlyphPath[]>([]);
  const [width, setWidth] = useState<number>(300);
  const height = fontSize * 3; // Give plenty of vertical space
  const horizontalPadding = fontSize * 0.1;
  const topMargin = fontSize * 1.5; // Shift down
  const baseline = topMargin;
  const maskId = `signature-reveal-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    async function load() {
      try {
        let font = null;
        const fontPaths = fontUrl ? [fontUrl] : ["/LastoriaBoldRegular.otf"];

        for (const path of fontPaths) {
          try {
            const response = await fetch(path);
            if (!response.ok) {
              throw new Error(`Failed to load font: ${response.status}`);
            }
            const buffer = await response.arrayBuffer();
            font = opentype.parse(buffer);
            break;
          } catch {
            // Try next path
            console.error(`Failed to load font: ${path}`);
          }
        }

        if (!font) {
          throw new Error("Font could not be loaded from any path");
        }

        let x = horizontalPadding;
        const newPaths: GlyphPath[] = [];

        for (const char of text) {
          const glyph = font.charToGlyph(char);
          const glyphPath = glyph.getPath(x, baseline, fontSize);
          newPaths.push({
            d: glyphPath.toPathData(3),
            key: `${x}:${char}`,
          });

          const advanceWidth = glyph.advanceWidth ?? font.unitsPerEm;
          x += advanceWidth * (fontSize / font.unitsPerEm);
        }

        setPaths(newPaths);
        setWidth(x + horizontalPadding);
      } catch (error) {
        console.error("Signature component font load error:", error);
        setPaths([]);
        setWidth(text.length * fontSize * 0.6);
      }
    }

    load();
    // return () => setPaths([]);
  }, [text, fontSize, baseline, horizontalPadding, fontUrl]);

  const variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1 },
  };

  const solidFillVariants = {
    hidden: { fillOpacity: 0 },
    visible: (index: number) => ({
      fillOpacity: 1,
      transition: {
        fillOpacity: getGlyphFillTransition(index, delay, duration),
      },
    }),
  };

  return (
    <motion.svg
      key={paths.length}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("overflow-visible text-foreground", className)}
      initial="hidden"
      whileInView={inView ? "visible" : undefined}
      animate={inView ? undefined : "visible"}
      viewport={{ once }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {paths.map(({ d, key }, i) => (
            <motion.path
              key={`outline-mask-${key}`}
              d={d}
              stroke="white"
              strokeWidth={fontSize * 0.22}
              fill="none"
              variants={variants}
              transition={{
                pathLength: {
                  delay: delay + i * 0.2,
                  duration,
                  ease: "easeInOut",
                },
                opacity: {
                  delay: delay + i * 0.2 + 0.01,
                  duration: 0.01,
                },
              }}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {paths.map(({ d, key }, i) => (
            <motion.path
              key={`solid-mask-${key}`}
              d={d}
              fill="white"
              custom={i}
              variants={solidFillVariants}
            />
          ))}
        </mask>
      </defs>

      {paths.map(({ d, key }, i) => (
        <motion.path
          key={`outline-${key}`}
          d={d}
          stroke={color}
          strokeWidth={2}
          fill="none"
          variants={variants}
          transition={{
            pathLength: {
              delay: delay + i * 0.2,
              duration,
              ease: "easeInOut",
            },
            opacity: {
              delay: delay + i * 0.2 + 0.01,
              duration: 0.01,
            },
          }}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
      ))}

      <g mask={`url(#${maskId})`}>
        {paths.map(({ d, key }) => (
          <path key={`fill-${key}`} d={d} fill={color} />
        ))}
      </g>
    </motion.svg>
  );
}
