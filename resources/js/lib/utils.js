import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Utility functions for odontogram
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...options,
    };

    return new Date(date).toLocaleDateString("id-ID", defaultOptions);
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getToothQuadrant = (toothNumber) => {
    const num = parseInt(toothNumber);
    if (num >= 11 && num <= 18) return 1; // Upper right
    if (num >= 21 && num <= 28) return 2; // Upper left
    if (num >= 31 && num <= 38) return 3; // Lower left
    if (num >= 41 && num <= 48) return 4; // Lower right
    if (num >= 51 && num <= 55) return 5; // Upper right deciduous
    if (num >= 61 && num <= 65) return 6; // Upper left deciduous
    if (num >= 71 && num <= 75) return 7; // Lower left deciduous
    if (num >= 81 && num <= 85) return 8; // Lower right deciduous
    return 0;
};

export const isDeciduousTooth = (toothNumber) => {
    const num = parseInt(toothNumber);
    return num >= 51 && num <= 85;
};

export const isPermanentTooth = (toothNumber) => {
    const num = parseInt(toothNumber);
    return num >= 11 && num <= 48;
};

export const getToothType = (toothNumber) => {
    const num = parseInt(toothNumber);
    const lastDigit = num % 10;

    if (lastDigit === 1 || lastDigit === 2) return "Incisor";
    if (lastDigit === 3) return "Canine";
    if (lastDigit === 4 || lastDigit === 5) return "Premolar";
    if (lastDigit === 6 || lastDigit === 7 || lastDigit === 8) return "Molar";

    return "Unknown";
};

export const validateToothNumber = (toothNumber) => {
    const num = parseInt(toothNumber);
    const validRanges = [
        [11, 18],
        [21, 28],
        [31, 38],
        [41, 48], // Permanent teeth
        [51, 55],
        [61, 65],
        [71, 75],
        [81, 85], // Deciduous teeth
    ];

    return validRanges.some(([min, max]) => num >= min && num <= max);
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// Odontogram specific utilities
export const calculateDMFT = (conditions) => {
    const dmft = { d: 0, m: 0, f: 0, t: 0 };
    const processedTeeth = new Set();

    conditions.forEach((condition) => {
        if (processedTeeth.has(condition.tooth_number)) return;

        processedTeeth.add(condition.tooth_number);

        switch (condition.condition_code) {
            case "CARIES":
                dmft.d++;
                break;
            case "MIS":
            case "NON":
                dmft.m++;
                break;
            case "AMF":
            case "COF":
            case "FMC":
            case "POC":
            case "RCT":
                dmft.f++;
                break;
        }
    });

    dmft.t = dmft.d + dmft.m + dmft.f;
    return dmft;
};

export const getConditionPriorityColor = (priority) => {
    const colors = {
        low: "text-green-600 bg-green-50 border-green-200",
        normal: "text-blue-600 bg-blue-50 border-blue-200",
        high: "text-orange-600 bg-orange-50 border-orange-200",
        urgent: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[priority] || colors.normal;
};

export const getStatusColor = (status) => {
    const colors = {
        not_started: "text-yellow-600 bg-yellow-50 border-yellow-200",
        in_progress: "text-blue-600 bg-blue-50 border-blue-200",
        completed: "text-green-600 bg-green-50 border-green-200",
        cancelled: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[status] || colors.not_started;
};
