// File: resources/js/Pages/Dokter/Appointment/components/AppointmentHistoryTab.jsx (Enhanced)
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
    Calendar,
    Clock,
    CheckCircle,
    X,
    User,
    Search,
    ChevronRight,
    FileText,
    Activity,
    History,
    ExternalLink,
    Eye,
    Info,
    Stethoscope,
    MapPin,
    AlertTriangle,
    ArrowRight,
    Navigation,
    Target,
    Star,
} from "lucide-react";

const AppointmentHistoryTab = ({
    appointmentHistory = [],
    currentAppointmentId,
    patientData,
    currentAppointment,
    className = "",
    maxDisplayItems = 10,
}) => {
    const [isNavigating, setIsNavigating] = useState(false);
    const [loadingAppointmentId, setLoadingAppointmentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Log for debugging
    useEffect(() => {
        console.log("[AppointmentHistoryTab] Props received:", {
            appointmentHistoryCount: appointmentHistory?.length || 0,
            currentAppointmentId,
            patientName: patientData?.name,
            currentAppointmentStatus: currentAppointment?.status,
        });
    }, [
        appointmentHistory,
        currentAppointmentId,
        patientData,
        currentAppointment,
    ]);

    // Format date for display
    const formatShortDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Format long date for display
    const formatLongDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
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
                bgColor: "bg-blue-50",
            },
            confirmed: {
                label: "Dikonfirmasi",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
                dotColor: "bg-green-500",
                bgColor: "bg-green-50",
            },
            in_progress: {
                label: "Berlangsung",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
                dotColor: "bg-yellow-500",
                bgColor: "bg-yellow-50",
            },
            completed: {
                label: "Selesai",
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: CheckCircle,
                dotColor: "bg-purple-500",
                bgColor: "bg-purple-50",
            },
            canceled: {
                label: "Dibatalkan",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: X,
                dotColor: "bg-red-500",
                bgColor: "bg-red-50",
            },
            no_show: {
                label: "Tidak Hadir",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: X,
                dotColor: "bg-gray-500",
                bgColor: "bg-gray-50",
            },
        };
        return statusMap[status] || statusMap.scheduled;
    };

    // ENHANCED: Handle navigation to specific appointment
    const handleNavigateToAppointment = async (appointmentId) => {
        if (appointmentId === currentAppointmentId) {
            // Already on this appointment, just show a message
            alert("Anda sedang melihat appointment ini saat ini");
            return;
        }

        setIsNavigating(true);
        setLoadingAppointmentId(appointmentId);

        try {
            console.log(
                "[AppointmentHistoryTab] Navigating to appointment:",
                appointmentId
            );

            // Navigate to the appointment show page with history tab
            router.visit(
                route("doctor.appointments.show", appointmentId) +
                    "?tab=history",
                {
                    onSuccess: () => {
                        console.log(
                            "[AppointmentHistoryTab] Navigation successful"
                        );
                    },
                    onError: (error) => {
                        console.error(
                            "[AppointmentHistoryTab] Navigation error:",
                            error
                        );
                        alert("Gagal membuka appointment. Silakan coba lagi.");
                    },
                    onFinish: () => {
                        setIsNavigating(false);
                        setLoadingAppointmentId(null);
                    },
                }
            );
        } catch (error) {
            console.error("[AppointmentHistoryTab] Navigation error:", error);
            setIsNavigating(false);
            setLoadingAppointmentId(null);
            alert("Terjadi kesalahan saat membuka appointment.");
        }
    };

    // Handle open examination panel
    const handleOpenExamination = (appointmentId) => {
        console.log(
            "[AppointmentHistoryTab] Opening examination for:",
            appointmentId
        );
        router.visit(route("doctor.examination.show", appointmentId));
    };

    // Filter appointments based on search and status
    const filteredAppointments = appointmentHistory.filter((appointment) => {
        const matchesSearch =
            !searchTerm ||
            appointment.chief_complaint
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            appointment.notes
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            formatLongDate(appointment.appointment_date)
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Get displayed appointments (limit based on maxDisplayItems)
    const displayedAppointments = filteredAppointments.slice(
        0,
        maxDisplayItems
    );
    const hasMoreAppointments = filteredAppointments.length > maxDisplayItems;

    // Calculate summary statistics
    const completedCount = appointmentHistory.filter(
        (apt) => apt.status === "completed"
    ).length;
    const canceledCount = appointmentHistory.filter(
        (apt) => apt.status === "canceled"
    ).length;
    const totalCount = appointmentHistory.length;

    if (!appointmentHistory || appointmentHistory.length === 0) {
        return (
            <div className={`space-y-6 ${className}`}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-lg">
                            <History className="h-5 w-5 mr-2" />
                            Riwayat Appointment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Belum Ada Riwayat Appointment
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Belum ada riwayat appointment antara pasien{" "}
                                <span className="font-medium">
                                    {patientData.name}
                                </span>{" "}
                                dengan dokter ini.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with summary and search */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <History className="h-5 w-5 mr-2" />
                            Riwayat Appointment
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({appointmentHistory.length} appointment)
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {patientData.name}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                                {totalCount}
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Appointment
                            </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {completedCount}
                            </div>
                            <div className="text-sm text-gray-600">Selesai</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {canceledCount}
                            </div>
                            <div className="text-sm text-gray-600">
                                Dibatalkan
                            </div>
                        </div>
                    </div>

                    {/* Current Appointment Indicator */}
                    {currentAppointment && (
                        <Alert className="border-blue-200 bg-blue-50 mb-6">
                            <Target className="h-4 w-4" />
                            <AlertTitle className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                Appointment yang Sedang Dibuka
                            </AlertTitle>
                            <AlertDescription>
                                Anda sedang melihat appointment pada{" "}
                                <span className="font-semibold text-blue-700">
                                    {formatLongDate(
                                        currentAppointment.appointment_date
                                    )}
                                </span>{" "}
                                pukul{" "}
                                <span className="font-semibold text-blue-700">
                                    {formatTime(
                                        currentAppointment.appointment_time
                                    )}
                                </span>{" "}
                                dengan status{" "}
                                <span className="font-semibold text-blue-700">
                                    {
                                        getStatusInfo(currentAppointment.status)
                                            .label
                                    }
                                </span>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Search and Filter */}
                    <div className="flex space-x-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan keluhan, catatan, atau tanggal..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Semua Status</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="confirmed">Dikonfirmasi</option>
                            <option value="in_progress">Berlangsung</option>
                            <option value="completed">Selesai</option>
                            <option value="canceled">Dibatalkan</option>
                            <option value="no_show">Tidak Hadir</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Appointment Timeline */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                        <Activity className="h-5 w-5 mr-2" />
                        Timeline Appointment
                        {filteredAppointments.length !==
                            appointmentHistory.length && (
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({filteredAppointments.length} dari{" "}
                                {appointmentHistory.length})
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">
                                Tidak ada appointment yang sesuai dengan filter
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                }}
                                className="mt-3"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedAppointments.map(
                                (historyAppointment, index) => {
                                    const statusInfo = getStatusInfo(
                                        historyAppointment.status
                                    );
                                    const StatusIcon = statusInfo.icon;
                                    const isCurrent =
                                        historyAppointment.is_current ||
                                        historyAppointment.id ===
                                            currentAppointmentId;
                                    const isLast =
                                        index ===
                                        displayedAppointments.length - 1;
                                    const isLoading =
                                        loadingAppointmentId ===
                                        historyAppointment.id;

                                    return (
                                        <div
                                            key={historyAppointment.id}
                                            className={`relative flex items-start space-x-4 p-5 rounded-lg border transition-all duration-200 ${
                                                isCurrent
                                                    ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                            }`}
                                        >
                                            {/* Timeline connector */}
                                            {!isLast && (
                                                <div className="absolute left-8 top-20 w-0.5 h-8 bg-gray-200"></div>
                                            )}

                                            {/* Status indicator with timeline dot */}
                                            <div className="flex-shrink-0 relative">
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 shadow-sm ${
                                                        isCurrent
                                                            ? "bg-blue-500 border-blue-300 ring-2 ring-blue-100"
                                                            : `${statusInfo.dotColor} border-white`
                                                    }`}
                                                >
                                                    {isCurrent && (
                                                        <div className="absolute -top-1 -right-1">
                                                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Appointment content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header with date and status */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-3">
                                                        <h4 className="text-base font-semibold text-gray-900">
                                                            {formatLongDate(
                                                                historyAppointment.appointment_date
                                                            )}
                                                        </h4>
                                                        <span className="text-gray-400">
                                                            •
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {formatTime(
                                                                historyAppointment.appointment_time
                                                            )}
                                                        </span>
                                                        {isCurrent && (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                <Target className="h-3 w-3 mr-1" />
                                                                Sedang Dibuka
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Status badge */}
                                                    <div
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusInfo.label}
                                                    </div>
                                                </div>

                                                {/* Chief complaint */}
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        <span className="font-medium">
                                                            Keluhan:{" "}
                                                        </span>
                                                        {historyAppointment.chief_complaint
                                                            ? historyAppointment
                                                                  .chief_complaint
                                                                  .length > 100
                                                                ? historyAppointment.chief_complaint.substring(
                                                                      0,
                                                                      100
                                                                  ) + "..."
                                                                : historyAppointment.chief_complaint
                                                            : "Tidak ada keluhan tercatat"}
                                                    </p>
                                                </div>

                                                {/* Additional info */}
                                                <div className="flex items-center space-x-4 mb-3">
                                                    {/* Schedule info */}
                                                    {historyAppointment.schedule && (
                                                        <span className="text-xs text-gray-500">
                                                            Jadwal:{" "}
                                                            {historyAppointment
                                                                .schedule
                                                                .formatted_time ||
                                                                "N/A"}
                                                        </span>
                                                    )}

                                                    {/* Queue info */}
                                                    {historyAppointment.queue && (
                                                        <span className="text-xs text-gray-500">
                                                            Antrian: #
                                                            {
                                                                historyAppointment
                                                                    .queue
                                                                    .queue_number
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex items-center space-x-2">
                                                    {!isCurrent ? (
                                                        <>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleNavigateToAppointment(
                                                                        historyAppointment.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isNavigating
                                                                }
                                                                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                {isLoading ? (
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                                ) : (
                                                                    <Navigation className="h-3 w-3" />
                                                                )}
                                                                <span className="text-xs">
                                                                    {isLoading
                                                                        ? "Membuka..."
                                                                        : "Telusuri"}
                                                                </span>
                                                            </Button>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleOpenExamination(
                                                                        historyAppointment.id
                                                                    )
                                                                }
                                                                className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            >
                                                                <Stethoscope className="h-3 w-3" />
                                                                <span className="text-xs">
                                                                    Pemeriksaan
                                                                </span>
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                                            <Target className="h-4 w-4 mr-1" />
                                                            <span className="text-sm font-medium">
                                                                Appointment
                                                                Aktif
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Notes if available */}
                                                {historyAppointment.notes && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-xs text-gray-600">
                                                            <span className="font-medium">
                                                                Catatan:{" "}
                                                            </span>
                                                            {historyAppointment
                                                                .notes.length >
                                                            80
                                                                ? historyAppointment.notes.substring(
                                                                      0,
                                                                      80
                                                                  ) + "..."
                                                                : historyAppointment.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Navigation arrow */}
                                            <div className="flex-shrink-0">
                                                {!isCurrent && (
                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}

                            {/* Show more indicator */}
                            {hasMoreAppointments && (
                                <div className="text-center py-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        +
                                        {filteredAppointments.length -
                                            maxDisplayItems}{" "}
                                        appointment lainnya tidak ditampilkan
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 text-blue-600 hover:text-blue-700"
                                        onClick={() => {
                                            // Could implement pagination or "show more" functionality
                                            console.log(
                                                "Show more appointments"
                                            );
                                        }}
                                    >
                                        Lihat Semua Appointment
                                    </Button>
                                </div>
                            )}

                            {/* Empty state for single appointment */}
                            {appointmentHistory.length === 1 && (
                                <div className="text-center py-6 border-t border-gray-200">
                                    <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Ini adalah appointment pertama untuk
                                        pasien ini
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.visit(route("doctor.appointments.index"))
                            }
                            className="flex items-center space-x-1"
                        >
                            <Calendar className="h-4 w-4" />
                            <span>Semua Appointment</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.visit(route("doctor.appointments.today"))
                            }
                            className="flex items-center space-x-1"
                        >
                            <Clock className="h-4 w-4" />
                            <span>Appointment Hari Ini</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.visit(
                                    route("patients.show", patientData.id)
                                )
                            }
                            className="flex items-center space-x-1"
                        >
                            <User className="h-4 w-4" />
                            <span>Profil Pasien</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AppointmentHistoryTab;
