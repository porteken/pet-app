import { cn } from "@/lib/utilities";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border-gray-200 bg-white text-gray-900",
        destructive: "border-red-200 bg-red-50 text-red-900",
        info: "border-blue-200 bg-blue-50 text-blue-900",
      },
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...properties }, reference) => (
  <div
    className={cn(alertVariants({ className, variant }))}
    ref={reference}
    role="alert"
    {...properties}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, className, ...properties }, reference) => (
  <h5
    className={cn("mb-1 leading-none font-medium tracking-tight", className)}
    ref={reference}
    {...properties}
  >
    {children}
  </h5>
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...properties }, reference) => (
  <div
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    ref={reference}
    {...properties}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
