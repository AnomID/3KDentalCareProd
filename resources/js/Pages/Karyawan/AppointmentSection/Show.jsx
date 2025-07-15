// Employee Appointment Show View
// File: resources/js/Pages/Karyawan/AppointmentSection/Show.jsx

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
    Shield,
    TrendingUp,
    Baby,
    Microscope,
    ClipboardCheck,
} from "lucide-react";

const Show = ({
    appointment,
    appointmentHistory,
    appointmentStats,
    queueInfo,
    hasExaminationData,
    previousAppointment,
    nextAppointment,
    canViewExamination,
    canEditExamination,
}) => {
    const [activeTab, setActiveTab] = useState("appointment-details");

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
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    statusStyles[status] ||
                    "bg-gray-100 text-gray-600 border-gray-200"
                }`}
            >
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusLabels[status] || status}
            </span>
        );
    };

    const navigateToExamination = () => {
        router.visit(route("employee.examination.show", appointment.id));
    };

    const navigateToAppointment = (appointmentId) => {
        router.visit(route("employee.appointments.show", appointmentId));
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

    return (
        <AuthorizeLayout>
            <Head
                title={`Appointment ${appointment.id} - ${appointment.patient.name}`}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link
                        href={route("employee.appointments.index")}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Appointment Details
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Employee view - Read-only access
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {/* {hasExaminationData && canViewExamination && (
                        <button
                            onClick={navigateToExamination}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                        >
                            <Microscope size={18} className="mr-2" />
                            View Examination
                        </button>
                    )} */}
                    <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                            #{appointment.id}
                        </div>
                        <div className="text-sm text-gray-500">
                            Appointment ID
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Header Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Patient Info */}
                    <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                            <User size={32} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {appointment.patient.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {appointment.patient.gender} •{" "}
                                {appointment.patient.age} years
                            </p>
                            <p className="text-sm text-gray-500">
                                RM: {appointment.patient.no_rm || "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                            <Stethoscope size={32} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                dr. {appointment.doctor.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {appointment.doctor.specialization}
                            </p>
                            <p className="text-sm text-gray-500">
                                Doctor ID: {appointment.doctor.id}
                            </p>
                        </div>
                    </div>

                    {/* Appointment Info */}
                    <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                            <Calendar size={32} className="text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {appointment.formatted_date}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {appointment.formatted_time}
                            </p>
                            <div className="mt-1">
                                {getStatusBadge(appointment.status)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <CalendarDays className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                            <div className="text-lg font-bold text-gray-900">
                                {appointmentStats.total}
                            </div>
                            <div className="text-sm text-gray-500">
                                Total History
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                            <div className="text-lg font-bold text-gray-900">
                                {appointmentStats.completed}
                            </div>
                            <div className="text-sm text-gray-500">
                                Completed
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-600" />
                        <div className="ml-3">
                            <div className="text-lg font-bold text-gray-900">
                                {appointmentStats.active}
                            </div>
                            <div className="text-sm text-gray-500">Active</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <Activity className="h-8 w-8 text-purple-600" />
                        <div className="ml-3">
                            <div className="text-lg font-bold text-gray-900">
                                {hasExaminationData ? "Yes" : "No"}
                            </div>
                            <div className="text-sm text-gray-500">
                                Examination Data
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <TabButton tabId="appointment-details">
                            <FileText size={16} className="mr-2" />
                            Appointment Details
                        </TabButton>
                        <TabButton
                            tabId="appointment-history"
                            count={appointmentHistory.length}
                        >
                            <CalendarDays size={16} className="mr-2" />
                            History with this Doctor
                        </TabButton>
                        <TabButton tabId="patient-info">
                            <User size={16} className="mr-2" />
                            Patient Information
                        </TabButton>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Tab Content: Appointment Details */}
                    {activeTab === "appointment-details" && (
                        <div className="space-y-6">
                            {/* Main Appointment Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Calendar
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Appointment Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Date & Time
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {appointment.formatted_date} at{" "}
                                                {appointment.formatted_time}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Status
                                            </label>
                                            <div className="mt-1">
                                                {getStatusBadge(
                                                    appointment.status
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Chief Complaint
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.chief_complaint ||
                                                    "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Notes
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.notes || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Info
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Additional Information
                                    </h3>
                                    <div className="space-y-4">
                                        {appointment.schedule && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Schedule
                                                </label>
                                                <p className="text-sm text-gray-900">
                                                    {
                                                        appointment.schedule
                                                            .start_time
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        appointment.schedule
                                                            .end_time
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {queueInfo && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Queue Number
                                                    </label>
                                                    <p className="text-sm text-gray-900">
                                                        #{queueInfo.number}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Queue Status
                                                    </label>
                                                    <p className="text-sm text-gray-900 capitalize">
                                                        {queueInfo.status}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Created By
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.created_by?.name ||
                                                    "System"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Created At
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {formatDate(
                                                    appointment.created_at
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Examination Data Preview */}
                            {hasExaminationData && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="bg-green-100 p-3 rounded-full">
                                                <ClipboardCheck
                                                    size={24}
                                                    className="text-green-600"
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Examination Data Available
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    This appointment has
                                                    examination data including
                                                    odontogram
                                                </p>
                                            </div>
                                        </div>
                                        {/* {canViewExamination && (
                                            <button
                                                onClick={navigateToExamination}
                                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                                            >
                                                <Microscope
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                View Examination
                                            </button>
                                        )} */}
                                    </div>
                                </div>
                            )}

                            {/* Navigation between appointments */}
                            {(previousAppointment || nextAppointment) && (
                                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <CalendarDays
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Navigate Between Appointments
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        {previousAppointment ? (
                                            <button
                                                onClick={() =>
                                                    navigateToAppointment(
                                                        previousAppointment.id
                                                    )
                                                }
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                            >
                                                <ChevronLeft
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Previous Appointment
                                            </button>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                No previous appointment
                                            </div>
                                        )}

                                        {nextAppointment ? (
                                            <button
                                                onClick={() =>
                                                    navigateToAppointment(
                                                        nextAppointment.id
                                                    )
                                                }
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                            >
                                                Next Appointment
                                                <ChevronLeft
                                                    size={16}
                                                    className="ml-2 rotate-180"
                                                />
                                            </button>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                No next appointment
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Appointment History */}
                    {activeTab === "appointment-history" && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <CalendarDays
                                    size={20}
                                    className="mr-2 text-blue-600"
                                />
                                Appointment History with dr.{" "}
                                {appointment.doctor.name}
                            </h3>
                            {appointmentHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {appointmentHistory.map(
                                        (historyAppointment) => (
                                            <div
                                                key={historyAppointment.id}
                                                className={`border rounded-lg p-6 transition-colors ${
                                                    historyAppointment.id ===
                                                    appointment.id
                                                        ? "border-blue-300 bg-blue-50"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                }`}
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
                                                                    historyAppointment.formatted_date
                                                                }
                                                                {historyAppointment.id ===
                                                                    appointment.id && (
                                                                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center text-gray-600">
                                                                <Clock
                                                                    size={16}
                                                                    className="mr-1"
                                                                />
                                                                {formatTime(
                                                                    historyAppointment.appointment_time
                                                                )}
                                                            </div>
                                                            {getStatusBadge(
                                                                historyAppointment.status
                                                            )}
                                                        </div>

                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-start">
                                                                <FileText
                                                                    size={16}
                                                                    className="text-gray-400 mr-2 mt-0.5"
                                                                />
                                                                <div>
                                                                    <span className="font-medium text-gray-700">
                                                                        Chief
                                                                        Complaint:
                                                                    </span>
                                                                    <span className="ml-2 text-gray-900">
                                                                        {
                                                                            historyAppointment.chief_complaint
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {historyAppointment.notes && (
                                                                <div className="flex items-start">
                                                                    <Info
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-gray-400 mr-2 mt-0.5"
                                                                    />
                                                                    <div>
                                                                        <span className="font-medium text-gray-700">
                                                                            Notes:
                                                                        </span>
                                                                        <span className="ml-2 text-gray-900">
                                                                            {
                                                                                historyAppointment.notes
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {historyAppointment.odontogram && (
                                                                <div className="flex items-center text-gray-600">
                                                                    <Activity
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="mr-2"
                                                                    />
                                                                    <span>
                                                                        Odontogram:
                                                                        Available
                                                                    </span>
                                                                    {historyAppointment
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
                                                        {historyAppointment.id !==
                                                            appointment.id && (
                                                            <button
                                                                onClick={() =>
                                                                    navigateToAppointment(
                                                                        historyAppointment.id
                                                                    )
                                                                }
                                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                    className="mr-2"
                                                                />
                                                                View Details
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                        <CalendarDays size={28} />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                        No History Available
                                    </h3>
                                    <p className="text-gray-500">
                                        No appointment history with this doctor.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Patient Information */}
                    {activeTab === "patient-info" && (
                        <div className="space-y-6">
                            {/* Basic Patient Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <User
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Full Name
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {appointment.patient.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Gender & Age
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient.gender} •{" "}
                                                {appointment.patient.age} years
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                RM Number
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient.no_rm ||
                                                    "Not assigned"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Blood Type
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient
                                                    .blood_type ||
                                                    "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Phone
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Phone Number
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient.phone ||
                                                    "Not provided"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Address
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient.address ||
                                                    "Not provided"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Email
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient.user
                                                    ?.email || "Not provided"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guardian Information */}
                            {appointment.patient.guardian && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Shield
                                            size={20}
                                            className="mr-2 text-blue-600"
                                        />
                                        Guardian Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Guardian Name
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {
                                                    appointment.patient.guardian
                                                        .name
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Relationship
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {
                                                    appointment.patient.guardian
                                                        .relationship
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Guardian Phone
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {
                                                    appointment.patient.guardian
                                                        .phone_number
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
                                    Medical History
                                </h3>
                                {appointment.patient.medical_history ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Allergies
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient
                                                    .medical_history
                                                    .allergies || "None"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Chronic Diseases
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient
                                                    .medical_history
                                                    .chronic_diseases || "None"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Current Medications
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient
                                                    .medical_history
                                                    .current_medications ||
                                                    "None"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Previous Surgeries
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {appointment.patient
                                                    .medical_history
                                                    .previous_surgeries ||
                                                    "None"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <AlertCircle
                                            size={20}
                                            className="text-yellow-600 mr-3"
                                        />
                                        <p className="text-sm text-yellow-800">
                                            Medical history has not been filled
                                            for this patient.
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
