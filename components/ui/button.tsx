import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/components/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-green-600 text-white border border-green-600 hover:bg-green-700 hover:border-green-700 hover:shadow-lg hover:shadow-green-600/25 active:bg-green-800",
        destructive:
          "bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:shadow-red-600/25 active:bg-red-800 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40",
        outline:
          "border border-gray-300 bg-background text-foreground hover:bg-gray-50 hover:border-gray-400 hover:shadow-md dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500",
        secondary:
          "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-md dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        link: "text-green-600 underline-offset-4 hover:underline hover:text-green-700",
        success:
          "bg-green-600 text-white border border-green-600 hover:bg-green-700 hover:border-green-700 hover:shadow-lg hover:shadow-green-600/25 active:bg-green-800",
        warning:
          "bg-amber-500 text-white border border-amber-500 hover:bg-amber-600 hover:border-amber-600 hover:shadow-lg hover:shadow-amber-500/25 active:bg-amber-700",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
