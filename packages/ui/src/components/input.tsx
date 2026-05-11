"use client"
import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Eye, EyeOff } from "lucide-react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const isPassword = type === "password"
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
  return (
    <div className="relative">
      <input
        type={isPassword ? (isPasswordVisible ? "text" : "password") : type}
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-slate-600"
          tabIndex={-1}
        >
          {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  )
}

export { Input }
