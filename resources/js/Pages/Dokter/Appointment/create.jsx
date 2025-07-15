import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    User,
    FileText,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    Loader,
    CalendarPlus,
} from "lucide-react";

const CreateAppointmentForm = ({
    appointment,
    isOpen,
    onClose,
    patients = [],
    onSuccess,
}) => {
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(
        appointment ? appointment.patient_id : ""
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: appointment ? appointment.patient_id : "",
        appointment_date: "",
        schedule_id: "",
        chief_complaint: "",
        notes: "",
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (appointment) {
                setData({
                    patient_id: appointment.patient_id,
                    appointment_date: "",
                    schedule_id: "",
                    chief_complaint: appointment.chief_complaint || "",
                    notes: "",
                });
                setSelectedPatient(appointment.patient_id);
            } else {
                reset();
                setSelectedPatient("");
            }
            setAvailableSchedules([]);
            setSelectedDate("");
        }
    }, [isOpen, appointment]);

    // Get available schedules when date changes
    useEffect(() => {
        if (
            selectedDate &&
            selectedDate >= new Date().toISOString().split("T")[0]
        ) {
            fetchAvailableSchedules(selectedDate);
        } else {
            setAvailableSchedules([]);
        }
    }, [selectedDate]);

    const fetchAvailableSchedules = async (date) => {
        setLoadingSchedules(true);
        try {
            const response = await fetch(
                `/api/doctor/available-schedules?date=${date}`
            );
            if (response.ok) {
                const result = await response.json();
                setAvailableSchedules(result.schedules || []);
            } else {
                console.error("Failed to fetch schedules");
                setAvailableSchedules([]);
            }
        } catch (error) {
            console.error("Error fetching schedules:", error);
            setAvailableSchedules([]);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        setData("appointment_date", date);
        setData("schedule_id", ""); // Reset schedule selection
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("doctor.appointments.store"), {
            onSuccess: () => {
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
                reset();
            },
            onError: (errors) => {
                console.error("Form submission errors:", errors);
            },
        });
    };

    const getMinDate = () => {
        return new Date().toISOString().split("T")[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
        return maxDate.toISOString().split("T")[0];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CalendarPlus size={24} className="mr-3" />
                            <h2 className="text-xl font-semibold">
                                Buat Appointment Baru
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {appointment && (
                        <p className="text-blue-100 text-sm mt-2">
                            Pasien: {appointment.patient.name} (No. RM:{" "}
                            {appointment.patient.no_rm})
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Patient Selection (only if not from existing appointment) */}
                    {!appointment && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline mr-2" />
                                Pilih Pasien
                            </label>
                            <select
                                value={data.patient_id}
                                onChange={(e) =>
                                    setData("patient_id", e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Pilih Pasien</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.name} - {patient.no_rm}
                                    </option>
                                ))}
                            </select>
                            {errors.patient_id && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.patient_id}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar size={16} className="inline mr-2" />
                            Tanggal Appointment
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={getMinDate()}
                            max={getMaxDate()}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.appointment_date && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                {errors.appointment_date}
                            </p>
                        )}
                    </div>

                    {/* Schedule Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock size={16} className="inline mr-2" />
                            Pilih Jadwal
                        </label>

                        {loadingSchedules ? (
                            <div className="flex items-center justify-center py-8 border border-gray-300 rounded-lg">
                                <Loader
                                    className="animate-spin mr-2"
                                    size={20}
                                />
                                <span className="text-gray-600">
                                    Memuat jadwal tersedia...
                                </span>
                            </div>
                        ) : availableSchedules.length > 0 ? (
                            <div className="space-y-3">
                                {availableSchedules.map((schedule) => (
                                    <label
                                        key={schedule.id}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                                            data.schedule_id ===
                                            schedule.id.toString()
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="schedule_id"
                                            value={schedule.id}
                                            checked={
                                                data.schedule_id ===
                                                schedule.id.toString()
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "schedule_id",
                                                    e.target.value
                                                )
                                            }
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {
                                                            schedule.formatted_time
                                                        }
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {schedule.day_name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-medium text-green-600">
                                                        {
                                                            schedule.remaining_quota
                                                        }{" "}
                                                        slot tersisa
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : selectedDate ? (
                            <div className="text-center py-8 border border-gray-300 rounded-lg">
                                <Calendar
                                    className="mx-auto text-gray-400 mb-3"
                                    size={48}
                                />
                                <p className="text-gray-500">
                                    Tidak ada jadwal tersedia untuk tanggal ini
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Silahkan pilih tanggal lain
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-gray-300 rounded-lg">
                                <Calendar
                                    className="mx-auto text-gray-400 mb-3"
                                    size={48}
                                />
                                <p className="text-gray-500">
                                    Pilih tanggal untuk melihat jadwal tersedia
                                </p>
                            </div>
                        )}

                        {errors.schedule_id && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                {errors.schedule_id}
                            </p>
                        )}
                    </div>

                    {/* Chief Complaint */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText size={16} className="inline mr-2" />
                            Keluhan Utama
                        </label>
                        <textarea
                            value={data.chief_complaint}
                            onChange={(e) =>
                                setData("chief_complaint", e.target.value)
                            }
                            placeholder="Masukkan keluhan utama pasien..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            required
                        />
                        {errors.chief_complaint && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                {errors.chief_complaint}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText size={16} className="inline mr-2" />
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Catatan tambahan untuk appointment ini..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.schedule_id}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                        >
                            {processing ? (
                                <>
                                    <Loader
                                        className="animate-spin mr-2"
                                        size={18}
                                    />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Buat Appointment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAppointmentForm;
