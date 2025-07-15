// File: resources/js/Pages/Dokter/Appointment/components/TabNavigation.jsx (Fixed)
import React from "react";
import {
    User,
    BookOpen,
    Activity,
    CalendarClock,
    Calendar,
    History,
    Plus,
    FileText,
} from "lucide-react";

const TabNavigation = ({
    activeTab,
    setActiveTab,
    appointment,
    appointmentHistory = [],
}) => {
    // Log for debugging
    console.log("[TabNavigation] Props:", {
        activeTab,
        appointmentStatus: appointment?.status,
        historyCount: appointmentHistory?.length || 0,
    });

    // Determine if appointment tab should be shown
    const showAppointmentTab = appointment.status === "completed";

    // Always show history tab
    const showHistoryTab = true;

    // FIXED: Handle tab click with proper event handling
    const handleTabClick = (e, tabName) => {
        e.preventDefault();
        console.log("[TabNavigation] Tab clicked:", tabName);

        if (typeof setActiveTab === "function") {
            setActiveTab(tabName);
        } else {
            console.error(
                "[TabNavigation] setActiveTab is not a function:",
                setActiveTab
            );
        }
    };

    return (
        <div className="mb-6 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                {/* Informasi Pasien Tab - Always visible */}
                <li className="mr-2">
                    <button
                        onClick={(e) => handleTabClick(e, "details")}
                        className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-colors focus:outline-none ${
                            activeTab === "details"
                                ? "text-blue-600 border-blue-600 active"
                                : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                        }`}
                        type="button"
                    >
                        <User size={16} className="mr-2" />
                        Informasi Pasien
                    </button>
                </li>

                {/* Riwayat Medis Tab - For completed appointments */}
                {appointment.status === "completed" && (
                    <li className="mr-2">
                        <button
                            onClick={(e) => handleTabClick(e, "treatment")}
                            className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-colors focus:outline-none ${
                                activeTab === "treatment"
                                    ? "text-blue-600 border-blue-600 active"
                                    : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                            }`}
                            type="button"
                        >
                            <Activity size={16} className="mr-2" />
                            Riwayat Medis
                        </button>
                    </li>
                )}

                {/* Appointment Tab - Only for completed appointments */}
                {showAppointmentTab && (
                    <li className="mr-2">
                        <button
                            onClick={(e) => handleTabClick(e, "appointment")}
                            className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-colors focus:outline-none ${
                                activeTab === "appointment"
                                    ? "text-blue-600 border-blue-600 active"
                                    : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                            }`}
                            type="button"
                        >
                            <Calendar size={16} className="mr-2" />
                            Appointment
                        </button>
                    </li>
                )}

                {/* History Appointment Tab - Always visible */}
                {showHistoryTab && (
                    <li className="mr-2">
                        <button
                            onClick={(e) => handleTabClick(e, "history")}
                            className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-colors focus:outline-none ${
                                activeTab === "history"
                                    ? "text-blue-600 border-blue-600 active"
                                    : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                            }`}
                            type="button"
                        >
                            <History size={16} className="mr-2" />
                            History Appointment
                            {appointmentHistory &&
                                appointmentHistory.length > 0 && (
                                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                        {appointmentHistory.length}
                                    </span>
                                )}
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default TabNavigation;
