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
    UserPlus,
    ArrowRight,
    CalendarCheck,
    CalendarClock,
    Check,
    X,
} from "lucide-react";
import Pagination from "@/Components/Pagination";

export default function TodayAppointments({ appointments, filters, today }) {
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
        router.get(route("employee.appointments.today"), searchParams, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearchParams({
            status: "all",
        });
        router.get(
            route("employee.appointments.today"),
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
            <Head title="Janji Temu Hari Ini" />

            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <CalendarCheck
                                size={24}
                                className="text-blue-600"
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Janji Temu Hari Ini
                            </h2>
                            <p className="text-gray-600">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route("employee.appointments.index")}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all flex items-center"
                        >
                            <Calendar size={18} className="mr-2" />
                            Semua Janji Temu
                        </Link>
                        <Link
                            href={route(
                                "employee.appointments.create-for-patient"
                            )}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center"
                        >
                            <UserPlus size={18} className="mr-2" />
                            Buat Janji Temu
                        </Link>
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

                {/* Status Filter */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-wrap items-center">
                        <div className="mr-4 mb-2 flex items-center">
                            <Filter size={18} className="mr-2 text-gray-600" />
                            <span className="text-gray-700 font-medium">
                                Filter Status:
                            </span>
                        </div>
                        <div className="flex-1 mb-2">
                            <select
                                value={searchParams.status}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        status: e.target.value,
                                    })
                                }
                                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                            >
                                <option value="all">Semua Status</option>
                                <option value="scheduled">Terjadwal</option>
                                <option value="confirmed">Dikonfirmasi</option>
                                <option value="completed">Selesai</option>
                                <option value="canceled">Dibatalkan</option>
                                <option value="no_show">Tidak Hadir</option>
                            </select>
                        </div>
                        <div className="flex mb-2">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center mr-2"
                            >
                                Terapkan
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Daftar Janji Temu Hari Ini
                            </h3>
                            {appointments?.total && (
                                <p className="text-gray-600 mt-1">
                                    Total: {appointments.total} Janji Temu
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <div
                                className={`px-3 py-1 rounded-full ${statusColors.confirmed} flex items-center text-sm`}
                            >
                                <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
                                <span>Datang</span>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full ${statusColors.scheduled} flex items-center text-sm`}
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                                <span>Menunggu</span>
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
                                            Dokter
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Waktu
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
                                                            {
                                                                appointment
                                                                    .patient
                                                                    .no_rm
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            dr.{" "}
                                                            {
                                                                appointment
                                                                    .doctor.name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                appointment
                                                                    .doctor
                                                                    .specialization
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
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
                                                        {appointment.schedule && (
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    appointment
                                                                        .schedule
                                                                        .formatted_time
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
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
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={route(
                                                            "employee.appointments.show",
                                                            appointment.id
                                                        )}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all inline-block"
                                                    >
                                                        Detail
                                                    </Link>

                                                    {appointment.status ===
                                                        "scheduled" && (
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "Konfirmasi kehadiran pasien?"
                                                                    )
                                                                ) {
                                                                    router.put(
                                                                        route(
                                                                            "employee.appointments.update-status",
                                                                            {
                                                                                appointment:
                                                                                    appointment.id,
                                                                                status: "confirmed",
                                                                            }
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all inline-block"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}

                                                    {appointment.status ===
                                                        "scheduled" && (
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "Tandai pasien tidak hadir?"
                                                                    )
                                                                ) {
                                                                    router.put(
                                                                        route(
                                                                            "employee.appointments.update-status",
                                                                            {
                                                                                appointment:
                                                                                    appointment.id,
                                                                                status: "no_show",
                                                                            }
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all inline-block"
                                                        >
                                                            <X size={16} />
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
                                <CalendarClock size={28} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                Tidak Ada Janji Temu Hari Ini
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Tidak ada janji temu yang terjadwal untuk hari
                                ini
                                {filters.status !== "all"
                                    ? ` dengan status ${
                                          statusLabels[filters.status]
                                      }`
                                    : ""}
                                .
                            </p>
                            <div className="flex justify-center space-x-3">
                                {filters.status !== "all" && (
                                    <button
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                                <Link
                                    href={route(
                                        "employee.appointments.create-for-patient"
                                    )}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
                                >
                                    <UserPlus size={18} className="mr-2" />
                                    Buat Janji Temu Baru
                                </Link>
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
