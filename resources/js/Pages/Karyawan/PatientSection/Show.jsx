import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    ChevronLeft,
    User,
    Phone,
    Calendar,
    Clock,
    MapPin,
    Briefcase,
    Heart,
    Activity,
    FileText,
    Eye,
    AlertCircle,
    CheckCircle,
    XCircle,
    CalendarDays,
    Users,
    BarChart3,
    Info,
    ExternalLink,
    Stethoscope,
    UserCheck,
    Edit,
    Building,
    Mail,
    Hash,
    Baby,
    Shield,
} from "lucide-react";

const Show = ({
    patient,
    appointmentHistory,
    appointmentStats,
    appointmentsByDoctor,
    bloodTypes,
    medicalHistory,
}) => {
    const [activeTab, setActiveTab] = useState("patient-info");
    const [selectedDoctor, setSelectedDoctor] = useState("all");

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        return timeString.substring(0, 5);
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            scheduled: "bg-blue-100 text-blue-800 border-blue-200",
            confirmed: "bg-green-100 text-green-800 border-green-200",
            in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
            completed: "bg-purple-100 text-purple-800 border-purple-200",
            canceled: "bg-red-100 text-red-800 border-red-200",
            no_show: "bg-gray-100 text-gray-800 border-gray-200",
        };

        const statusLabels = {
            scheduled: "Terjadwal",
            confirmed: "Dikonfirmasi",
            in_progress: "Sedang Berlangsung",
            completed: "Selesai",
            canceled: "Dibatalkan",
            no_show: "Tidak Hadir",
        };

        const statusIcons = {
            scheduled: Calendar,
            confirmed: CheckCircle,
            in_progress: Clock,
            completed: CheckCircle,
            canceled: XCircle,
            no_show: AlertCircle,
        };

        const StatusIcon = statusIcons[status] || Calendar;

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    statusStyles[status] ||
                    "bg-gray-100 text-gray-600 border-gray-200"
                }`}
            >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusLabels[status] || status}
            </span>
        );
    };

    const navigateToAppointment = (appointmentId) => {
        router.visit(
            route("patients.show-appointment", [patient.id, appointmentId])
        );
    };

    const TabButton = ({ tabId, children, count = null }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors flex items-center ${
                activeTab === tabId
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
        >
            {children}
            {count !== null && (
                <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        activeTab === tabId
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {count}
                </span>
            )}
        </button>
    );

    // Filter appointments based on selected doctor
    const filteredAppointments =
        selectedDoctor === "all"
            ? appointmentHistory
            : appointmentHistory.filter(
                  (app) => app.doctor_id == selectedDoctor
              );

    return (
        <AuthorizeLayout>
            <Head title={`${patient.name} - Detail Pasien`} />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link
                        href={route("patients.index")}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Detail Pasien
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Informasi lengkap dan riwayat medis pasien
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Link
                        href={route("patients.edit", patient.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                        <Edit size={16} className="mr-2" />
                        Edit Patient
                    </Link>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                            {appointmentStats.total}
                        </div>
                        <div className="text-sm text-gray-500">
                            Total Appointment
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Header Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                            <User size={32} className="text-blue-600" />
                        </div>
                        <div className="ml-6 flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {patient.name}
                            </h1>
                            <div className="flex items-center mt-2 space-x-4 text-gray-600">
                                <span className="flex items-center">
                                    <User size={16} className="mr-1" />
                                    {patient.gender} •{" "}
                                    {patient.age || "Unknown"} tahun
                                </span>
                                <span className="flex items-center">
                                    <FileText size={16} className="mr-1" />
                                    No. RM: {patient.no_rm || "Belum ada"}
                                </span>
                                {patient.blood_type && (
                                    <span className="flex items-center">
                                        <Heart size={16} className="mr-1" />
                                        {patient.blood_type}
                                    </span>
                                )}
                                {patient.user?.email && (
                                    <span className="flex items-center">
                                        <Mail size={16} className="mr-1" />
                                        {patient.user.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Registration Badge */}
                    <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            <Calendar size={14} className="mr-1" />
                            Terdaftar: {formatDate(patient.created_at)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <CheckCircle
                                size={24}
                                className="text-purple-600"
                            />
                        </div>
                        <div className="ml-4">
                            <div className="text-2xl font-bold text-gray-800">
                                {appointmentStats.completed}
                            </div>
                            <div className="text-sm text-gray-500">Selesai</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Clock size={24} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-2xl font-bold text-gray-800">
                                {appointmentStats.active}
                            </div>
                            <div className="text-sm text-gray-500">Aktif</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-full">
                            <XCircle size={24} className="text-red-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-2xl font-bold text-gray-800">
                                {appointmentStats.cancelled}
                            </div>
                            <div className="text-sm text-gray-500">
                                Dibatalkan
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <Stethoscope size={24} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-2xl font-bold text-gray-800">
                                {appointmentStats.total_doctors || 0}
                            </div>
                            <div className="text-sm text-gray-500">Dokter</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <Calendar size={24} className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {formatDate(appointmentStats.first_appointment)}
                            </div>
                            <div className="text-sm text-gray-500">
                                Pertama Kali
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <TabButton tabId="patient-info">
                            <User size={16} className="mr-2" />
                            Informasi Pasien
                        </TabButton>
                        <TabButton
                            tabId="appointment-history"
                            count={appointmentHistory.length}
                        >
                            <CalendarDays size={16} className="mr-2" />
                            Riwayat Appointment
                        </TabButton>
                        <TabButton tabId="medical-overview">
                            <Activity size={16} className="mr-2" />
                            Overview Medis
                        </TabButton>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Tab Content: Patient Information */}
                    {activeTab === "patient-info" && (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Info */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <User
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Informasi Dasar
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nama Lengkap
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {patient.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Tempat, Tanggal Lahir
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.birth_place},{" "}
                                                {formatDate(patient.birth_date)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Jenis Kelamin
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.gender}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Kewarganegaraan
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.citizenship}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Phone
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Kontak & Identitas
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                No. Telepon
                                            </label>
                                            <p className="text-sm text-gray-900 flex items-center">
                                                <Phone
                                                    size={14}
                                                    className="mr-2 text-blue-600"
                                                />
                                                {patient.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Email
                                            </label>
                                            <p className="text-sm text-gray-900 flex items-center">
                                                <Mail
                                                    size={14}
                                                    className="mr-2 text-blue-600"
                                                />
                                                {patient.user?.email || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Pekerjaan
                                            </label>
                                            <p className="text-sm text-gray-900 flex items-center">
                                                <Briefcase
                                                    size={14}
                                                    className="mr-2 text-blue-600"
                                                />
                                                {patient.occupation || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Golongan Darah
                                            </label>
                                            <p className="text-sm text-gray-900 flex items-center">
                                                <Heart
                                                    size={14}
                                                    className="mr-2 text-red-600"
                                                />
                                                {patient.blood_type || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Identitas
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.identity_type
                                                    ? `${patient.identity_type}: ${patient.no_identity}`
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <MapPin
                                        size={20}
                                        className="mr-2 text-blue-600"
                                    />
                                    Alamat
                                </h3>
                                <p className="text-sm text-gray-900">
                                    {patient.address}
                                </p>
                            </div>

                            {/* Guardian Information */}
                            {patient.guardian && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Shield
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Informasi Wali
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nama Wali
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.guardian.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Hubungan
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.guardian.relationship}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                No. Telepon Wali
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.guardian.phone_number}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Identitas Wali
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {patient.guardian.identity_type}
                                                :{" "}
                                                {
                                                    patient.guardian
                                                        .identity_number
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Medical History */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Activity
                                        size={20}
                                        className="mr-2 text-blue-600"
                                    />
                                    Riwayat Kesehatan
                                </h3>
                                {medicalHistory ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Alergi
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {medicalHistory.allergies ||
                                                    "Tidak ada"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Penyakit Kronis
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {medicalHistory.chronic_diseases ||
                                                    "Tidak ada"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Obat-obatan Rutin
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {medicalHistory.current_medications ||
                                                    "Tidak ada"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Riwayat Operasi
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {medicalHistory.previous_surgeries ||
                                                    "Tidak ada"}
                                            </p>
                                        </div>
                                        {medicalHistory.notes && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Catatan Tambahan
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {medicalHistory.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <AlertCircle
                                            size={20}
                                            className="text-yellow-600 mr-3"
                                        />
                                        <p className="text-sm text-yellow-800">
                                            Riwayat kesehatan belum diisi untuk
                                            pasien ini.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Appointment History */}
                    {activeTab === "appointment-history" && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <CalendarDays
                                        size={20}
                                        className="mr-2 text-blue-600"
                                    />
                                    Riwayat Appointment
                                </h3>

                                {/* Doctor Filter */}
                                {appointmentsByDoctor &&
                                    Object.keys(appointmentsByDoctor).length >
                                        1 && (
                                        <div className="flex items-center space-x-3">
                                            <label className="text-sm font-medium text-gray-700">
                                                Filter Dokter:
                                            </label>
                                            <select
                                                value={selectedDoctor}
                                                onChange={(e) =>
                                                    setSelectedDoctor(
                                                        e.target.value
                                                    )
                                                }
                                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">
                                                    Semua Dokter
                                                </option>
                                                {Object.values(
                                                    appointmentsByDoctor
                                                ).map((doctorData) => (
                                                    <option
                                                        key={
                                                            doctorData.doctor.id
                                                        }
                                                        value={
                                                            doctorData.doctor.id
                                                        }
                                                    >
                                                        {doctorData.doctor.name}{" "}
                                                        (
                                                        {doctorData.stats.total}{" "}
                                                        appointments)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                            </div>

                            {filteredAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-3">
                                                        <div className="flex items-center text-lg font-medium text-gray-900">
                                                            <Calendar
                                                                size={18}
                                                                className="mr-2 text-blue-600"
                                                            />
                                                            {
                                                                appointment.formatted_date
                                                            }
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Clock
                                                                size={16}
                                                                className="mr-1"
                                                            />
                                                            {formatTime(
                                                                appointment.appointment_time
                                                            )}
                                                        </div>
                                                        {getStatusBadge(
                                                            appointment.status
                                                        )}
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        {/* Doctor Info */}
                                                        <div className="flex items-start">
                                                            <Stethoscope
                                                                size={16}
                                                                className="text-gray-400 mr-2 mt-0.5"
                                                            />
                                                            <div>
                                                                <span className="font-medium text-gray-700">
                                                                    Dokter:
                                                                </span>
                                                                <span className="ml-2 text-gray-900">
                                                                    {appointment
                                                                        .doctor
                                                                        ?.name ||
                                                                        "Unknown Doctor"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start">
                                                            <FileText
                                                                size={16}
                                                                className="text-gray-400 mr-2 mt-0.5"
                                                            />
                                                            <div>
                                                                <span className="font-medium text-gray-700">
                                                                    Keluhan:
                                                                </span>
                                                                <span className="ml-2 text-gray-900">
                                                                    {
                                                                        appointment.chief_complaint
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {appointment.notes && (
                                                            <div className="flex items-start">
                                                                <Info
                                                                    size={16}
                                                                    className="text-gray-400 mr-2 mt-0.5"
                                                                />
                                                                <div>
                                                                    <span className="font-medium text-gray-700">
                                                                        Catatan:
                                                                    </span>
                                                                    <span className="ml-2 text-gray-900">
                                                                        {
                                                                            appointment.notes
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {appointment.queue && (
                                                            <div className="flex items-center text-gray-600">
                                                                <BarChart3
                                                                    size={16}
                                                                    className="mr-2"
                                                                />
                                                                <span>
                                                                    No. Antrian:{" "}
                                                                    {
                                                                        appointment
                                                                            .queue
                                                                            .queue_number
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        {appointment.odontogram && (
                                                            <div className="flex items-center text-gray-600">
                                                                <Activity
                                                                    size={16}
                                                                    className="mr-2"
                                                                />
                                                                <span>
                                                                    Odontogram:
                                                                    Tersedia
                                                                </span>
                                                                {appointment
                                                                    .odontogram
                                                                    .is_finalized && (
                                                                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                        Finalized
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="ml-6">
                                                    <button
                                                        onClick={() =>
                                                            navigateToAppointment(
                                                                appointment.id
                                                            )
                                                        }
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                                                    >
                                                        <Eye
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        Lihat Detail
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                        <CalendarDays size={28} />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                        Tidak Ada Riwayat
                                    </h3>
                                    <p className="text-gray-500">
                                        {selectedDoctor === "all"
                                            ? "Belum ada riwayat appointment untuk pasien ini."
                                            : "Belum ada riwayat appointment dengan dokter yang dipilih."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Medical Overview */}
                    {activeTab === "medical-overview" && (
                        <div className="space-y-6">
                            {/* Summary Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="bg-blue-200 p-3 rounded-full">
                                            <CalendarDays
                                                size={24}
                                                className="text-blue-700"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-2xl font-bold text-blue-900">
                                                {appointmentStats.total}
                                            </div>
                                            <div className="text-sm text-blue-700">
                                                Total Kunjungan
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="bg-green-200 p-3 rounded-full">
                                            <Stethoscope
                                                size={24}
                                                className="text-green-700"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-2xl font-bold text-green-900">
                                                {appointmentStats.total_doctors ||
                                                    0}
                                            </div>
                                            <div className="text-sm text-green-700">
                                                Dokter Berbeda
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                                    <div className="flex items-center">
                                        <div className="bg-purple-200 p-3 rounded-full">
                                            <Activity
                                                size={24}
                                                className="text-purple-700"
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-2xl font-bold text-purple-900">
                                                {(
                                                    (appointmentStats.completed /
                                                        appointmentStats.total) *
                                                    100
                                                ).toFixed(0) || 0}
                                                %
                                            </div>
                                            <div className="text-sm text-purple-700">
                                                Tingkat Penyelesaian
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Doctors Summary */}
                            {appointmentsByDoctor &&
                                Object.keys(appointmentsByDoctor).length >
                                    0 && (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Users
                                                size={20}
                                                className="mr-2 text-blue-600"
                                            />
                                            Ringkasan per Dokter
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.values(
                                                appointmentsByDoctor
                                            ).map((doctorData) => (
                                                <div
                                                    key={doctorData.doctor.id}
                                                    className="bg-white rounded-lg p-4 border border-gray-200"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-medium text-gray-900">
                                                            {
                                                                doctorData
                                                                    .doctor.name
                                                            }
                                                        </h4>
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {
                                                                doctorData.stats
                                                                    .total
                                                            }{" "}
                                                            appointments
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div className="text-center">
                                                            <div className="font-medium text-green-600">
                                                                {
                                                                    doctorData
                                                                        .stats
                                                                        .completed
                                                                }
                                                            </div>
                                                            <div className="text-gray-500">
                                                                Selesai
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-medium text-blue-600">
                                                                {
                                                                    doctorData
                                                                        .stats
                                                                        .active
                                                                }
                                                            </div>
                                                            <div className="text-gray-500">
                                                                Aktif
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs text-gray-500">
                                                                Terakhir:{" "}
                                                                {formatDate(
                                                                    doctorData
                                                                        .stats
                                                                        .last_appointment
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Medical History Summary */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Heart
                                        size={20}
                                        className="mr-2 text-red-600"
                                    />
                                    Ringkasan Kesehatan
                                </h3>
                                {medicalHistory ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">
                                                Informasi Penting
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <Heart
                                                        size={16}
                                                        className="text-red-500 mr-2"
                                                    />
                                                    <span className="text-sm">
                                                        <strong>
                                                            Golongan Darah:
                                                        </strong>{" "}
                                                        {patient.blood_type ||
                                                            medicalHistory.blood_type ||
                                                            "Tidak diketahui"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <AlertCircle
                                                        size={16}
                                                        className="text-yellow-500 mr-2"
                                                    />
                                                    <span className="text-sm">
                                                        <strong>Alergi:</strong>{" "}
                                                        {medicalHistory.allergies ||
                                                            "Tidak ada"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">
                                                Kondisi Kronis
                                            </h4>
                                            <div className="text-sm text-gray-600">
                                                {medicalHistory.chronic_diseases ||
                                                    "Tidak ada penyakit kronis tercatat"}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <AlertCircle
                                            size={20}
                                            className="text-yellow-600 mr-3"
                                        />
                                        <p className="text-sm text-yellow-800">
                                            Riwayat kesehatan belum lengkap.
                                            Mohon lengkapi data untuk pelayanan
                                            yang lebih baik.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthorizeLayout>
    );
};

export default Show;
