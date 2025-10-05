import * as React from "react";
import { cn } from "@/lib/design-tokens";

export interface TestimonialSkeletonProps {
  count?: number;
  variant?: "navy" | "white";
  className?: string;
}

const shimmer = "animate-pulse";

function SingleSkeleton({ variant }: { variant: "navy" | "white" }) {
  const isNavy = variant === "navy";
  const base = isNavy ? "bg-white/10" : "bg-[#f3f4f6]";
  const line = isNavy ? "bg-white/20" : "bg-[#e5e7eb]";

  return (
    <div
      className={cn(
        "rounded-md p-6 md:p-8",
        isNavy ? "bg-[#2a3654]" : "bg-white border border-[#e5e7eb] shadow-subtle",
        shimmer
      )}
    >
      {/* Quote icon placeholder */}
      <div className={cn("h-6 w-6 rounded", base)} />

      {/* Text lines */}
      <div className="mt-4 space-y-2">
        <div className={cn("h-4 w-11/12 rounded", line)} />
        <div className={cn("h-4 w-10/12 rounded", line)} />
        <div className={cn("h-4 w-9/12 rounded", line)} />
        <div className={cn("h-4 w-7/12 rounded", line)} />
      </div>

      {/* Stars */}
      <div className="mt-4 flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn("h-5 w-5 rounded-full", base)} />
        ))}
      </div>

      {/* Divider */}
      <div className={cn("my-5 h-px w-full", isNavy ? "bg-white/15" : "bg-black/5")} />

      {/* Client name and role */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={cn("h-4 w-24 rounded", line)} />
          <div className={cn("h-3 w-32 rounded", base)} />
        </div>
        <div className={cn("h-2 w-2 rounded-full", base)} />
      </div>
    </div>
  );
}

export default function TestimonialSkeleton({ count = 3, variant = "white", className }: TestimonialSkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SingleSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}


