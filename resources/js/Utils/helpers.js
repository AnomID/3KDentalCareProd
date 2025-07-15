// helpers.js - Place this file in resources/js/Utils/helpers.js

/**
 * Format bytes to human readable format
 * @param {number} bytes - The number of bytes
 * @param {number} decimals - The number of decimal places
 * @returns {string} Formatted string
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Create a custom icon component for use in the application
 * @param {Object} props - Component props
 * @returns {React.Component} Icon component
 */
export const createIconComponent = (props) => {
    const { className = "w-6 h-6", ...otherProps } = props;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            {...otherProps}
        >
            {props.children}
        </svg>
    );
};
