/**
 * Utility functions for formatting dates in the application
 */

/**
 * Format date in Indonesian format (DD Month YYYY)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

/**
 * Format date with day name in Indonesian format (Day, DD Month YYYY)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with day name
 */
export const formatDateWithDay = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

/**
 * Calculate age from birth date
 * @param {string} birthDate - ISO date string of birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age;
};
