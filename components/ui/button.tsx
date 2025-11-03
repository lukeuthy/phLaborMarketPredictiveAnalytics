import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const baseStyles = "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: "bg-primary hover:bg-primary-light text-white focus:ring-primary",
    secondary: "bg-surface-light hover:bg-border text-foreground focus:ring-accent",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
