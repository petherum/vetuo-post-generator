import Link from "next/link";
import * as React from "react";

type Props = React.ComponentProps<typeof Link> & {
  className?: string;
};

export default function PrimaryLink({ className = "", ...props }: Props) {
  return (
    <Link
      {...props}
      className={[
        "vetuo-primary rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm inline-flex items-center justify-center",
        className,
      ].join(" ")}
    />
  );
}
