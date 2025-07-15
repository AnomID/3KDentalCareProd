// File: resources/js/Pages/Dokter/ExaminationPanel/components/AppointmentSection.jsx (Enhanced with History)
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import AppointmentHistoryCard from "./AppointmentHistoryCard";
import {
    Calendar,
    Clock,
    User,
    CheckCircle,
    AlertTriangle,
    Plus,
    ArrowLeft,
    Edit,
    Trash2,
    Eye,
    Save,
    X,
    CalendarCheck,
    Info,
    FileText,
    History,
    ExternalLink,
    ChevronRight,
    Search,
} from "lucide-react";

const AppointmentSection = ({
    patient,
    appointment,
    appointmentContext = null, // Enhanced appointment context
    appointmentHistory = [], // Complete appointment history
    onBack,
    canEdit = true,
}) => {
    // Determine initial mode based on appointment context
    const getInitialMode = () => {
        if (!appointmentContext) return "history";

        switch (appointmentContext.mode) {
            case "create_new":
                return "create";
            case "show_next":
                return "view_existing";
            default:
                return "history";
        }
    };

    const [mode, setMode] = useState(getInitialMode);
    const [createdAppointment, setCreatedAppointment] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showHistory, setShowHistory] = useState(true);

    const [formData, setFormData] = useState({
        appointment_date: "",
        schedule_id: "",
        chief_complaint: "",
        notes: "",
    });

    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    // Initialize with existing appointment data if in view mode
    useEffect(() => {
        if (
            appointmentContext?.mode === "show_next" &&
            appointmentContext.appointment_to_show
        ) {
            setCreatedAppointment(appointmentContext.appointment_to_show);
        }
    }, [appointmentContext]);

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    };

    // Get maximum date (3 months from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        return maxDate.toISOString().split("T")[0];
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Format short date for display
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
            },
            confirmed: {
                label: "Dikonfirmasi",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
            },
            in_progress: {
                label: "Berlangsung",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
            },
            completed: {
                label: "Selesai",
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: CheckCircle,
            },
            canceled: {
                label: "Dibatalkan",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: X,
            },
            no_show: {
                label: "Tidak Hadir",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: X,
            },
        };
        return statusMap[status] || statusMap.scheduled;
    };

    // Handle navigation to appointment examination
    const handleNavigateToAppointment = (appointmentId) => {
        router.visit(route("doctor.examination.show", appointmentId));
    };

    // Fetch available schedules when date changes
    useEffect(() => {
        if (formData.appointment_date && appointment?.doctor_id) {
            fetchAvailableSchedules();
        }
    }, [formData.appointment_date]);

    const fetchAvailableSchedules = async () => {
        setLoadingSchedules(true);
        setAvailableSchedules([]);
        if (!isEditing) {
            setFormData((prev) => ({ ...prev, schedule_id: "" }));
        }

        try {
            const response = await fetch(
                `/api/appointments/available-schedules?doctor_id=${appointment.doctor_id}&date=${formData.appointment_date}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch schedules");
            }

            const data = await response.json();
            setAvailableSchedules(data.schedules || []);
        } catch (error) {
            console.error("Error fetching schedules:", error);
            setErrors({ date: "Gagal memuat jadwal yang tersedia" });
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear related errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setSuccessMessage("");

        try {
            const selectedSchedule = availableSchedules.find(
                (s) => s.id.toString() === formData.schedule_id
            );

            if (!selectedSchedule) {
                throw new Error("Jadwal tidak valid");
            }

            const appointmentData = {
                patient_id: patient.id,
                doctor_id: appointment.doctor_id,
                schedule_id: formData.schedule_id,
                appointment_date: formData.appointment_date,
                appointment_time: selectedSchedule.start_time,
                chief_complaint: formData.chief_complaint,
                notes: formData.notes,
                status: "scheduled",
            };

            router.post(
                route("doctor.appointment.create-appointment"),
                appointmentData,
                {
                    onSuccess: (response) => {
                        const newAppointment = response.props?.appointment || {
                            ...appointmentData,
                            id: Date.now(),
                            schedule: selectedSchedule,
                        };

                        setCreatedAppointment(newAppointment);
                        setMode("view");
                        setSuccessMessage("Appointment berhasil dibuat!");

                        // Clear form
                        setFormData({
                            appointment_date: "",
                            schedule_id: "",
                            chief_complaint: "",
                            notes: "",
                        });
                        setAvailableSchedules([]);
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    },
                    onFinish: () => {
                        setSubmitting(false);
                    },
                }
            );
        } catch (error) {
            setErrors({ general: error.message });
            setSubmitting(false);
        }
    };

    const handleEdit = () => {
        if (createdAppointment) {
            setFormData({
                appointment_date: createdAppointment.appointment_date,
                schedule_id: createdAppointment.schedule_id?.toString() || "",
                chief_complaint: createdAppointment.chief_complaint || "",
                notes: createdAppointment.notes || "",
            });
            setIsEditing(true);
            setMode("edit");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const selectedSchedule = availableSchedules.find(
                (s) => s.id.toString() === formData.schedule_id
            );

            if (!selectedSchedule) {
                throw new Error("Jadwal tidak valid");
            }

            const updateData = {
                schedule_id: formData.schedule_id,
                appointment_date: formData.appointment_date,
                appointment_time: selectedSchedule.start_time,
                chief_complaint: formData.chief_complaint,
                notes: formData.notes,
                _method: "PUT",
            };

            router.put(
                route("doctor.appointments.update", createdAppointment.id),
                updateData,
                {
                    onSuccess: (response) => {
                        const updatedAppointment = {
                            ...createdAppointment,
                            ...updateData,
                            schedule: selectedSchedule,
                        };

                        setCreatedAppointment(updatedAppointment);
                        setMode("view");
                        setIsEditing(false);
                        setSuccessMessage("Appointment berhasil diupdate!");
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    },
                    onFinish: () => {
                        setSubmitting(false);
                    },
                }
            );
        } catch (error) {
            setErrors({ general: error.message });
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus appointment ini?")) {
            return;
        }

        setDeleting(true);

        try {
            router.delete(
                route("doctor.appointments.destroy", createdAppointment.id),
                {
                    onSuccess: () => {
                        setCreatedAppointment(null);
                        setMode("create");
                        setSuccessMessage("Appointment berhasil dihapus!");

                        // Clear form
                        setFormData({
                            appointment_date: "",
                            schedule_id: "",
                            chief_complaint: "",
                            notes: "",
                        });
                        setAvailableSchedules([]);
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    },
                    onFinish: () => {
                        setDeleting(false);
                    },
                }
            );
        } catch (error) {
            setErrors({ general: error.message });
            setDeleting(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setMode("view");
        setFormData({
            appointment_date: "",
            schedule_id: "",
            chief_complaint: "",
            notes: "",
        });
        setAvailableSchedules([]);
        setErrors({});
    };

    const isFormValid = () => {
        return (
            formData.appointment_date &&
            formData.schedule_id &&
            formData.chief_complaint.trim()
        );
    };

    // Check if appointment can be edited based on appointment context
    const canEditAppointment = () => {
        if (!createdAppointment) return false;

        // If appointment context is provided, use its permissions
        if (appointmentContext) {
            return appointmentContext.can_edit && canEdit;
        }

        // Fallback to status-based check
        return createdAppointment.status === "scheduled" && canEdit;
    };

    // Check if appointment can be deleted based on appointment context
    const canDeleteAppointment = () => {
        if (!createdAppointment) return false;

        // If appointment context is provided, use its permissions
        if (appointmentContext) {
            return appointmentContext.can_delete && canEdit;
        }

        // Fallback to status-based check
        return createdAppointment.status === "scheduled" && canEdit;
    };

    // Render Appointment History Section
    const renderAppointmentHistory = () => {
        if (
            !showHistory ||
            !appointmentHistory ||
            appointmentHistory.length === 0
        ) {
            return null;
        }

        return (
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                        <History className="h-5 w-5 mr-2" />
                        Riwayat Appointment
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({appointmentHistory.length} appointment)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {appointmentHistory.map((historyAppointment) => {
                            const statusInfo = getStatusInfo(
                                historyAppointment.status
                            );
                            const StatusIcon = statusInfo.icon;
                            const isCurrent = historyAppointment.is_current;

                            return (
                                <div
                                    key={historyAppointment.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                                        isCurrent
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    isCurrent
                                                        ? "bg-blue-500"
                                                        : statusInfo.color.includes(
                                                              "blue"
                                                          )
                                                        ? "bg-blue-500"
                                                        : statusInfo.color.includes(
                                                              "green"
                                                          )
                                                        ? "bg-green-500"
                                                        : statusInfo.color.includes(
                                                              "yellow"
                                                          )
                                                        ? "bg-yellow-500"
                                                        : statusInfo.color.includes(
                                                              "purple"
                                                          )
                                                        ? "bg-purple-500"
                                                        : statusInfo.color.includes(
                                                              "red"
                                                          )
                                                        ? "bg-red-500"
                                                        : "bg-gray-500"
                                                }`}
                                            ></div>
                                        </div>
                                        <div className="flex-1">
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
                                                {isCurrent && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Saat Ini
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {historyAppointment.chief_complaint
                                                    ? historyAppointment
                                                          .chief_complaint
                                                          .length > 50
                                                        ? historyAppointment.chief_complaint.substring(
                                                              0,
                                                              50
                                                          ) + "..."
                                                        : historyAppointment.chief_complaint
                                                    : "Tidak ada keluhan"}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                                            >
                                                <StatusIcon className="h-3 w-3 inline mr-1" />
                                                {statusInfo.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {!isCurrent && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleNavigateToAppointment(
                                                        historyAppointment.id
                                                    )
                                                }
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                                            >
                                                <Search className="h-4 w-4" />
                                                <span>Telusuri</span>
                                            </Button>
                                        )}
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Render main content based on mode
    const renderMainContent = () => {
        // Start with history view by default
        if (mode === "history") {
            return (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Manajemen Appointment
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Kelola appointment untuk pasien{" "}
                                <span className="font-medium">
                                    {patient.name}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={onBack}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Kembali</span>
                            </Button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert
                            variant="success"
                            className="border-green-200 bg-green-50"
                        >
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Berhasil</AlertTitle>
                            <AlertDescription>
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Appointment Context Info */}
                    {appointmentContext && (
                        <Alert
                            variant="default"
                            className={
                                appointmentContext.mode === "create_new"
                                    ? "border-blue-200 bg-blue-50"
                                    : appointmentContext.can_edit
                                    ? "border-green-200 bg-green-50"
                                    : "border-orange-200 bg-orange-50"
                            }
                        >
                            <Info className="h-4 w-4" />
                            <AlertTitle>
                                {appointmentContext.mode === "create_new"
                                    ? "Appointment Terakhir"
                                    : appointmentContext.can_edit
                                    ? "Appointment Dapat Dikelola"
                                    : "Appointment Hanya Dapat Dilihat"}
                            </AlertTitle>
                            <AlertDescription>
                                {appointmentContext.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Appointment History */}
                    {renderAppointmentHistory()}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {appointmentContext?.mode === "create_new" && (
                            <Button
                                onClick={() => setMode("create")}
                                className="flex items-center space-x-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Buat Appointment Baru</span>
                            </Button>
                        )}

                        {appointmentContext?.mode === "show_next" && (
                            <>
                                <Button
                                    onClick={() => setMode("view_existing")}
                                    className="flex items-center space-x-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Lihat Appointment Selanjutnya</span>
                                </Button>
                                {appointmentContext.can_edit && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setCreatedAppointment(
                                                appointmentContext.appointment_to_show
                                            );
                                            handleEdit();
                                        }}
                                        className="flex items-center space-x-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span>
                                            Edit Appointment Selanjutnya
                                        </span>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        }

        // Render Existing Appointment View (for show_next mode)
        if (
            (mode === "view_existing" || mode === "view") &&
            createdAppointment
        ) {
            const statusInfo = getStatusInfo(createdAppointment.status);
            const StatusIcon = statusInfo.icon;

            return (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {appointmentContext?.mode === "show_next"
                                    ? "Appointment Selanjutnya"
                                    : "Appointment yang Dibuat"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {appointmentContext?.mode === "show_next"
                                    ? "Appointment yang sudah terjadwal untuk pasien ini"
                                    : "Detail appointment untuk pasien"}{" "}
                                <span className="font-medium">
                                    {patient.name}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {canEditAppointment() && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit}
                                        className="flex items-center space-x-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                    </Button>
                                    {canDeleteAppointment() && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                                        >
                                            {deleting ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                            <span>
                                                {deleting
                                                    ? "Menghapus..."
                                                    : "Hapus"}
                                            </span>
                                        </Button>
                                    )}
                                </>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setMode("history")}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Kembali</span>
                            </Button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert
                            variant="success"
                            className="border-green-200 bg-green-50"
                        >
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Berhasil</AlertTitle>
                            <AlertDescription>
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Appointment Context Info */}
                    {appointmentContext && (
                        <Alert
                            variant="default"
                            className={
                                appointmentContext.can_edit
                                    ? "border-green-200 bg-green-50"
                                    : "border-orange-200 bg-orange-50"
                            }
                        >
                            <Info className="h-4 w-4" />
                            <AlertTitle>
                                {appointmentContext.can_edit
                                    ? "Appointment Dapat Dikelola"
                                    : "Appointment Hanya Dapat Dilihat"}
                            </AlertTitle>
                            <AlertDescription>
                                {appointmentContext.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Appointment Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <CalendarCheck className="h-5 w-5 mr-2" />
                                    Detail Appointment
                                </span>
                                <div
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                                >
                                    <StatusIcon className="h-3 w-3 inline mr-1" />
                                    {statusInfo.label}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Tanggal
                                    </label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDate(
                                            createdAppointment.appointment_date
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Waktu
                                    </label>
                                    <p className="text-sm font-medium text-gray-900">
                                        {createdAppointment.appointment_time ||
                                            createdAppointment.schedule
                                                ?.start_time}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Keluhan Utama
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {createdAppointment.chief_complaint}
                                </p>
                            </div>

                            {createdAppointment.notes && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Catatan
                                    </label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {createdAppointment.notes}
                                    </p>
                                </div>
                            )}

                            {!canEditAppointment() && (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Eye className="h-4 w-4" />
                                    <AlertDescription>
                                        Appointment ini tidak dapat diedit
                                        karena statusnya sudah "
                                        {createdAppointment.status}
                                        ".
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action to create new appointment if in show_next mode */}
                    {appointmentContext?.mode === "show_next" && (
                        <Card className="border-dashed border-2 border-gray-300">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-4">
                                        Ingin membuat appointment tambahan?
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setMode("create");
                                            setCreatedAppointment(null);
                                            setSuccessMessage("");
                                        }}
                                        className="flex items-center space-x-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Buat Appointment Baru</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            );
        }

        // Render Create/Edit Form (rest of the component remains the same as before)
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === "edit"
                                ? "Edit Appointment"
                                : "Buat Appointment Baru"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {mode === "edit"
                                ? "Update jadwal temu untuk"
                                : "Buat jadwal temu lanjutan untuk"}{" "}
                            pasien{" "}
                            <span className="font-medium">{patient.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {mode === "edit" && (
                            <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="flex items-center space-x-2"
                            >
                                <X className="h-4 w-4" />
                                <span>Batal</span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setMode("history")}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </Button>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <Alert
                        variant="success"
                        className="border-green-200 bg-green-50"
                    >
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Error Messages */}
                {errors.general && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                )}

                {/* Current Appointment Info */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-blue-800 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Appointment Saat Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Dokter:</span>
                            <span className="font-medium">
                                {appointment.doctor?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal:</span>
                            <span className="font-medium">
                                {formatDate(appointment.appointment_date)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Waktu:</span>
                            <span className="font-medium">
                                {appointment.appointment_time}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Form */}
                <form
                    onSubmit={mode === "edit" ? handleUpdate : handleSubmit}
                    className="space-y-6"
                >
                    {/* Date Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Pilih Tanggal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Appointment
                                    </label>
                                    <input
                                        type="date"
                                        name="appointment_date"
                                        value={formData.appointment_date}
                                        onChange={handleInputChange}
                                        min={getMinDate()}
                                        max={getMaxDate()}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={!canEdit}
                                    />
                                    {errors.appointment_date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.appointment_date}
                                        </p>
                                    )}
                                </div>

                                {formData.appointment_date && (
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-600">
                                            Tanggal dipilih:{" "}
                                            <span className="font-medium text-gray-900">
                                                {formatDate(
                                                    formData.appointment_date
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule Selection */}
                    {formData.appointment_date && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Pilih Jadwal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingSchedules ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">
                                            Memuat jadwal tersedia...
                                        </span>
                                    </div>
                                ) : availableSchedules.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                                        <p className="text-gray-600">
                                            Tidak ada jadwal tersedia pada
                                            tanggal ini
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Silakan pilih tanggal lain
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {availableSchedules.map((schedule) => (
                                            <label
                                                key={schedule.id}
                                                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    formData.schedule_id ===
                                                    schedule.id.toString()
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="schedule_id"
                                                    value={schedule.id}
                                                    checked={
                                                        formData.schedule_id ===
                                                        schedule.id.toString()
                                                    }
                                                    onChange={handleInputChange}
                                                    className="sr-only"
                                                    disabled={!canEdit}
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                schedule.formatted_time
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {schedule.day_name}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-green-600">
                                                            {
                                                                schedule.remaining_quota
                                                            }{" "}
                                                            slot tersisa
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {errors.schedule_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.schedule_id}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Complaint and Notes */}
                    {formData.schedule_id && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Detail Appointment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Keluhan Utama{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="chief_complaint"
                                        value={formData.chief_complaint}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Jelaskan keluhan atau tujuan kunjungan..."
                                        disabled={!canEdit}
                                    />
                                    {errors.chief_complaint && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.chief_complaint}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catatan Tambahan
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Catatan tambahan (opsional)..."
                                        disabled={!canEdit}
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Button */}
                    {canEdit && isFormValid() && (
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setFormData({
                                        appointment_date: "",
                                        schedule_id: "",
                                        chief_complaint: "",
                                        notes: "",
                                    });
                                    setAvailableSchedules([]);
                                    setErrors({});
                                    setSuccessMessage("");
                                }}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !isFormValid()}
                                className="flex items-center space-x-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>
                                            {mode === "edit"
                                                ? "Menyimpan..."
                                                : "Membuat..."}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {mode === "edit" ? (
                                            <Save className="h-4 w-4" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                        <span>
                                            {mode === "edit"
                                                ? "Simpan Perubahan"
                                                : "Buat Appointment"}
                                        </span>
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        );
    };

    return <div className="space-y-6">{renderMainContent()}</div>;
};

export default AppointmentSection;
