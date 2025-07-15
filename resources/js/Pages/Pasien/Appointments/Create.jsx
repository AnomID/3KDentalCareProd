import React, { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Calendar,
    Clock,
    User,
    CheckCircle,
    AlertCircle,
    FileText,
    ArrowLeft,
    CalendarPlus,
    Users,
    Stethoscope,
    FileEdit,
    ChevronRight,
} from "lucide-react";

export default function PatientCreateAppointment({ patient }) {
    const { auth } = usePage().props;
    const flash = usePage().props.flash || {};
    const errors = usePage().props.errors || {};

    const [formData, setFormData] = useState({
        doctor_id: "",
        schedule_id: "",
        appointment_date: "",
        chief_complaint: "",
        notes: "",
    });
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState({
        doctors: false,
        schedules: false,
        submitting: false,
    });
    const [error, setError] = useState(null);

    // Handle server-side errors from Inertia
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setError("Terdapat kesalahan dalam form. Silakan periksa kembali.");
        }
    }, [errors]);

    // Handle flash messages
    useEffect(() => {
        if (flash.error) {
            setError(flash.error);
        }
    }, [flash]);

    // Reset flow when date changes
    useEffect(() => {
        if (formData.appointment_date) {
            fetchAvailableDoctors();
            setFormData((prev) => ({
                ...prev,
                doctor_id: "",
                schedule_id: "",
            }));
            setAvailableSchedules([]);
        } else {
            setAvailableDoctors([]);
            setAvailableSchedules([]);
            setFormData((prev) => ({
                ...prev,
                doctor_id: "",
                schedule_id: "",
            }));
        }
    }, [formData.appointment_date]);

    // Reset schedules when doctor changes
    useEffect(() => {
        if (formData.doctor_id && formData.appointment_date) {
            fetchAvailableSchedules();
            setFormData((prev) => ({ ...prev, schedule_id: "" }));
        } else {
            setAvailableSchedules([]);
            setFormData((prev) => ({ ...prev, schedule_id: "" }));
        }
    }, [formData.doctor_id, formData.appointment_date]);

    const fetchAvailableDoctors = async () => {
        setLoading((prev) => ({ ...prev, doctors: true }));
        setError(null);
        try {
            const response = await fetch(
                `/api/patients/available-doctors?date=${formData.appointment_date}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`
                );
            }

            const data = await response.json();

            if (data.success && data.doctors) {
                setAvailableDoctors(data.doctors);
            } else {
                setAvailableDoctors([]);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setError("Gagal memuat dokter yang tersedia: " + error.message);
            setAvailableDoctors([]);
        } finally {
            setLoading((prev) => ({ ...prev, doctors: false }));
        }
    };

    const fetchAvailableSchedules = async () => {
        setLoading((prev) => ({ ...prev, schedules: true }));
        setError(null);
        try {
            const response = await fetch(
                `/api/patients/available-schedules?date=${formData.appointment_date}&doctor_id=${formData.doctor_id}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`
                );
            }

            const data = await response.json();

            if (data.success && data.schedules) {
                setAvailableSchedules(data.schedules);
            } else {
                setAvailableSchedules([]);
            }
        } catch (error) {
            console.error("Error fetching schedules:", error);
            setError("Gagal memuat jadwal yang tersedia: " + error.message);
            setAvailableSchedules([]);
        } finally {
            setLoading((prev) => ({ ...prev, schedules: false }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear any error for this field when it changes
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Clear general error when user starts making changes
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate required fields before submission
        const requiredFields = [
            "appointment_date",
            "doctor_id",
            "schedule_id",
            "chief_complaint",
        ];
        const missingFields = requiredFields.filter(
            (field) => !formData[field]
        );

        if (missingFields.length > 0) {
            const fieldNames = {
                appointment_date: "Tanggal Janji Temu",
                doctor_id: "Dokter",
                schedule_id: "Jadwal",
                chief_complaint: "Keluhan Utama",
            };

            const missingFieldNames = missingFields
                .map((field) => fieldNames[field])
                .join(", ");
            setError(`Silakan lengkapi field berikut: ${missingFieldNames}`);
            return;
        }

        setError(null);
        setFormErrors({});
        setLoading((prev) => ({ ...prev, submitting: true }));

        console.log("Submitting appointment data:", formData);

        router.post(route("patient.appointments.store"), formData, {
            onStart: () => {
                console.log("Request started");
            },
            onProgress: (progress) => {
                console.log("Progress:", progress);
            },
            onSuccess: (page) => {
                setLoading((prev) => ({ ...prev, submitting: false }));
                console.log("Appointment created successfully", page);
            },
            onError: (errors) => {
                setLoading((prev) => ({ ...prev, submitting: false }));
                setFormErrors(errors);
                console.error("Appointment creation failed:", errors);

                if (Object.keys(errors).length > 0) {
                    setError(
                        "Terdapat kesalahan dalam form. Silakan periksa kembali."
                    );
                }
            },
            onFinish: () => {
                setLoading((prev) => ({ ...prev, submitting: false }));
                console.log("Request finished");
            },
        });
    };

    const getCurrentStep = () => {
        if (!formData.appointment_date) return 1;
        if (!formData.doctor_id) return 2;
        if (!formData.schedule_id) return 3;
        return 4;
    };

    const currentStep = getCurrentStep();

    // Get minimum date (today)
    const today = new Date().toISOString().split("T")[0];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-extrabold text-[#EEE4D3]">
                        Buat Janji Temu
                    </h2>
                    <span className="text-[#1D1D22] bg-[#F8D465] px-4 py-2 rounded-lg">
                        Halo, {auth.user.name}!
                    </span>
                </div>
            }
        >
            <Head title="Buat Janji Temu" />

            <div className="py-8 min-h-screen bg-gradient-to-r from-[#1D1D22] via-[#3C2A25] to-[#4F3623]">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <a
                        href={route("patient.appointments.index")}
                        className="inline-flex items-center text-[#EEE4D3] mb-6 hover:text-[#F8D465] transition-all"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Kembali ke Daftar Janji Temu
                    </a>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="bg-[#F8D465] p-6 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold text-[#1D1D22] mb-4">
                                Buat Janji Temu Baru
                            </h3>
                            <div className="flex items-center justify-between">
                                {[
                                    {
                                        step: 1,
                                        label: "Pilih Tanggal",
                                        icon: Calendar,
                                    },
                                    {
                                        step: 2,
                                        label: "Pilih Dokter",
                                        icon: Stethoscope,
                                    },
                                    {
                                        step: 3,
                                        label: "Pilih Jadwal",
                                        icon: Clock,
                                    },
                                    {
                                        step: 4,
                                        label: "Detail Keluhan",
                                        icon: FileText,
                                    },
                                ].map(({ step, label, icon: Icon }, index) => (
                                    <div
                                        key={step}
                                        className="flex items-center"
                                    >
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                                currentStep >= step
                                                    ? "bg-[#1D1D22] border-[#1D1D22] text-[#F8D465]"
                                                    : "bg-transparent border-[#1D1D22] text-[#1D1D22]"
                                            }`}
                                        >
                                            <Icon size={20} />
                                        </div>
                                        <div className="ml-3 hidden md:block">
                                            <p
                                                className={`text-sm font-medium ${
                                                    currentStep >= step
                                                        ? "text-[#1D1D22]"
                                                        : "text-[#3C2A25]"
                                                }`}
                                            >
                                                {label}
                                            </p>
                                        </div>
                                        {index < 3 && (
                                            <ChevronRight
                                                className={`mx-4 ${
                                                    currentStep > step
                                                        ? "text-[#1D1D22]"
                                                        : "text-[#3C2A25]"
                                                }`}
                                                size={20}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle size={18} className="mr-2" />
                                <p>{flash.success}</p>
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle size={18} className="mr-2" />
                                <p>{flash.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle size={18} className="mr-2" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Appointment Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Step 1: Date Selection */}
                            <div
                                className={`bg-[#D5CABB] p-6 rounded-lg shadow-lg transition-all duration-300 ${
                                    currentStep >= 1
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                            currentStep >= 1
                                                ? "bg-[#1D1D22] text-[#F8D465]"
                                                : "bg-[#3C2A25] text-[#EEE4D3]"
                                        }`}
                                    >
                                        <Calendar size={16} />
                                    </div>
                                    <h4 className="text-lg font-semibold text-[#1D1D22]">
                                        Pilih Tanggal Kunjungan
                                    </h4>
                                </div>

                                <input
                                    type="date"
                                    name="appointment_date"
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    min={today}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.appointment_date
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-[#C3A764] focus:ring-[#F8D465]"
                                    } focus:outline-none focus:ring-2 transition-all`}
                                    required
                                />
                                {formErrors.appointment_date && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.appointment_date}
                                    </p>
                                )}

                                {!formData.appointment_date && (
                                    <div className="bg-[#F8D465] bg-opacity-50 p-4 rounded-lg mt-3">
                                        <p className="text-sm text-[#1D1D22]">
                                            Pilih tanggal untuk melihat dokter
                                            yang tersedia
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Doctor Selection */}
                            <div
                                className={`bg-[#D5CABB] p-6 rounded-lg shadow-lg transition-all duration-300 ${
                                    currentStep >= 2
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                            currentStep >= 2
                                                ? "bg-[#1D1D22] text-[#F8D465]"
                                                : "bg-[#3C2A25] text-[#EEE4D3]"
                                        }`}
                                    >
                                        <Stethoscope size={16} />
                                    </div>
                                    <h4 className="text-lg font-semibold text-[#1D1D22]">
                                        Pilih Dokter
                                    </h4>
                                </div>

                                {loading.doctors ? (
                                    <div className="text-center py-4">
                                        <p className="text-[#1D1D22]">
                                            Memuat dokter yang tersedia...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {formData.appointment_date ? (
                                            <>
                                                {availableDoctors.length > 0 ? (
                                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                                        {availableDoctors.map(
                                                            (doctor) => (
                                                                <div
                                                                    key={
                                                                        doctor.id
                                                                    }
                                                                    onClick={() =>
                                                                        setFormData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                doctor_id:
                                                                                    doctor.id,
                                                                            })
                                                                        )
                                                                    }
                                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                                        formData.doctor_id ==
                                                                        doctor.id
                                                                            ? "border-[#C3A764] bg-[#F8D465]"
                                                                            : "border-[#D5CABB] hover:border-[#C3A764]"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <User
                                                                            size={
                                                                                20
                                                                            }
                                                                            className="text-[#1D1D22] mr-3"
                                                                        />
                                                                        <div>
                                                                            <h5 className="font-semibold text-[#1D1D22]">
                                                                                dr.{" "}
                                                                                {
                                                                                    doctor.name
                                                                                }
                                                                            </h5>
                                                                            <p className="text-sm text-[#1D1D22]">
                                                                                {
                                                                                    doctor.specialization
                                                                                }
                                                                            </p>
                                                                            <span className="text-xs bg-[#3C2A25] text-[#EEE4D3] px-2 py-1 rounded mt-1 inline-block">
                                                                                {
                                                                                    doctor.available_schedules_count
                                                                                }{" "}
                                                                                jadwal
                                                                                tersedia
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#F8D465] bg-opacity-50 p-4 rounded-lg">
                                                        <div className="flex items-center">
                                                            <AlertCircle
                                                                size={18}
                                                                className="text-[#1D1D22] mr-2"
                                                            />
                                                            <p className="text-sm text-[#1D1D22]">
                                                                Tidak ada dokter
                                                                tersedia pada
                                                                tanggal ini
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="bg-[#F8D465] bg-opacity-50 p-4 rounded-lg">
                                                <p className="text-sm text-[#1D1D22]">
                                                    Silakan pilih tanggal
                                                    terlebih dahulu
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {formErrors.doctor_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.doctor_id}
                                    </p>
                                )}
                            </div>

                            {/* Step 3: Schedule Selection */}
                            <div
                                className={`bg-[#D5CABB] p-6 rounded-lg shadow-lg transition-all duration-300 ${
                                    currentStep >= 3
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                            currentStep >= 3
                                                ? "bg-[#1D1D22] text-[#F8D465]"
                                                : "bg-[#3C2A25] text-[#EEE4D3]"
                                        }`}
                                    >
                                        <Clock size={16} />
                                    </div>
                                    <h4 className="text-lg font-semibold text-[#1D1D22]">
                                        Pilih Jadwal Praktik
                                    </h4>
                                </div>

                                {loading.schedules ? (
                                    <div className="text-center py-4">
                                        <p className="text-[#1D1D22]">
                                            Memuat jadwal...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {formData.doctor_id &&
                                        formData.appointment_date ? (
                                            <>
                                                {availableSchedules.length >
                                                0 ? (
                                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                                        {availableSchedules.map(
                                                            (schedule) => (
                                                                <div
                                                                    key={
                                                                        schedule.id
                                                                    }
                                                                    onClick={() =>
                                                                        setFormData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                schedule_id:
                                                                                    schedule.id,
                                                                            })
                                                                        )
                                                                    }
                                                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                                        formData.schedule_id ==
                                                                        schedule.id
                                                                            ? "border-[#C3A764] bg-[#F8D465]"
                                                                            : "border-[#D5CABB] hover:border-[#C3A764]"
                                                                    }`}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center">
                                                                            <Clock
                                                                                size={
                                                                                    16
                                                                                }
                                                                                className="text-[#1D1D22] mr-2"
                                                                            />
                                                                            <span className="text-[#1D1D22] font-medium">
                                                                                {
                                                                                    schedule.formatted_time
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="bg-[#3C2A25] text-[#EEE4D3] px-2 py-1 rounded text-xs">
                                                                            Kuota:{" "}
                                                                            {
                                                                                schedule.remaining_quota
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#F8D465] bg-opacity-50 p-4 rounded-lg">
                                                        <div className="flex items-center">
                                                            <AlertCircle
                                                                size={18}
                                                                className="text-[#1D1D22] mr-2"
                                                            />
                                                            <p className="text-sm text-[#1D1D22]">
                                                                Tidak ada jadwal
                                                                tersedia untuk
                                                                dokter ini
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="bg-[#F8D465] bg-opacity-50 p-4 rounded-lg">
                                                <p className="text-sm text-[#1D1D22]">
                                                    Silakan pilih tanggal dan
                                                    dokter terlebih dahulu
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {formErrors.schedule_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.schedule_id}
                                    </p>
                                )}
                            </div>

                            {/* Step 4: Details */}
                            <div
                                className={`bg-[#D5CABB] p-6 rounded-lg shadow-lg transition-all duration-300 ${
                                    currentStep >= 4
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                            currentStep >= 4
                                                ? "bg-[#1D1D22] text-[#F8D465]"
                                                : "bg-[#3C2A25] text-[#EEE4D3]"
                                        }`}
                                    >
                                        <FileText size={16} />
                                    </div>
                                    <h4 className="text-lg font-semibold text-[#1D1D22]">
                                        Informasi Keluhan
                                    </h4>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[#1D1D22] mb-2">
                                        Keluhan Utama *
                                    </label>
                                    <textarea
                                        name="chief_complaint"
                                        value={formData.chief_complaint}
                                        onChange={handleChange}
                                        rows="4"
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            formErrors.chief_complaint
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-[#C3A764] focus:ring-[#F8D465]"
                                        } focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="Deskripsikan keluhan gigi Anda secara detail"
                                        required
                                        disabled={!formData.schedule_id}
                                    ></textarea>
                                    {formErrors.chief_complaint && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.chief_complaint}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1D1D22] mb-2">
                                        Catatan Tambahan (opsional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            formErrors.notes
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-[#C3A764] focus:ring-[#F8D465]"
                                        } focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="Informasi tambahan yang ingin Anda sampaikan"
                                        disabled={!formData.schedule_id}
                                    ></textarea>
                                    {formErrors.notes && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#C3A764] text-[#1D1D22] py-3 px-8 rounded-lg hover:bg-[#F8D465] transition-all font-semibold flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                                disabled={
                                    loading.submitting ||
                                    currentStep < 4 ||
                                    !formData.chief_complaint
                                }
                            >
                                {loading.submitting ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <CalendarPlus
                                            size={18}
                                            className="mr-2"
                                        />
                                        <span>Buat Janji Temu</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
