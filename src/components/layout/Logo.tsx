import React from "react";
import Image from "next/image";

export interface LogoProps {
  className?: string;
  ariaLabel?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Nova Nest Real Estate Logo component using the actual logo image.
 */
const Logo: React.FC<LogoProps> = ({ 
  className, 
  ariaLabel = "Nova Nest Real Estate Logo",
  width = 120,
  height = 40,
  priority = false
}) => {
  return (
    <Image
      src="/images/logo.png"
      alt={ariaLabel}
      width={width}
      height={height}
      priority={priority}
      unoptimized // Small logo doesn't benefit from optimization
      className={className}
    />
  );
};

export default Logo;


