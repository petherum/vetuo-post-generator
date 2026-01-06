"use client";

import * as React from "react";

type Size = "sm" | "md";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  size?: Size;
};

export default function PrimaryButton({
  fullWidth = false,
  size = "md",
  className = "",
  ...props
}: Props) {
   return (
    <button
      {...props}
      className={[
        "vetuo-primary",
        fullWidth ? "w-full" : "",
        size === "sm"
          ? "rounded-xl px-3 py-2 text-sm font-semibold shadow-sm"
          : "rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-[color:var(--vetuo-gold)]",
        "disabled:opacity-60",
        className,
      ].join(" ")}
    />
  );
}
