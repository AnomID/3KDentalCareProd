// CustomIcons.jsx
import React from "react";

export const LungsIcon = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* Simple lungs SVG */}
        <path d="M6 3h2c2 0 3 1 3 3v11c0 1 0 2-1 3c-1 1-2 1-3 1H4c-1 0-2 0-3-1c-1-1-1-2-1-3V9c0-2 1-3 3-3h2" />
        <path d="M18 3h2c2 0 3 1 3 3v11c0 1 0 2-1 3c-1 1-2 1-3 1h-3c-1 0-2 0-3-1c-1-1-1-2-1-3V9c0-2 1-3 3-3h2" />
        <path d="M12 2v20" />
    </svg>
);

export const ToothIcon = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* Simple tooth SVG */}
        <path d="M7 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        <path d="M17 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        <path d="M7 8v11c0 1.1.9 2 2 2s2-.9 2-2v-5" />
        <path d="M17 8v11c0 1.1-.9 2-2 2s-2-.9-2-2v-5" />
    </svg>
);
