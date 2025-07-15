// File: resources/js/Pages/Dokter/ExaminationPanel/components/AppointmentHistoryCard.jsx
import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Calendar,
    Clock,
    CheckCircle,
    AlertTriangle,
    X,
    User,
    Search,
    ChevronRight,
    FileText,
    Activity,
    History,
} from "lucide-react";
import { router } from "@inertiajs/react";

const AppointmentHistoryCard = ({
    appointmentHistory = [],
    currentAppointmentId,
    patient,
    className = "",
    showNavigateButton = true,
    maxDisplayItems = 5,
    showTitle = true,
}) => {
    // Format date for display
    const formatShortDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(0, 5); // Take first 5 characters (HH:MM)
    };

    // Get status color and label
    const getStatusInfo = (status) => {
        const statusMap = {
            scheduled: {
                label: "Terjadwal",
                color: "bg-blue-100 text-blue-800 border-blue-200",
                icon: Calendar,
                dotColor: "bg-blue-500",
            },
            confirmed: {
                label: "Dikonfirmasi",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
                dotColor: "bg-green-500",
            },
            in_progress: {
                label: "Berlangsung",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
                dotColor: "bg-yellow-500",
            },
            completed: {
                label: "Selesai",
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: CheckCircle,
                dotColor: "bg-purple-500",
            },
            canceled: {
                label: "Dibatalkan",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: X,
                dotColor: "bg-red-500",
            },
            no_show: {
                label: "Tidak Hadir",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: X,
                dotColor: "bg-gray-500",
            },
        };
        return statusMap[status] || statusMap.scheduled;
    };

    // Handle navigation to appointment examination
    const handleNavigateToAppointment = (appointmentId) => {
        if (appointmentId === currentAppointmentId) {
            // Already on this appointment, just refresh or do nothing
            return;
        }

        router.visit(route("doctor.examination.show", appointmentId));
    };

    // Get displayed appointments (limit based on maxDisplayItems)
    const displayedAppointments = appointmentHistory.slice(0, maxDisplayItems);
    const hasMoreAppointments = appointmentHistory.length > maxDisplayItems;

    if (!appointmentHistory || appointmentHistory.length === 0) {
        return (
            <Card className={className}>
                <CardHeader className="pb-3">
                    {showTitle && (
                        <CardTitle className="flex items-center text-lg">
                            <History className="h-5 w-5 mr-2" />
                            Riwayat Appointment
                        </CardTitle>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                            Belum ada riwayat appointment untuk pasien ini
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                {showTitle && (
                    <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center">
                            <History className="h-5 w-5 mr-2" />
                            Riwayat Appointment
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({appointmentHistory.length} appointment)
                            </span>
                        </div>
                        {patient && (
                            <span className="text-sm font-normal text-gray-600">
                                {patient.name}
                            </span>
                        )}
                    </CardTitle>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayedAppointments.map((historyAppointment, index) => {
                        const statusInfo = getStatusInfo(
                            historyAppointment.status
                        );
                        const StatusIcon = statusInfo.icon;
                        const isCurrent =
                            historyAppointment.is_current ||
                            historyAppointment.id === currentAppointmentId;
                        const isLast =
                            index === displayedAppointments.length - 1;

                        return (
                            <div
                                key={historyAppointment.id}
                                className={`relative flex items-center justify-between p-4 border rounded-lg transition-all ${
                                    isCurrent
                                        ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
                                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                }`}
                            >
                                {/* Timeline connector (except for last item) */}
                                {!isLast && (
                                    <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200"></div>
                                )}

                                <div className="flex items-center space-x-4 flex-1">
                                    {/* Status dot with timeline */}
                                    <div className="flex-shrink-0 relative">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                isCurrent
                                                    ? "bg-blue-500 ring-2 ring-blue-200"
                                                    : statusInfo.dotColor
                                            }`}
                                        ></div>
                                    </div>

                                    {/* Appointment details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-1">
                                            {/* Date and time */}
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatShortDate(
                                                        historyAppointment.appointment_date
                                                    )}
                                                </p>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <p className="text-sm text-gray-600">
                                                    {formatTime(
                                                        historyAppointment.appointment_time
                                                    )}
                                                </p>
                                            </div>

                                            {/* Current appointment badge */}
                                            {isCurrent && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <Activity className="h-3 w-3 mr-1" />
                                                    Saat Ini
                                                </span>
                                            )}
                                        </div>

                                        {/* Chief complaint preview */}
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {historyAppointment.chief_complaint
                                                ? historyAppointment
                                                      .chief_complaint.length >
                                                  60
                                                    ? historyAppointment.chief_complaint.substring(
                                                          0,
                                                          60
                                                      ) + "..."
                                                    : historyAppointment.chief_complaint
                                                : "Tidak ada keluhan tercatat"}
                                        </p>

                                        {/* Additional info badges */}
                                        <div className="flex items-center space-x-2">
                                            {/* Status badge */}
                                            <div
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}
                                            >
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {statusInfo.label}
                                            </div>

                                            {/* Odontogram indicator */}
                                            {historyAppointment.odontogram && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    Odontogram
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Navigation button */}
                                    <div className="flex items-center space-x-2">
                                        {showNavigateButton && !isCurrent && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleNavigateToAppointment(
                                                        historyAppointment.id
                                                    )
                                                }
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Search className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    Telusuri
                                                </span>
                                            </Button>
                                        )}

                                        {isCurrent && (
                                            <div className="flex items-center text-blue-600">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                        )}

                                        {!isCurrent && (
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Show more indicator */}
                    {hasMoreAppointments && (
                        <div className="text-center py-2">
                            <p className="text-sm text-gray-500">
                                +{appointmentHistory.length - maxDisplayItems}{" "}
                                appointment lainnya
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary stats */}
                {appointmentHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {appointmentHistory.length}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Total Appointment
                                </p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-green-600">
                                    {
                                        appointmentHistory.filter(
                                            (apt) => apt.status === "completed"
                                        ).length
                                    }
                                </p>
                                <p className="text-xs text-gray-500">Selesai</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AppointmentHistoryCard;
