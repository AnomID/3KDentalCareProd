// File: resources/js/Pages/Dokter/Appointment/components/AppointmentTab.jsx
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
    Calendar,
    Clock,
    User,
    CheckCircle,
    AlertTriangle,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    CalendarCheck,
    Info,
    FileText,
    ExternalLink,
} from "lucide-react";

const AppointmentTab = ({
    appointment,
    patientData,
    appointmentContext = null,
    examinationContext = null, // From examination flow
    className = "",
}) => {
    // Determine which context to use (examination context has priority)
    const activeContext = examinationContext || appointmentContext;

    const [mode, setMode] = useState("view"); // view, create, edit
    const [isEditing, setIsEditing] = useState(false);
    const [nextAppointment, setNextAppointment] = useState(null);

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

    // Initialize based on context
    useEffect(() => {
        if (activeContext) {
            if (
                activeContext.mode === "show_next" &&
                activeContext.appointment_to_show
            ) {
                setNextAppointment(activeContext.appointment_to_show);
                setMode("view");
            } else if (activeContext.mode === "create_new") {
                setMode("create");
            }
        }
    }, [activeContext]);

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

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(0, 5);
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
        };
        return statusMap[status] || statusMap.scheduled;
    };

    // Navigate to examination panel
    const handleOpenExamination = (appointmentId) => {
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

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleCreateSubmit = async (e) => {
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

            const appointmentData = {
                patient_id: patientData.id,
                doctor_id: appointment.doctor_id,
                schedule_id: formData.schedule_id,
                appointment_date: formData.appointment_date,
                appointment_time: selectedSchedule.start_time,
                chief_complaint: formData.chief_complaint,
                notes: formData.notes,
                status: "scheduled",
            };

            router.post(
                route("doctor.appointments.create-appointment"),
                appointmentData,
                {
                    onSuccess: (response) => {
                        const newAppointment = response.props?.appointment || {
                            ...appointmentData,
                            id: Date.now(),
                            schedule: selectedSchedule,
                        };

                        setNextAppointment(newAppointment);
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
        if (nextAppointment) {
            setFormData({
                appointment_date: nextAppointment.appointment_date,
                schedule_id: nextAppointment.schedule_id?.toString() || "",
                chief_complaint: nextAppointment.chief_complaint || "",
                notes: nextAppointment.notes || "",
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
                route("doctor.appointments.update", nextAppointment.id),
                updateData,
                {
                    onSuccess: (response) => {
                        const updatedAppointment = {
                            ...nextAppointment,
                            ...updateData,
                            schedule: selectedSchedule,
                        };

                        setNextAppointment(updatedAppointment);
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
                route("doctor.appointments.destroy", nextAppointment.id),
                {
                    onSuccess: () => {
                        setNextAppointment(null);
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

    // Check permissions
    const canEditAppointment = () => {
        if (!nextAppointment) return false;
        if (activeContext) {
            return activeContext.can_edit;
        }
        return nextAppointment.status === "scheduled";
    };

    const canDeleteAppointment = () => {
        if (!nextAppointment) return false;
        if (activeContext) {
            return activeContext.can_delete;
        }
        return nextAppointment.status === "scheduled";
    };

    // Render current appointment info
    const renderCurrentAppointmentInfo = () => (
        <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-800 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Appointment Saat Ini
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Pasien:</span>
                    <span className="font-medium">{patientData.name}</span>
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
                        {formatTime(appointment.appointment_time)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-purple-600">
                        {appointment.status === "completed"
                            ? "Selesai"
                            : appointment.status}
                    </span>
                </div>
            </CardContent>
        </Card>
    );

    // Render view mode (showing existing next appointment)
    const renderViewMode = () => {
        if (!nextAppointment) {
            return (
                <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                        Belum ada appointment selanjutnya
                    </p>
                    <Button
                        onClick={() => setMode("create")}
                        className="mt-4 flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Buat Appointment Baru</span>
                    </Button>
                </div>
            );
        }

        const statusInfo = getStatusInfo(nextAppointment.status);
        const StatusIcon = statusInfo.icon;

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <CalendarCheck className="h-5 w-5 mr-2" />
                                Appointment Selanjutnya
                            </span>
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                                >
                                    <StatusIcon className="h-3 w-3 inline mr-1" />
                                    {statusInfo.label}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleOpenExamination(
                                            nextAppointment.id
                                        )
                                    }
                                    className="flex items-center space-x-1"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Buka Pemeriksaan</span>
                                </Button>
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
                                        nextAppointment.appointment_date
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Waktu
                                </label>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatTime(
                                        nextAppointment.appointment_time ||
                                            nextAppointment.schedule?.start_time
                                    )}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Keluhan Utama
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                                {nextAppointment.chief_complaint}
                            </p>
                        </div>

                        {nextAppointment.notes && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Catatan
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {nextAppointment.notes}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            {canEditAppointment() && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEdit}
                                    className="flex items-center space-x-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                </Button>
                            )}
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
                                        {deleting ? "Menghapus..." : "Hapus"}
                                    </span>
                                </Button>
                            )}
                        </div>

                        {!canEditAppointment() && (
                            <Alert className="border-blue-200 bg-blue-50">
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Appointment ini tidak dapat diedit karena
                                    statusnya sudah "{nextAppointment.status}".
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Option to create additional appointment */}
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
            </div>
        );
    };

    // Render create/edit form
    const renderFormMode = () => (
        <div className="space-y-6">
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
                        <span className="font-medium">{patientData.name}</span>
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
                        onClick={() => setMode("view")}
                        className="flex items-center space-x-2"
                    >
                        <X className="h-4 w-4" />
                        <span>Tutup</span>
                    </Button>
                </div>
            </div>

            {/* Error Messages */}
            {errors.general && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
            )}

            {renderCurrentAppointmentInfo()}

            {/* Form */}
            <form
                onSubmit={mode === "edit" ? handleUpdate : handleCreateSubmit}
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
                                        Tidak ada jadwal tersedia pada tanggal
                                        ini
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
                {isFormValid() && (
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

    return (
        <div className={`space-y-6 ${className}`}>
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

            {/* Context Info */}
            {activeContext && (
                <Alert
                    variant="default"
                    className={
                        activeContext.mode === "create_new"
                            ? "border-blue-200 bg-blue-50"
                            : activeContext.can_edit
                            ? "border-green-200 bg-green-50"
                            : "border-orange-200 bg-orange-50"
                    }
                >
                    <Info className="h-4 w-4" />
                    <AlertTitle>
                        {activeContext.mode === "create_new"
                            ? "Appointment Terakhir"
                            : activeContext.can_edit
                            ? "Appointment Dapat Dikelola"
                            : "Appointment Hanya Dapat Dilihat"}
                    </AlertTitle>
                    <AlertDescription>{activeContext.message}</AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            {mode === "view" ? renderViewMode() : renderFormMode()}
        </div>
    );
};

export default AppointmentTab;
