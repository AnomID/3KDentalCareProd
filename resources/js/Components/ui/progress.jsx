import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(
    ({ className, value, max = 100, ...props }, ref) => {
        // Ensure value is between 0 and max
        const normalizedValue = Math.min(Math.max(value || 0, 0), max);
        const percentage = (normalizedValue / max) * 100;

        return (
            <div
                ref={ref}
                className={cn(
                    "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
                    className
                )}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={normalizedValue}
                {...props}
            >
                <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                    style={{
                        width: `${percentage}%`,
                        transition: "width 0.3s ease-in-out",
                    }}
                />
            </div>
        );
    }
);

Progress.displayName = "Progress";

export { Progress };
