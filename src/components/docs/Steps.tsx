import type { ReactNode } from "react";

interface StepsProps {
  children?: ReactNode;
}

/** Procedimiento paso a paso: lista numerada con marcadores destacados. */
export function Steps({ children }: StepsProps) {
  return (
    <div className="pasos my-6 rounded-md border border-border bg-surface px-4 py-3 [&_ol]:my-0 [&_ol]:pl-7 [&_li]:pl-1 [&_li::marker]:font-semibold [&_li::marker]:text-accent [&_li+li]:mt-2">
      {children}
    </div>
  );
}
