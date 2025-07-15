import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    Calendar,
    Users,
    UserCheck,
    CalendarCheck,
    Clock,
    Activity,
    UserPlus,
    CheckCircle,
    BarChart3,
    PlusCircle,
    Sparkles,
    ArrowRight,
    Search,
    ChevronRight,
} from "lucide-react";

export default function EmployeeDashboard({
    totalPatients = 0,
    totalDoctors = 0,
    totalAppointments = 0,
    todayAppointments = 0,
    pendingAppointments = 0,
    completedAppointments = 0,
    todayAppointmentsList = [],
    upcomingAppointments = [],
    recentPatients = [],
    doctorSchedulesToday = [],
}) {
    const { auth } = usePage().props;

    // Format date to Indonesian locale
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Format time from 24 hour format
    const formatTime = (timeString) => {
        return timeString.substring(0, 5);
    };

    // Get current date in Indonesian format
    const currentDate = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <AuthorizeLayout>
            <Head title="Dashboard Karyawan" />

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-500 rounded-xl shadow-lg p-6 mb-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Selamat Datang, {auth.user.name}
                        </h1>
                        <p className="opacity-90 mt-1">{currentDate}</p>
                    </div>
                    <div className="bg-white text-indigo-600 px-4 py-2 rounded-lg shadow-md">
                        <span className="flex items-center gap-2">
                            <Sparkles size={16} />
                            Dashboard Karyawan
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                    title="Total Pasien"
                    value={totalPatients}
                    icon={Users}
                    color="from-sky-400 to-blue-500"
                    increase="+5.2%"
                    linkTo="/karyawan/patients"
                />
                <StatsCard
                    title="Total Dokter"
                    value={totalDoctors}
                    icon={UserCheck}
                    color="from-emerald-400 to-teal-500"
                    linkTo="/doctors"
                />
                <StatsCard
                    title="Janji Hari Ini"
                    value={todayAppointments}
                    icon={Calendar}
                    color="from-amber-400 to-orange-500"
                    increase="+2.3%"
                    linkTo="/employees/appointments/today"
                />
                <StatsCard
                    title="Total Janji"
                    value={totalAppointments}
                    icon={BarChart3}
                    color="from-pink-400 to-rose-500"
                    linkTo="/employees/appointments"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 transition-all">
                <h3 className="text-gray-700 font-semibold mb-4 flex items-center">
                    <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600 mr-2">
                        <Sparkles size={16} />
                    </span>
                    Aksi Cepat
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ActionButton
                        title="Buat Janji"
                        description="Tambah jadwal baru"
                        icon={Calendar}
                        color="bg-gradient-to-r from-sky-500 to-blue-600"
                        linkTo="/employees/appointments/create"
                    />
                    <ActionButton
                        title="Tambah Pasien"
                        description="Registrasi pasien baru"
                        icon={UserPlus}
                        color="bg-gradient-to-r from-emerald-500 to-teal-600"
                        linkTo="/patients/create"
                    />
                    <ActionButton
                        title="Janji Hari Ini"
                        description="Lihat jadwal hari ini"
                        icon={CalendarCheck}
                        color="bg-gradient-to-r from-amber-500 to-orange-600"
                        linkTo="/employees/appointments/today"
                    />
                    <ActionButton
                        title="Kelola Dokter"
                        description="Lihat daftar dokter"
                        icon={UserCheck}
                        color="bg-gradient-to-r from-pink-500 to-rose-600"
                        linkTo="/doctors"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Today's Appointments */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="bg-amber-100 p-2 rounded-lg text-amber-600 mr-3">
                                <Calendar size={18} />
                            </span>
                            <h3 className="font-semibold text-gray-800">
                                Janji Temu Hari Ini
                            </h3>
                        </div>
                        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                            {todayAppointmentsList
                                ? todayAppointmentsList.length
                                : 0}{" "}
                            Janji
                        </span>
                    </div>
                    <div className="p-5">
                        {todayAppointmentsList &&
                        todayAppointmentsList.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pasien
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Waktu
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Dokter
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {todayAppointmentsList
                                            .slice(0, 5)
                                            .map((appointment) => (
                                                <tr
                                                    key={appointment.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3.5">
                                                        <div className="font-medium text-gray-900">
                                                            {
                                                                appointment
                                                                    .patient
                                                                    .name
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <Clock
                                                                size={14}
                                                                className="mr-1.5 text-gray-400"
                                                            />
                                                            {formatTime(
                                                                appointment.appointment_time
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-sm text-gray-500">
                                                        Dr.{" "}
                                                        {
                                                            appointment.doctor
                                                                .name
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                appointment.status ===
                                                                "completed"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : appointment.status ===
                                                                      "canceled"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : appointment.status ===
                                                                      "confirmed"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {appointment.status ===
                                                            "completed"
                                                                ? "Selesai"
                                                                : appointment.status ===
                                                                  "canceled"
                                                                ? "Dibatalkan"
                                                                : appointment.status ===
                                                                  "confirmed"
                                                                ? "Dikonfirmasi"
                                                                : "Menunggu"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <Link
                                                            href={route(
                                                                "employee.appointments.show",
                                                                appointment.id
                                                            )}
                                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium inline-flex items-center"
                                                        >
                                                            Detail
                                                            <ChevronRight
                                                                size={16}
                                                                className="ml-1"
                                                            />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <Calendar
                                    size={36}
                                    className="mx-auto text-gray-300 mb-3"
                                />
                                <p className="text-gray-500 font-medium">
                                    Tidak ada janji temu hari ini
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Semua janji temu akan muncul di sini
                                </p>
                                <Link
                                    href="/employees/appointments/create"
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <PlusCircle size={16} className="mr-2" />
                                    Buat Janji Baru
                                </Link>
                            </div>
                        )}

                        {todayAppointmentsList &&
                            todayAppointmentsList.length > 5 && (
                                <div className="mt-5 text-center">
                                    <Link
                                        href="/employees/appointments/today"
                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                    >
                                        Lihat Semua
                                        <ArrowRight
                                            size={16}
                                            className="ml-2"
                                        />
                                    </Link>
                                </div>
                            )}
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                                <CalendarCheck size={18} />
                            </span>
                            <h3 className="font-semibold text-gray-800">
                                Janji Mendatang
                            </h3>
                        </div>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            {upcomingAppointments
                                ? upcomingAppointments.length
                                : 0}{" "}
                            Janji
                        </span>
                    </div>
                    <div className="p-5">
                        {upcomingAppointments &&
                        upcomingAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingAppointments
                                    .slice(0, 5)
                                    .map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="p-3 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            appointment.patient
                                                                .name
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                                        <UserCheck
                                                            size={14}
                                                            className="mr-1 text-gray-400"
                                                        />
                                                        Dr.{" "}
                                                        {
                                                            appointment.doctor
                                                                .name
                                                        }
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-700 bg-blue-50 px-3 py-1 rounded-lg text-xs">
                                                        {
                                                            formatDate(
                                                                appointment.appointment_date
                                                            ).split(",")[0]
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                                                        <Clock
                                                            size={12}
                                                            className="mr-1 text-gray-400"
                                                        />
                                                        {formatTime(
                                                            appointment.appointment_time
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        appointment.status ===
                                                        "confirmed"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-amber-100 text-amber-800"
                                                    }`}
                                                >
                                                    {appointment.status ===
                                                    "confirmed"
                                                        ? "Dikonfirmasi"
                                                        : "Menunggu"}
                                                </span>
                                                <Link
                                                    href={route(
                                                        "employee.appointments.show",
                                                        appointment.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900 text-xs font-medium inline-flex items-center"
                                                >
                                                    Detail
                                                    <ChevronRight
                                                        size={12}
                                                        className="ml-1"
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <CalendarCheck
                                    size={36}
                                    className="mx-auto text-gray-300 mb-3"
                                />
                                <p className="text-gray-500 font-medium">
                                    Tidak ada janji mendatang
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Jadwal mendatang akan muncul di sini
                                </p>
                            </div>
                        )}

                        {upcomingAppointments &&
                            upcomingAppointments.length > 5 && (
                                <div className="mt-5 text-center">
                                    <Link
                                        href="/employees/appointments?future=true"
                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                        Lihat Semua
                                        <ArrowRight
                                            size={16}
                                            className="ml-2"
                                        />
                                    </Link>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Bottom row with two cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Patients */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3">
                                <Users size={18} />
                            </span>
                            <h3 className="font-semibold text-gray-800">
                                Pasien Terbaru
                            </h3>
                        </div>
                        <Link
                            href="/patients/create"
                            className="inline-flex items-center bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                        >
                            <PlusCircle size={14} className="mr-1.5" />
                            Tambah Pasien
                        </Link>
                    </div>
                    <div className="p-5">
                        {recentPatients && recentPatients.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {recentPatients.slice(0, 6).map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3 text-emerald-600">
                                            {patient.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {patient.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                RM:{" "}
                                                {patient.no_rm || "Belum ada"}
                                            </p>
                                        </div>
                                        <Link
                                            href={route(
                                                "patients.show",
                                                patient.id
                                            )}
                                            className="text-emerald-600 hover:text-emerald-800"
                                        >
                                            <ChevronRight size={18} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <Users
                                    size={36}
                                    className="mx-auto text-gray-300 mb-3"
                                />
                                <p className="text-gray-500 font-medium">
                                    Belum ada pasien terdaftar
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Pasien baru akan muncul di sini
                                </p>
                                <Link
                                    href="/patients/create"
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    <PlusCircle size={16} className="mr-2" />
                                    Tambah Pasien Baru
                                </Link>
                            </div>
                        )}

                        {recentPatients && recentPatients.length > 6 && (
                            <div className="mt-5 text-center">
                                <Link
                                    href="/karyawan/patients"
                                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                    Lihat Semua Pasien
                                    <ArrowRight size={16} className="ml-2" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Doctor Schedules */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="bg-rose-100 p-2 rounded-lg text-rose-600 mr-3">
                                <UserCheck size={18} />
                            </span>
                            <h3 className="font-semibold text-gray-800">
                                Jadwal Dokter Hari Ini
                            </h3>
                        </div>
                        <Link
                            href="/doctors"
                            className="inline-flex items-center bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-100 transition-colors"
                        >
                            Kelola Dokter
                        </Link>
                    </div>
                    <div className="p-5">
                        {doctorSchedulesToday &&
                        doctorSchedulesToday.length > 0 ? (
                            <div className="space-y-3">
                                {doctorSchedulesToday.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="p-3 rounded-lg border border-gray-100 hover:border-rose-100 hover:bg-rose-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mr-3 text-rose-600">
                                                    {schedule.doctor.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Dr.{" "}
                                                        {schedule.doctor.name}
                                                    </p>
                                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                                        <Clock
                                                            size={14}
                                                            className="text-gray-400 mr-1.5"
                                                        />
                                                        {
                                                            schedule.formatted_time
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    schedule.available
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {schedule.available
                                                    ? "Tersedia"
                                                    : "Tidak Tersedia"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <UserCheck
                                    size={36}
                                    className="mx-auto text-gray-300 mb-3"
                                />
                                <p className="text-gray-500 font-medium">
                                    Tidak ada jadwal dokter hari ini
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Jadwal praktek akan muncul di sini
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Box - Floating Action */}
            <div className="fixed bottom-20 right-6 z-10">
                <Link
                    href="/karyawan/search"
                    className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                >
                    <Search size={20} />
                </Link>
            </div>
        </AuthorizeLayout>
    );
}

// Statistic Card Component
function StatsCard({ title, value, icon: Icon, color, increase, linkTo }) {
    return (
        <Link href={linkTo} className="block">
            <div
                className={`bg-gradient-to-r ${color} text-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">
                                {title}
                            </p>
                            <p className="text-3xl font-bold mt-1">{value}</p>
                            {increase && (
                                <p className="text-xs font-medium mt-2 bg-white bg-opacity-25 inline-block px-2 py-0.5 rounded">
                                    {increase} dari bulan lalu
                                </p>
                            )}
                        </div>
                        <div className="p-3 rounded-full bg-white bg-opacity-25">
                            <Icon size={24} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Action Button Component
function ActionButton({ title, description, icon: Icon, color, linkTo }) {
    return (
        <Link href={linkTo} className="block">
            <div
                className={`${color} text-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all`}
            >
                <div className="p-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-white bg-opacity-25 rounded-full mb-3">
                            <Icon size={20} />
                        </div>
                        <h4 className="font-medium">{title}</h4>
                        <p className="text-xs opacity-90 mt-1">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
