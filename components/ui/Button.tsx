"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-accent text-white",
    "hover:bg-[var(--accent-hover)]",
    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    "disabled:bg-[var(--text-muted)]",
  ].join(" "),
  ghost: [
    "bg-transparent text-[var(--text-secondary)]",
    "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
    "focus-visible:ring-2 focus-visible:ring-[var(--border-strong)] focus-visible:ring-offset-2",
    "disabled:text-[var(--text-muted)]",
  ].join(" "),
  danger: [
    "bg-danger text-white",
    "hover:bg-[var(--danger)]",
    "focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2",
    "disabled:bg-[var(--text-muted)]",
    "opacity-90 hover:opacity-100",
  ].join(" "),
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      disabled,
      className,
      children,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-md px-3.5 py-2 text-sm font-medium",
          "transition-colors duration-150",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          className
        )}
        {...rest}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
