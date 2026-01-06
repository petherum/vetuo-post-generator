"use client";

import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export default function PrimaryButton({ fullWidth = false, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={[
        "vetuo-primary",
        fullWidth ? "w-full" : "",
        "rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]",
        "disabled:opacity-60",
        className,
      ].join(" ")}
    />
  );
}
