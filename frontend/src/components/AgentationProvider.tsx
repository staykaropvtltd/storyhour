"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AgentationComponent = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false }
);

export default function AgentationProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AgentationComponent
      endpoint="http://localhost:4747"
      onSessionCreated={(sessionId: string) => {
        console.log("Agentation session started:", sessionId);
      }}
    />
  );
}
