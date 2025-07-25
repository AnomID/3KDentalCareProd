// resources/js/Components/ui/dialog.jsx
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Dialog Context
const DialogContext = React.createContext({});

const Dialog = ({ children, open, onOpenChange }) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

const DialogTrigger = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        const { onOpenChange } = React.useContext(DialogContext);

        return (
            <button
                ref={ref}
                className={className}
                onClick={() => onOpenChange && onOpenChange(true)}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DialogTrigger.displayName = "DialogTrigger";

const DialogPortal = ({ children }) => {
    return children;
};

const DialogClose = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        const { onOpenChange } = React.useContext(DialogContext);

        return (
            <button
                ref={ref}
                className={className}
                onClick={() => onOpenChange && onOpenChange(false)}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DialogClose.displayName = "DialogClose";

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
                "animate-in fade-in-0 duration-200",
                className
            )}
            onClick={() => onOpenChange && onOpenChange(false)}
            {...props}
        />
    );
});
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        const { open, onOpenChange } = React.useContext(DialogContext);

        // Close on Escape key
        React.useEffect(() => {
            const handleKeyDown = (event) => {
                if (event.key === "Escape" && open) {
                    onOpenChange && onOpenChange(false);
                }
            };

            if (open) {
                document.addEventListener("keydown", handleKeyDown);
                document.body.style.overflow = "hidden";
            }

            return () => {
                document.removeEventListener("keydown", handleKeyDown);
                document.body.style.overflow = "unset";
            };
        }, [open, onOpenChange]);

        if (!open) return null;

        return (
            <DialogPortal>
                <DialogOverlay />
                <div
                    ref={ref}
                    className={cn(
                        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
                        "gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
                        "animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                    {...props}
                >
                    {children}
                    <button
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none"
                        onClick={() => onOpenChange && onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
            </DialogPortal>
        );
    }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight text-gray-900",
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-600", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
