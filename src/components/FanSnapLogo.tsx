"use client";

// THE FanSnap logo — one component used everywhere (headers, footers,
// coming-soon, admin). Single source = no more drift between a gradient SVG
// here and a flat text wordmark there. The gradient (purple→cyan) is the
// brand mark; `useId` keeps multiple instances on one page from colliding on
// the gradient ref.

import { useId } from "react";

const HEIGHTS = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 } as const;

export default function FanSnapLogo({ size = "md" }: { size?: keyof typeof HEIGHTS }) {
  const h = HEIGHTS[size];
  const gid = `fsl-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 380 80" style={{ height: h, width: "auto", display: "block", flexShrink: 0 }} role="img" aria-label="FanSnap">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#C13EFF" />
          <stop offset="55%" stopColor="#7B4EFF" />
          <stop offset="100%" stopColor="#00B8FF" />
        </linearGradient>
      </defs>
      <text x="0" y="62" fontFamily="var(--font-grotesk), system-ui, sans-serif" fontWeight="700" fontSize="64" fill={`url(#${gid})`} letterSpacing="-3">fan</text>
      <circle cx="138" cy="36" r="11" stroke={`url(#${gid})`} strokeWidth="3" fill="none" />
      <circle cx="138" cy="34" r="4.5" fill={`url(#${gid})`} />
      <circle cx="170" cy="36" r="11" stroke={`url(#${gid})`} strokeWidth="3" fill="none" />
      <circle cx="170" cy="34" r="4.5" fill={`url(#${gid})`} />
      <text x="195" y="62" fontFamily="var(--font-grotesk), system-ui, sans-serif" fontWeight="700" fontSize="64" fill={`url(#${gid})`} letterSpacing="-3">Snap</text>
    </svg>
  );
}
