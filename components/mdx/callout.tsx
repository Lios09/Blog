import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type CalloutType = "info" | "warning" | "danger";

export function Callout({
  title,
  type = "info",
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Alert> & {
  icon?: React.ReactNode;
  type?: CalloutType;
}) {
  return (
    <Alert
      data-callout-type={type}
      className={cn(
        "not-prose my-3 rounded-xl",
        {
          "border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-100":
            type === "info",
          "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100":
            type === "warning",
          "border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-100":
            type === "danger",
        },
        className,
      )}
      {...props}
    >
      {icon}
      {title && (
        <AlertTitle className="[&_a]:underline [&_a]:underline-offset-4">
          {title}
        </AlertTitle>
      )}
      <AlertDescription className="text-current [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-medium">
        {children}
      </AlertDescription>
    </Alert>
  );
}
