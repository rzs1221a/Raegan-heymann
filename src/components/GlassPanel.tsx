import type { ReactNode } from "react";

export default function GlassPanel({
  children,
  className = "",
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "deep" | "green";
}) {
  const base =
    variant === "deep" ? "glass-deep" : variant === "green" ? "glass-green-panel" : "glass";
  return <div className={`${base} min-w-0 rounded-3xl ${className}`}>{children}</div>;
}
