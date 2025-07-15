import React, { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    Calendar,
    Clock,
    User,
    CheckCircle,
    AlertCircle,
    FileText,
    ChevronLeft,
    CalendarPlus,
    UserPlus,
    Users,
    Stethoscope,
    ListChecks,
    FileEdit,
    ChevronRight,
} from "lucide-react";

export default function CreateAppointment({ patients }) {
    const { auth } = usePage().props;
    const flash = usePage().props.flash || {};
    const errors = usePage().props.errors || {};

    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        schedule_id: "",
        appointment_date: "",
        chief_complaint: "",
        notes: "",
        followup_id: null,
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
                `/api/appointments/available-doctors?date=${formData.appointment_date}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`
                );
            }

            const data = await response.json();

            if (data.doctors) {
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
                `/api/appointments/available-schedules?date=${formData.appointment_date}&doctor_id=${formData.doctor_id}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`
                );
            }

            const data = await response.json();

            if (data.schedules) {
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
            "patient_id",
            "doctor_id",
            "appointment_date",
            "schedule_id",
            "chief_complaint",
        ];
        const missingFields = requiredFields.filter(
            (field) => !formData[field]
        );

        if (missingFields.length > 0) {
            const fieldNames = {
                patient_id: "Pasien",
                doctor_id: "Dokter",
                appointment_date: "Tanggal Janji Temu",
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

        router.post(route("employee.appointments.store"), formData, {
            onStart: () => {
                console.log("Request started");
            },
            onProgress: (progress) => {
                console.log("Progress:", progress);
            },
            onSuccess: (page) => {
                setLoading((prev) => ({ ...prev, submitting: false }));
                console.log("Appointment created successfully", page);
                // Inertia will handle the redirect automatically if server returns redirect
            },
            onError: (errors) => {
                setLoading((prev) => ({ ...prev, submitting: false }));
                setFormErrors(errors);
                console.error("Appointment creation failed:", errors);

                // Set general error if there are validation errors
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
        if (!formData.patient_id) return 1;
        if (!formData.appointment_date) return 2;
        if (!formData.doctor_id) return 3;
        if (!formData.schedule_id) return 4;
        return 5;
    };

    const currentStep = getCurrentStep();

    return (
        <AuthorizeLayout>
            <Head title="Buat Janji Temu Baru" />

            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center mb-6">
                    <a
                        href={route("employee.appointments.index")}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </a>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Buat Janji Temu Baru
                    </h2>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { step: 1, label: "Pilih Pasien", icon: Users },
                            { step: 2, label: "Pilih Tanggal", icon: Calendar },
                            {
                                step: 3,
                                label: "Pilih Dokter",
                                icon: Stethoscope,
                            },
                            { step: 4, label: "Pilih Jadwal", icon: Clock },
                            {
                                step: 5,
                                label: "Detail Keluhan",
                                icon: FileText,
                            },
                        ].map(({ step, label, icon: Icon }, index) => (
                            <div key={step} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                        currentStep >= step
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : "bg-white border-gray-300 text-gray-400"
                                    }`}
                                >
                                    <Icon size={20} />
                                </div>
                                <div className="ml-3 hidden md:block">
                                    <p
                                        className={`text-sm font-medium ${
                                            currentStep >= step
                                                ? "text-blue-600"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {label}
                                    </p>
                                </div>
                                {index < 4 && (
                                    <ChevronRight
                                        className={`mx-4 ${
                                            currentStep > step
                                                ? "text-blue-600"
                                                : "text-gray-300"
                                        }`}
                                        size={20}
                                    />
                                )}
                            </div>
                        ))}
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
                <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <CalendarPlus size={20} className="mr-2" />
                        Form Janji Temu
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Step 1: Patient Selection */}
                            <div
                                className={`transition-all duration-300 ${
                                    currentStep >= 1
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Users size={16} className="mr-2" />
                                    Pasien
                                </label>
                                <select
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.patient_id
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } focus:outline-none focus:ring-2 transition-all`}
                                    required
                                >
                                    <option value="">Pilih Pasien</option>
                                    {patients.map((patient) => (
                                        <option
                                            key={patient.id}
                                            value={patient.id}
                                        >
                                            {patient.name} - {patient.no_rm}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.patient_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.patient_id}
                                    </p>
                                )}
                            </div>

                            {/* Step 2: Date Selection */}
                            <div
                                className={`transition-all duration-300 ${
                                    currentStep >= 2
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Calendar size={16} className="mr-2" />
                                    Tanggal Janji Temu
                                </label>
                                <input
                                    type="date"
                                    name="appointment_date"
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.appointment_date
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } focus:outline-none focus:ring-2 transition-all`}
                                    required
                                    disabled={!formData.patient_id}
                                />
                                {formErrors.appointment_date && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.appointment_date}
                                    </p>
                                )}
                            </div>

                            {/* Step 3: Doctor Selection */}
                            <div
                                className={`transition-all duration-300 ${
                                    currentStep >= 3
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Stethoscope size={16} className="mr-2" />
                                    Dokter yang Tersedia
                                </label>
                                <select
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.doctor_id
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } focus:outline-none focus:ring-2 transition-all`}
                                    required
                                    disabled={
                                        !formData.appointment_date ||
                                        loading.doctors
                                    }
                                >
                                    <option value="">
                                        {loading.doctors
                                            ? "Memuat dokter yang tersedia..."
                                            : !formData.appointment_date
                                            ? "Pilih tanggal terlebih dahulu"
                                            : availableDoctors.length === 0
                                            ? "Tidak ada dokter tersedia"
                                            : "Pilih dokter"}
                                    </option>
                                    {availableDoctors.map((doctor) => (
                                        <option
                                            key={doctor.id}
                                            value={doctor.id}
                                        >
                                            dr. {doctor.name} -{" "}
                                            {doctor.specialization}
                                            {doctor.available_schedules_count >
                                                0 &&
                                                ` (${doctor.available_schedules_count} jadwal tersedia)`}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.doctor_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.doctor_id}
                                    </p>
                                )}
                                {availableDoctors.length === 0 &&
                                    formData.appointment_date &&
                                    !loading.doctors && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            Tidak ada dokter yang tersedia pada
                                            tanggal ini.
                                        </p>
                                    )}
                            </div>

                            {/* Step 4: Schedule Selection */}
                            <div
                                className={`transition-all duration-300 ${
                                    currentStep >= 4
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Clock size={16} className="mr-2" />
                                    Jadwal Praktik
                                </label>
                                <select
                                    name="schedule_id"
                                    value={formData.schedule_id}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.schedule_id
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } focus:outline-none focus:ring-2 transition-all`}
                                    required
                                    disabled={
                                        !formData.doctor_id || loading.schedules
                                    }
                                >
                                    <option value="">
                                        {loading.schedules
                                            ? "Memuat jadwal..."
                                            : !formData.doctor_id
                                            ? "Pilih dokter terlebih dahulu"
                                            : availableSchedules.length === 0
                                            ? "Tidak ada jadwal tersedia"
                                            : "Pilih jadwal"}
                                    </option>
                                    {availableSchedules.map((schedule) => (
                                        <option
                                            key={schedule.id}
                                            value={schedule.id}
                                        >
                                            {schedule.formatted_time} - Kuota
                                            Tersisa: {schedule.remaining_quota}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.schedule_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.schedule_id}
                                    </p>
                                )}
                                {availableSchedules.length === 0 &&
                                    formData.doctor_id &&
                                    !loading.schedules && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            Tidak ada jadwal yang tersedia untuk
                                            dokter ini pada tanggal tersebut.
                                        </p>
                                    )}
                            </div>

                            {/* Step 5: Details */}
                            <div
                                className={`transition-all duration-300 ${
                                    currentStep >= 5
                                        ? "opacity-100"
                                        : "opacity-50 pointer-events-none"
                                }`}
                            >
                                {/* Chief Complaint */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FileText size={16} className="mr-2" />
                                        Keluhan Utama
                                    </label>
                                    <textarea
                                        name="chief_complaint"
                                        value={formData.chief_complaint}
                                        onChange={handleChange}
                                        rows="3"
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            formErrors.chief_complaint
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        } focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="Masukkan keluhan utama pasien"
                                        required
                                        disabled={!formData.schedule_id}
                                    ></textarea>
                                    {formErrors.chief_complaint && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.chief_complaint}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FileEdit size={16} className="mr-2" />
                                        Catatan Tambahan
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="2"
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            formErrors.notes
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        } focus:outline-none focus:ring-2 transition-all`}
                                        placeholder="Catatan tambahan (opsional)"
                                        disabled={!formData.schedule_id}
                                    ></textarea>
                                    {formErrors.notes && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {formErrors.notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                                    disabled={
                                        loading.submitting || currentStep < 5
                                    }
                                >
                                    {loading.submitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        </div>
                    </form>
                </div>
            </div>
        </AuthorizeLayout>
    );
}
