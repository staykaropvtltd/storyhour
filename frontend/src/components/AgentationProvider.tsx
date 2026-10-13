"use client";

import React, { useState, useEffect } from "react";
import { Agentation } from "agentation";

/**
 * AgentationProvider provides the on-page visual feedback and annotation toolbar
 * for AI coding agents, allowing users to click elements and submit structured annotations.
 */
export default function AgentationProvider() {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("192.168.") ||
        window.location.search.includes("agentation"));

    if (process.env.NODE_ENV === "development" || isLocalhost) {
      setShouldRender(true);
    }
  }, []);

  if (!mounted || !shouldRender) {
    return null;
  }

  return <Agentation />;
}
