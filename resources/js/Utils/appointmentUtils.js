// File: resources/js/Utils/appointmentUtils.js
// Utility functions for appointment management and navigation

/**
 * Format appointment date for display
 * @param {string} dateString - Date string to format
 * @param {string} format - Format type ('short', 'long', 'medium')
 * @returns {string} Formatted date string
 */
export const formatAppointmentDate = (dateString, format = "medium") => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const options = {
        short: {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
        medium: {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
        long: {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    };

    return date.toLocaleDateString("id-ID", options[format] || options.medium);
};

/**
 * Format appointment time for display
 * @param {string} timeString - Time string to format
 * @returns {string} Formatted time string (HH:MM)
 */
export const formatAppointmentTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // Take first 5 characters (HH:MM)
};

/**
 * Get appointment status information including styling and labels
 * @param {string} status - Appointment status
 * @returns {object} Status information object
 */
export const getAppointmentStatusInfo = (status) => {
    const statusMap = {
        scheduled: {
            label: "Terjadwal",
            color: "bg-blue-100 text-blue-800 border-blue-200",
            badgeColor: "bg-blue-500",
            textColor: "text-blue-600",
            bgColor: "bg-blue-50",
            icon: "Calendar",
            canEdit: true,
            canDelete: true,
            canCancel: true,
            priority: 1,
        },
        confirmed: {
            label: "Dikonfirmasi",
            color: "bg-green-100 text-green-800 border-green-200",
            badgeColor: "bg-green-500",
            textColor: "text-green-600",
            bgColor: "bg-green-50",
            icon: "CheckCircle",
            canEdit: false,
            canDelete: false,
            canCancel: true,
            priority: 2,
        },
        in_progress: {
            label: "Sedang Berlangsung",
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            badgeColor: "bg-yellow-500",
            textColor: "text-yellow-600",
            bgColor: "bg-yellow-50",
            icon: "Clock",
            canEdit: false,
            canDelete: false,
            canCancel: false,
            priority: 3,
        },
        completed: {
            label: "Selesai",
            color: "bg-purple-100 text-purple-800 border-purple-200",
            badgeColor: "bg-purple-500",
            textColor: "text-purple-600",
            bgColor: "bg-purple-50",
            icon: "CheckCircle",
            canEdit: false,
            canDelete: false,
            canCancel: false,
            priority: 4,
        },
        canceled: {
            label: "Dibatalkan",
            color: "bg-red-100 text-red-800 border-red-200",
            badgeColor: "bg-red-500",
            textColor: "text-red-600",
            bgColor: "bg-red-50",
            icon: "X",
            canEdit: false,
            canDelete: false,
            canCancel: false,
            priority: 5,
        },
        no_show: {
            label: "Tidak Hadir",
            color: "bg-gray-100 text-gray-800 border-gray-200",
            badgeColor: "bg-gray-500",
            textColor: "text-gray-600",
            bgColor: "bg-gray-50",
            icon: "UserX",
            canEdit: false,
            canDelete: false,
            canCancel: false,
            priority: 6,
        },
    };

    return statusMap[status] || statusMap.scheduled;
};

/**
 * Check if appointment is editable based on status and context
 * @param {object} appointment - Appointment object
 * @param {object} context - Appointment context object
 * @returns {boolean} Whether appointment can be edited
 */
export const canEditAppointment = (appointment, context = null) => {
    if (!appointment) return false;

    // If context is provided, use its permissions
    if (context && typeof context.can_edit !== "undefined") {
        return context.can_edit;
    }

    // Fallback to status-based check
    const statusInfo = getAppointmentStatusInfo(appointment.status);
    return statusInfo.canEdit;
};

/**
 * Check if appointment is deletable based on status and context
 * @param {object} appointment - Appointment object
 * @param {object} context - Appointment context object
 * @returns {boolean} Whether appointment can be deleted
 */
export const canDeleteAppointment = (appointment, context = null) => {
    if (!appointment) return false;

    // If context is provided, use its permissions
    if (context && typeof context.can_delete !== "undefined") {
        return context.can_delete;
    }

    // Fallback to status-based check
    const statusInfo = getAppointmentStatusInfo(appointment.status);
    return statusInfo.canDelete;
};

/**
 * Get appointment management context message
 * @param {object} appointmentContext - Appointment context object
 * @returns {string} Context message
 */
export const getAppointmentContextMessage = (appointmentContext) => {
    if (!appointmentContext) return "";

    const messages = {
        create_new:
            "Ini adalah appointment terakhir. Anda dapat membuat appointment baru.",
        show_next: appointmentContext.can_edit
            ? 'Appointment selanjutnya dapat diedit karena masih berstatus "scheduled".'
            : "Appointment selanjutnya tidak dapat diedit karena sudah dikonfirmasi atau diselesaikan.",
    };

    return (
        appointmentContext.message || messages[appointmentContext.mode] || ""
    );
};

/**
 * Sort appointments by date and time (most recent first)
 * @param {array} appointments - Array of appointment objects
 * @returns {array} Sorted appointments
 */
export const sortAppointmentsByDate = (appointments, order = "desc") => {
    if (!Array.isArray(appointments)) return [];

    return [...appointments].sort((a, b) => {
        const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);

        if (order === "desc") {
            return dateB - dateA; // Most recent first
        } else {
            return dateA - dateB; // Oldest first
        }
    });
};

