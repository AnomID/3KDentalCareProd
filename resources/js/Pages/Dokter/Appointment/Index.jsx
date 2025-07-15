import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    Calendar,
    Clock,
    User,
    Filter,
    Search,
    CheckCircle,
    AlertCircle,
    CalendarCheck,
    CalendarDays,
    BarChart3,
    Users,
} from "lucide-react";
import Pagination from "@/Components/Pagination";

export default function DoctorAppointments({ appointments, filters, stats }) {
    const { auth } = usePage().props;
    const flash = usePage().props.flash || {};
    const [searchParams, setSearchParams] = useState({
        date: filters?.date || "",
        status: filters?.status || "all",
    });

    const statusColors = {
        scheduled: "bg-blue-100 text-blue-800",
        confirmed: "bg-green-100 text-green-800",
        completed: "bg-purple-100 text-purple-800",
        canceled: "bg-red-100 text-red-800",
        no_show: "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
        scheduled: "Terjadwal",
        confirmed: "Dikonfirmasi",
        completed: "Selesai",
        canceled: "Dibatalkan",
        no_show: "Tidak Hadir",
        all: "Semua Status",
    };

    const handleSearch = () => {
        router.get(route("doctor.appointments.index"), searchParams, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearchParams({
            date: "",
            status: "all",
        });
        router.get(
            route("doctor.appointments.index"),
            { date: "", status: "all" },
            { preserveState: true }
        );
    };

    return (
        <AuthorizeLayout>
            <Head title="Janji Temu Saya" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Stats Card - Today's Appointments */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <CalendarCheck
                                size={24}
                                className="text-blue-600"
                            />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm font-medium">
                                Janji Temu Hari Ini
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {stats?.today || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href={route("doctor.appointments.today")}
                            className="text-blue-600 text-sm font-medium hover:underline flex items-center"
                        >
                            Lihat daftar pasien hari ini
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Stats Card - Waiting Patients */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <Users size={24} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm font-medium">
                                Pasien Menunggu
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {stats?.waiting || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            href={route("doctor.appointments.today", {
                                status: "confirmed",
                            })}
                            className="text-green-600 text-sm font-medium hover:underline flex items-center"
                        >
                            Lihat pasien yang sedang menunggu
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Stats Card - Completed Appointments */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <BarChart3 size={24} className="text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm font-medium">
                                Pasien Bulan Ini
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {stats?.thisMonth || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4">
                        {/* Mengganti route yang tidak ada dengan # */}
                        <a
                            href="#"
                            className="text-purple-600 text-sm font-medium hover:underline flex items-center"
                        >
                            Lihat statistik praktik
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Daftar Janji Temu
                    </h2>
                    <Link
                        href={route("doctor.appointments.today")}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center"
                    >
                        <CalendarCheck size={18} className="mr-2" />
                        Praktik Hari Ini
                    </Link>
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

                {/* Search and Filter Section */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <Filter size={20} className="mr-2" />
                        Filter Janji Temu
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                value={searchParams.date}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        date: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={searchParams.status}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        status: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="scheduled">Terjadwal</option>
                                <option value="confirmed">Dikonfirmasi</option>
                                <option value="completed">Selesai</option>
                                <option value="canceled">Dibatalkan</option>
                                <option value="no_show">Tidak Hadir</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex-1 flex justify-center items-center"
                            >
                                <Search size={18} className="mr-2" />
                                Cari
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Riwayat Janji Temu
                        </h3>
                        {appointments?.total && (
                            <p className="text-gray-600 mt-1">
                                Total: {appointments.total} Janji Temu
                            </p>
                        )}
                    </div>

                    {appointments?.data?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Pasien
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            No. RM
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Tanggal & Waktu
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Keluhan
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {appointments.data.map((appointment) => (
                                        <tr
                                            key={appointment.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-200 flex items-center justify-center">
                                                        <User
                                                            size={18}
                                                            className="text-blue-700"
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">
                                                            {
                                                                appointment
                                                                    .patient
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {appointment.patient
                                                                .gender ===
                                                            "male"
                                                                ? "Laki-laki"
                                                                : "Perempuan"}
                                                            ,{" "}
                                                            {
                                                                appointment
                                                                    .patient.age
                                                            }{" "}
                                                            tahun
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-900">
                                                {appointment.patient.no_rm}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <Calendar
                                                        size={16}
                                                        className="text-blue-600 mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {new Date(
                                                                appointment.appointment_date
                                                            ).toLocaleDateString(
                                                                "id-ID",
                                                                {
                                                                    weekday:
                                                                        "long",
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Clock
                                                                size={14}
                                                                className="mr-1"
                                                            />
                                                            {appointment.appointment_time.substring(
                                                                0,
                                                                5
                                                            )}{" "}
                                                            WIB
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {
                                                        appointment.chief_complaint
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        statusColors[
                                                            appointment.status
                                                        ]
                                                    }`}
                                                >
                                                    {
                                                        statusLabels[
                                                            appointment.status
                                                        ]
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link
                                                    href={route(
                                                        "doctor.appointments.show",
                                                        appointment.id
                                                    )}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all inline-block"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <CalendarDays size={28} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                Tidak Ada Janji Temu
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Tidak ada janji temu yang ditemukan dengan
                                filter yang dipilih.
                            </p>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {appointments?.data?.length > 0 && appointments?.links && (
                        <div className="p-4 border-t border-gray-200">
                            <Pagination links={appointments.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthorizeLayout>
    );
}
