import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    User,
    FileText,
    X,
    Check,
    AlertTriangle,
} from "lucide-react";
import { useState } from "react";

export default function AppointmentsIndex({ appointments, filters }) {
    const { auth } = usePage().props;
    const [dateFilter, setDateFilter] = useState(filters.date || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");

    const { post, processing } = useForm();

    const statusColors = {
        scheduled: "bg-blue-500",
        confirmed: "bg-green-500",
        completed: "bg-purple-500",
        canceled: "bg-red-500",
        no_show: "bg-gray-500",
    };

    const statusLabels = {
        scheduled: "Terjadwal",
        confirmed: "Dikonfirmasi",
        completed: "Selesai",
        canceled: "Dibatalkan",
        no_show: "Tidak Hadir",
    };

    const handleFilterChange = () => {
        const params = new URLSearchParams();
        if (dateFilter) params.append("date", dateFilter);
        if (statusFilter !== "all") params.append("status", statusFilter);

        window.location.href = `/appointments?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-extrabold text-[#EEE4D3]">
                        Janji Temu Anda
                    </h2>
                    <span className="text-[#1D1D22] bg-[#F8D465] px-4 py-2 rounded-lg">
                        Halo, {auth.user.name}!
                    </span>
                </div>
            }
        >
            <Head title="Janji Temu" />

            <div className="py-8 min-h-screen bg-gradient-to-r from-[#1D1D22] via-[#3C2A25] to-[#4F3623]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header and Actions */}
                    <div className="bg-[#F8D465] p-6 rounded-lg shadow-lg mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-[#1D1D22]">
                                    Janji Temu Anda
                                </h3>
                                <p className="text-[#1D1D22] mt-2">
                                    Kelola semua jadwal janji temu dengan dokter
                                    gigi kami
                                </p>
                            </div>
                            <Link
                                href="/appointments/create"
                                className="mt-4 md:mt-0 px-6 py-3 bg-[#1D1D22] text-white rounded-lg font-semibold flex items-center justify-center"
                            >
                                <Calendar className="mr-2" size={18} />
                                Buat Janji Baru
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-[#D5CABB] p-6 rounded-lg shadow-lg mb-6">
                        <h4 className="text-lg font-semibold text-[#1D1D22] mb-4">
                            Filter
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-[#1D1D22] mb-2"
                                >
                                    Tanggal
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    className="w-full px-4 py-2 rounded-lg border border-[#C3A764] focus:outline-none focus:ring-2 focus:ring-[#F8D465]"
                                    value={dateFilter}
                                    onChange={(e) =>
                                        setDateFilter(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-[#1D1D22] mb-2"
                                >
                                    Status
                                </label>
                                <select
                                    id="status"
                                    className="w-full px-4 py-2 rounded-lg border border-[#C3A764] focus:outline-none focus:ring-2 focus:ring-[#F8D465]"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="scheduled">Terjadwal</option>
                                    <option value="confirmed">
                                        Dikonfirmasi
                                    </option>
                                    <option value="completed">Selesai</option>
                                    <option value="canceled">Dibatalkan</option>
                                    <option value="no_show">Tidak Hadir</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleFilterChange}
                                    className="w-full px-4 py-2 bg-[#C3A764] text-[#1D1D22] rounded-lg font-semibold hover:bg-[#F8D465] transition-all"
                                >
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appointments List */}
                    {appointments.data.length > 0 ? (
                        <div className="space-y-6">
                            {appointments.data.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="bg-[#D5CABB] rounded-lg shadow-lg overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <span
                                                        className={`inline-block w-3 h-3 rounded-full ${
                                                            statusColors[
                                                                appointment
                                                                    .status
                                                            ]
                                                        } mr-2`}
                                                    ></span>
                                                    <span className="text-sm font-medium text-[#1D1D22]">
                                                        {
                                                            statusLabels[
                                                                appointment
                                                                    .status
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-semibold text-[#1D1D22] mb-2">
                                                    {appointment.doctor.name}
                                                </h4>
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center text-[#1D1D22]">
                                                        <Calendar
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        <span>
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
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-[#1D1D22]">
                                                        <Clock
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        <span>
                                                            {appointment.appointment_time.substring(
                                                                0,
                                                                5
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                                                <Link
                                                    href={`/appointments/${appointment.id}`}
                                                    className="px-4 py-2 bg-[#C3A764] text-[#1D1D22] rounded-lg font-semibold hover:bg-[#F8D465] transition-all text-center"
                                                >
                                                    Lihat Detail
                                                </Link>

                                                {appointment.status ===
                                                    "scheduled" && (
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "Apakah Anda yakin ingin membatalkan janji temu ini?"
                                                                )
                                                            ) {
                                                                post(
                                                                    route(
                                                                        "appointments.update-status",
                                                                        {
                                                                            appointment:
                                                                                appointment.id,
                                                                            status: "canceled",
                                                                        }
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        disabled={processing}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all text-center"
                                                    >
                                                        <X
                                                            size={16}
                                                            className="inline mr-1"
                                                        />
                                                        Batalkan
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            <div className="mt-6">
                                {/* Add pagination component here if needed */}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#D5CABB] p-8 rounded-lg shadow-lg text-center">
                            <Calendar
                                size={48}
                                className="mx-auto text-[#C3A764] mb-4"
                            />
                            <h4 className="text-xl font-semibold text-[#1D1D22] mb-2">
                                Belum Ada Janji Temu
                            </h4>
                            <p className="text-[#1D1D22] mb-6">
                                Anda belum memiliki janji temu. Buat janji temu
                                untuk konsultasi dengan dokter gigi kami.
                            </p>
                            <Link
                                href="/appointments/create"
                                className="px-6 py-3 bg-[#C3A764] text-[#1D1D22] rounded-lg font-semibold hover:bg-[#F8D465] transition-all"
                            >
                                Buat Janji Sekarang
                            </Link>
                        </div>
                    )}

                    {/* Upcoming Appointments Preview (if on dashboard) */}
                    {false && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-[#EEE4D3] mb-4">
                                Janji Temu Mendatang
                            </h3>
                            {/* Add upcoming appointments preview here */}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
