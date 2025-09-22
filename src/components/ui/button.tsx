import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm md:text-[15px] px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand/50",
    ghost:
      "border border-accent/30 text-accent hover:bg-accent/10 focus-visible:ring-accent/40",
  } as const;

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}


