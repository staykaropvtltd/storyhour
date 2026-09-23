"use client";

import React from "react";
import SiteHeader from "./SiteHeader";

interface SiteNavProps {
  theme?: "light" | "dark";
  activeLink?: string;
}

export default function SiteNav({ activeLink }: SiteNavProps) {
  return <SiteHeader activeLink={activeLink} />;
}
