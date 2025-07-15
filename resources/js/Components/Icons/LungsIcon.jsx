// Create a LungsIcon.jsx file
import React from "react";

const LungsIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
    >
        {/* Simple lungs SVG path - you'd need to add actual path data */}
        <path d="M6.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h3a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 6.5 2h-3z"></path>
        <path d="M13.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 9 3.5v9A1.5 1.5 0 0 0 10.5 14h3a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 13.5 2h-3z"></path>
    </svg>
);

export default LungsIcon;
