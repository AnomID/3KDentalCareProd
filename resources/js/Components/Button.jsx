import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";

export default function Button({
    children,
    size = "md",
    onClick,
    href,
    className = "",
}) {
    const sizeClasses = {
        sm: "py-2 px-5 text-sm",
        md: "py-3 px-7 text-base",
        lg: "py-4 px-9 text-lg",
    };

    const buttonClasses = `
        bg-gradient-to-r from-[#BB8525] to-[#D2A63C] 
        text-[#1D1912] font-semibold rounded-full shadow-md 
        transition-all duration-300 ease-in-out 
        hover:from-[#FFD700] hover:to-[#FFC107] 
        hover:text-[#1D1912] hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] 
        ${sizeClasses[size]} ${className}
    `;

    return href ? (
        <Link href={href} className="inline-block">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={buttonClasses}
            >
                {children}
            </motion.button>
        </Link>
    ) : (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={buttonClasses}
        >
            {children}
        </motion.button>
    );
}
