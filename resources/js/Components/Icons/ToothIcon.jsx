import React from "react";

const ToothIcon = ({ size = 24, className = "", ...props }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M8 2c1.5 0 3 .5 4 2s2.5 2 4 2c1.5 0 2.5 1 2.5 2.5s-1 2.5-1 4.5c0 3-2 5-4 6s-3 2-3.5 4c-.5 2-1.5 3-2.5 3s-2-1-2.5-3c-.5-2-1.5-3-3.5-4s-4-3-4-6c0-2 0-3 1-4.5S6.5 2 8 2z" />
            <circle cx="12" cy="8" r="1" />
        </svg>
    );
};

export default ToothIcon;
