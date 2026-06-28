"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type ParallaxImageProps = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
};

export function ParallaxImage({
  src,
  alt = "",
  className,
  sizes = "50vw",
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y, scale }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} />
      </motion.div>
    </div>
  );
}
