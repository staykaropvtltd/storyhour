"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface MagneticTextProps {
  text: React.ReactNode;
  hoverText?: React.ReactNode;
  className?: string;
  circleClassName?: string;
  hoverTextClassName?: string;
  circleSize?: number;
}

export function MagneticText({
  text = "Stories come alive.",
  hoverText = "Stories unfold.",
  className,
  circleClassName,
  hoverTextClassName,
  circleSize = 180,
}: MagneticTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const innerTextRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Check reduced motion & touch capability
  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionHandler);

    const pointerQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsTouch(pointerQuery.matches);
    const pointerHandler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    pointerQuery.addEventListener("change", pointerHandler);

    return () => {
      motionQuery.removeEventListener("change", motionHandler);
      pointerQuery.removeEventListener("change", pointerHandler);
    };
  }, []);

  // Track container dimensions accurately across fonts and viewport changes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(updateSize);
      ro.observe(containerRef.current);
    }

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(updateSize);
    }

    return () => {
      window.removeEventListener("resize", updateSize);
      if (ro) ro.disconnect();
    };
  }, []);

  // RAF loop with smooth lerp interpolation - runs only when element is hovered
  useEffect(() => {
    if (isReducedMotion || isTouch || !isHovered) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      currentPos.current.x = lerp(
        currentPos.current.x,
        mousePos.current.x,
        0.15,
      );
      currentPos.current.y = lerp(
        currentPos.current.y,
        mousePos.current.y,
        0.15,
      );

      if (circleRef.current) {
        circleRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (innerTextRef.current) {
        innerTextRef.current.style.transform = `translate3d(${-currentPos.current.x}px, ${-currentPos.current.y}px, 0)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReducedMotion, isTouch, isHovered]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isTouch) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [isTouch],
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isTouch) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePos.current = { x, y };
      currentPos.current = { x, y };

      if (!containerSize.width && containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }

      setIsHovered(true);
    },
    [isTouch, containerSize.width],
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const textString =
    typeof text === "string" ? text : "Stories that live beyond time";
  const hoverTextString =
    typeof hoverText === "string" ? hoverText : "Stories worth remembering.";

  return (
    <div
      ref={containerRef}
      data-morphing-cursor="true"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative inline-block select-none cursor-default",
        className,
      )}
      tabIndex={0}
      aria-label={`${textString}. Hover to reveal ${hoverTextString}`}
    >
      {/* Base text layer in normal document flow */}
      <div className="relative z-10 w-full">
        {text}
      </div>

      {/* Morphing circular mask revealing alternate phrase */}
      {!isTouch && (
        <div
          ref={circleRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0 left-0 overflow-hidden rounded-full z-20 shadow-2xl",
            circleClassName || "bg-[#0F0F0F]",
          )}
          style={{
            width: isHovered && !isReducedMotion ? circleSize : 0,
            height: isHovered && !isReducedMotion ? circleSize : 0,
            transition:
              "width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1)",
            willChange: "transform, width, height",
          }}
        >
          {/* Inversely translated inner container matching parent dimensions */}
          <div
            ref={innerTextRef}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: containerSize.width || "auto",
              height: containerSize.height || "auto",
              top: "50%",
              left: "50%",
              willChange: "transform",
            }}
          >
            <div className={cn("w-full h-full", hoverTextClassName || "text-[#F7F4EE]")}>
              {hoverText || text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