/**
 * Group appointments by status
 * @param {array} appointments - Array of appointment objects
 * @returns {object} Grouped appointments by status
 */
export const groupAppointmentsByStatus = (appointments) => {
    if (!Array.isArray(appointments)) return {};

    return appointments.reduce((groups, appointment) => {
        const status = appointment.status || "scheduled";
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(appointment);
        return groups;
    }, {});
};

/**
 * Get appointment statistics
 * @param {array} appointments - Array of appointment objects
 * @returns {object} Statistics object
 */
export const getAppointmentStatistics = (appointments) => {
    if (!Array.isArray(appointments)) {
        return {
            total: 0,
            completed: 0,
            scheduled: 0,
            confirmed: 0,
            canceled: 0,
            noShow: 0,
            completionRate: 0,
        };
    }

    const stats = appointments.reduce(
        (acc, appointment) => {
            acc.total++;
            switch (appointment.status) {
                case "completed":
                    acc.completed++;
                    break;
                case "scheduled":
                    acc.scheduled++;
                    break;
                case "confirmed":
                    acc.confirmed++;
                    break;
                case "canceled":
                    acc.canceled++;
                    break;
                case "no_show":
                    acc.noShow++;
                    break;
            }
            return acc;
        },
        {
            total: 0,
            completed: 0,
            scheduled: 0,
            confirmed: 0,
            canceled: 0,
            noShow: 0,
        }
    );

    // Calculate completion rate
    stats.completionRate =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
};

/**
 * Find current appointment in history
 * @param {array} appointmentHistory - Array of appointment objects
 * @param {number} currentAppointmentId - Current appointment ID
 * @returns {object|null} Current appointment object
 */
export const findCurrentAppointment = (
    appointmentHistory,
    currentAppointmentId
) => {
    if (!Array.isArray(appointmentHistory)) return null;

    return (
        appointmentHistory.find(
            (appointment) =>
                appointment.id === currentAppointmentId ||
                appointment.is_current
        ) || null
    );
};

/**
 * Get next appointment in chronological order
 * @param {array} appointmentHistory - Array of appointment objects
 * @param {number} currentAppointmentId - Current appointment ID
 * @returns {object|null} Next appointment object
 */
export const getNextAppointment = (
    appointmentHistory,
    currentAppointmentId
) => {
    if (!Array.isArray(appointmentHistory)) return null;

    const currentAppointment = findCurrentAppointment(
        appointmentHistory,
        currentAppointmentId
    );
    if (!currentAppointment) return null;

    const currentDateTime = new Date(
        `${currentAppointment.appointment_date} ${currentAppointment.appointment_time}`
    );

    // Find appointments after the current one
    const futureAppointments = appointmentHistory
        .filter((appointment) => {
            const appointmentDateTime = new Date(
                `${appointment.appointment_date} ${appointment.appointment_time}`
            );
            return appointmentDateTime > currentDateTime;
        })
        .sort((a, b) => {
            const dateA = new Date(
                `${a.appointment_date} ${a.appointment_time}`
            );
            const dateB = new Date(
                `${b.appointment_date} ${b.appointment_time}`
            );
            return dateA - dateB; // Earliest first
        });

    return futureAppointments[0] || null;
};

