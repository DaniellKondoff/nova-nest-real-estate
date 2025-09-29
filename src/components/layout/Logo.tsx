"use client";

import React from "react";

export interface LogoProps {
  className?: string;
  ariaLabel?: string;
}

/**
 * Minimal placeholder Logo component for Nova Nest Real Estate.
 * Replace with SVG or image when available.
 */
const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <span className={["font-sans text-white text-base font-semibold tracking-wide", className].filter(Boolean).join(" ")}>Nova Nest</span>
  );
};

export default Logo;


