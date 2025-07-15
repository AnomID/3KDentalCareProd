import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    Calendar,
    Clock,
    User,
    Filter,
    CheckCircle,
    AlertCircle,
    FileText,
    CalendarDays,
    Settings,
    Check,
    X,
    UserMinus,
    FileEdit,
    CalendarClock,
    Stethoscope,
    ArrowLeft,
} from "lucide-react";
import Pagination from "@/Components/Pagination";

export default function DoctorTodayAppointments({
    appointments,
    filters,
    today,
}) {
    const { auth } = usePage().props;
    const flash = usePage().props.flash || {};
    const [searchParams, setSearchParams] = useState({
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
        router.get(route("doctor.appointments.today"), searchParams, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearchParams({
            status: "all",
        });
        router.get(
            route("doctor.appointments.today"),
            { status: "all" },
            { preserveState: true }
        );
    };

    // Format today's date for display
    const formattedDate = new Date(today).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <AuthorizeLayout>
            <Head title="Praktik Hari Ini" />

            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Stethoscope size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Praktik Hari Ini
                            </h2>
                            <p className="text-gray-600">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route("doctor.appointments.index")}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all flex items-center"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            Kembali
                        </Link>
                        {/* Mengganti route yang tidak ada dengan # */}
                        <a
                            href="#"
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center"
                        >
                            <Settings size={18} className="mr-2" />
                            Kelola Jadwal
                        </a>
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

                {/* Status Filter Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                        <li className="mr-2">
                            <a
                                href="#"
                                onClick={() => {
                                    setSearchParams({
                                        ...searchParams,
                                        status: "all",
                                    });
                                    router.get(
                                        route("doctor.appointments.today"),
                                        { ...searchParams, status: "all" },
                                        { preserveState: true }
                                    );
                                }}
                                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                                    searchParams.status === "all"
                                        ? "text-blue-600 border-blue-600 active"
                                        : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <Calendar size={16} className="mr-2" />
                                Semua Janji Temu
                            </a>
                        </li>
                        <li className="mr-2">
                            <a
                                href="#"
                                onClick={() => {
                                    setSearchParams({
                                        ...searchParams,
                                        status: "confirmed",
                                    });
                                    router.get(
                                        route("doctor.appointments.today"),
                                        {
                                            ...searchParams,
                                            status: "confirmed",
                                        },
                                        { preserveState: true }
                                    );
                                }}
                                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                                    searchParams.status === "confirmed"
                                        ? "text-blue-600 border-blue-600 active"
                                        : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <Check size={16} className="mr-2" />
                                Menunggu
                            </a>
                        </li>
                        <li className="mr-2">
                            <a
                                href="#"
                                onClick={() => {
                                    setSearchParams({
                                        ...searchParams,
                                        status: "scheduled",
                                    });
                                    router.get(
                                        route("doctor.appointments.today"),
                                        {
                                            ...searchParams,
                                            status: "scheduled",
                                        },
                                        { preserveState: true }
                                    );
                                }}
                                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                                    searchParams.status === "scheduled"
                                        ? "text-blue-600 border-blue-600 active"
                                        : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <CalendarClock size={16} className="mr-2" />
                                Terjadwal
                            </a>
                        </li>
                        <li className="mr-2">
                            <a
                                href="#"
                                onClick={() => {
                                    setSearchParams({
                                        ...searchParams,
                                        status: "completed",
                                    });
                                    router.get(
                                        route("doctor.appointments.today"),
                                        {
                                            ...searchParams,
                                            status: "completed",
                                        },
                                        { preserveState: true }
                                    );
                                }}
                                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                                    searchParams.status === "completed"
                                        ? "text-blue-600 border-blue-600 active"
                                        : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <CheckCircle size={16} className="mr-2" />
                                Selesai
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Appointments List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Daftar Pasien Hari Ini
                            </h3>
                            {appointments?.total && (
                                <p className="text-gray-600 mt-1">
                                    Total: {appointments.total} Pasien
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <div
                                className={`px-3 py-1 rounded-full ${statusColors.confirmed} flex items-center text-sm`}
                            >
                                <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
                                <span>Menunggu</span>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full ${statusColors.scheduled} flex items-center text-sm`}
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                                <span>Terjadwal</span>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full ${statusColors.completed} flex items-center text-sm`}
                            >
                                <div className="w-2 h-2 rounded-full bg-purple-600 mr-2"></div>
                                <span>Selesai</span>
                            </div>
                        </div>
                    </div>

                    {appointments?.data?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Antrian
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Pasien
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            No. RM
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Waktu
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
                                            className={`hover:bg-gray-50 ${
                                                appointment.status ===
                                                "confirmed"
                                                    ? "bg-green-50"
                                                    : appointment.status ===
                                                      "scheduled"
                                                    ? "bg-white"
                                                    : appointment.status ===
                                                      "completed"
                                                    ? "bg-purple-50"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-200 flex items-center justify-center">
                                                        <span className="text-blue-800 font-bold text-sm">
                                                            {appointment.queue
                                                                ? appointment
                                                                      .queue
                                                                      .formatted_queue_number ||
                                                                  (appointment
                                                                      .queue
                                                                      .queue_number
                                                                      ? "A" +
                                                                        String(
                                                                            appointment
                                                                                .queue
                                                                                .queue_number
                                                                        ).padStart(
                                                                            3,
                                                                            "0"
                                                                        )
                                                                      : "-")
                                                                : "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                        <User
                                                            size={18}
                                                            className="text-gray-700"
                                                        />
                                                    </div>
                                                    <div>
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
                                                    <Clock
                                                        size={16}
                                                        className="text-blue-600 mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">
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
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={route(
                                                            "doctor.appointments.show",
                                                            appointment.id
                                                        )}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all inline-block"
                                                    >
                                                        <FileEdit size={16} />
                                                    </Link>

                                                    {appointment.status ===
                                                        "confirmed" && (
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "Selesaikan konsultasi pasien ini?"
                                                                    )
                                                                ) {
                                                                    router.post(
                                                                        route(
                                                                            "appointments.update-status",
                                                                            appointment.id
                                                                        ),
                                                                        {
                                                                            status: "completed",
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all inline-flex items-center"
                                                            title="Selesaikan Konsultasi"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}

                                                    {(appointment.status ===
                                                        "scheduled" ||
                                                        appointment.status ===
                                                            "confirmed") && (
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "Tandai pasien tidak hadir?"
                                                                    )
                                                                ) {
                                                                    router.post(
                                                                        route(
                                                                            "appointments.update-status",
                                                                            appointment.id
                                                                        ),
                                                                        {
                                                                            status: "no_show",
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all inline-flex items-center"
                                                            title="Tandai Tidak Hadir"
                                                        >
                                                            <UserMinus
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
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
                                Tidak Ada Pasien
                                {searchParams.status !== "all"
                                    ? ` ${statusLabels[searchParams.status]}`
                                    : ""}{" "}
                                Hari Ini
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Tidak ada janji temu pasien yang terjadwal untuk
                                hari ini
                                {searchParams.status !== "all"
                                    ? ` dengan status ${
                                          statusLabels[searchParams.status]
                                      }`
                                    : ""}
                                .
                            </p>
                            <div className="flex justify-center space-x-3">
                                {searchParams.status !== "all" && (
                                    <button
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                                    >
                                        Lihat Semua Pasien
                                    </button>
                                )}
                            </div>
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
