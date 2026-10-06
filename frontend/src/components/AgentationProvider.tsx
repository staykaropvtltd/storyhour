"use client";

import React from "react";

/**
 * AgentationProvider is a development-only debugging overlay.
 * Gated to prevent loading in production and to avoid ERR_CONNECTION_REFUSED console errors
 * and axe accessibility violations during testing.
 */
export default function AgentationProvider() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  return null;
}
