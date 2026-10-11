"use client";

import React, { useState, useEffect } from "react";
import { Agentation } from "agentation";

/**
 * AgentationProvider provides the on-page visual feedback and annotation toolbar
 * for AI coding agents, allowing users to click elements and submit structured annotations.
 */
export default function AgentationProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || process.env.NODE_ENV !== "development") {
    return null;
  }

  return <Agentation />;
}
