import { useState } from "react";
import { cn } from "../../lib/utils";

interface AvatarProps {
  initials: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  alt?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export function Avatar({
  initials,
  src,
  size = "md",
  shape = "circle",
  alt,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizeClasses[size];
  const shapeClass = shape === "circle" ? "rounded-full" : "";

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt ?? initials}
        onError={() => setImgError(true)}
        className={cn("object-cover shrink-0", sizeClass, shapeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-yvy-royal text-white font-barlowcn font-semibold uppercase select-none shrink-0",
        sizeClass,
        shapeClass,
        className
      )}
      aria-label={alt ?? initials}
    >
      {initials.slice(0, 2)}
    </div>
  );
}