/**
 * Get previous appointment in chronological order
 * @param {array} appointmentHistory - Array of appointment objects
 * @param {number} currentAppointmentId - Current appointment ID
 * @returns {object|null} Previous appointment object
 */
export const getPreviousAppointment = (
    appointmentHistory,
    currentAppointmentId
) => {
    if (!Array.isArray(appointmentHistory)) return null;

    const currentAppointment = findCurrentAppointment(
        appointmentHistory,
        currentAppointmentId
    );
    if (!currentAppointment) return null;

    const currentDateTime = new Date(
        `${currentAppointment.appointment_date} ${currentAppointment.appointment_time}`
    );

    // Find appointments before the current one
    const pastAppointments = appointmentHistory
        .filter((appointment) => {
            const appointmentDateTime = new Date(
                `${appointment.appointment_date} ${appointment.appointment_time}`
            );
            return appointmentDateTime < currentDateTime;
        })
        .sort((a, b) => {
            const dateA = new Date(
                `${a.appointment_date} ${a.appointment_time}`
            );
            const dateB = new Date(
                `${b.appointment_date} ${b.appointment_time}`
            );
            return dateB - dateA; // Latest first
        });

    return pastAppointments[0] || null;
};

/**
 * Validate appointment form data
 * @param {object} formData - Form data object
 * @returns {object} Validation result with errors
 */
export const validateAppointmentForm = (formData) => {
    const errors = {};

    if (!formData.appointment_date) {
        errors.appointment_date = "Tanggal appointment harus dipilih";
    } else {
        const selectedDate = new Date(formData.appointment_date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (selectedDate < tomorrow) {
            errors.appointment_date = "Tanggal appointment minimal besok";
        }
    }

    if (!formData.schedule_id) {
        errors.schedule_id = "Jadwal harus dipilih";
    }

    if (
        !formData.chief_complaint ||
        formData.chief_complaint.trim().length === 0
    ) {
        errors.chief_complaint = "Keluhan utama harus diisi";
    } else if (formData.chief_complaint.trim().length < 10) {
        errors.chief_complaint = "Keluhan utama minimal 10 karakter";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Generate appointment navigation breadcrumb
 * @param {object} appointment - Current appointment object
 * @param {array} appointmentHistory - Array of appointment objects
 * @returns {array} Breadcrumb items
 */
export const generateAppointmentBreadcrumb = (
    appointment,
    appointmentHistory = []
) => {
    const breadcrumb = [
        {
            label: "Dashboard",
            href: route("doctor.dashboard"),
            current: false,
        },
        {
            label: "Appointment Hari Ini",
            href: route("doctor.appointments.today"),
            current: false,
        },
    ];

    if (appointment) {
        const currentIndex = appointmentHistory.findIndex(
            (apt) => apt.id === appointment.id
        );
        const totalAppointments = appointmentHistory.length;

        breadcrumb.push({
            label: `Pemeriksaan Pasien${
                currentIndex >= 0
                    ? ` (${currentIndex + 1}/${totalAppointments})`
                    : ""
            }`,
            href: route("doctor.examination.show", appointment.id),
            current: true,
        });
    }

    return breadcrumb;
};

/**
 * Default export object with all utilities
 */
export default {
    formatAppointmentDate,
    formatAppointmentTime,
    getAppointmentStatusInfo,
    canEditAppointment,
    canDeleteAppointment,
    getAppointmentContextMessage,
    sortAppointmentsByDate,
    groupAppointmentsByStatus,
    getAppointmentStatistics,
    findCurrentAppointment,
    getNextAppointment,
    getPreviousAppointment,
    validateAppointmentForm,
    generateAppointmentBreadcrumb,
};
