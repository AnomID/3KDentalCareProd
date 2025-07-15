import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    Users,
    UserCheck,
    Activity,
    Search,
    Filter,
    User,
    Phone,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    BarChart3,
    CalendarDays,
} from "lucide-react";

const Index = ({
    patients = {},
    doctor = {},
    filters = {},
    statusOptions = {},
}) => {
    const { auth } = usePage().props;
    const flash = usePage().props.flash || {};

    const [searchParams, setSearchParams] = useState({
        search: filters.search || "",
        status_filter: filters.status_filter || "all",
    });

    // Ensure patients has proper structure
    const patientsData = patients?.data || [];
    const patientsTotal = patients?.total || 0;

    // Calculate stats
    const activeCount = patientsData.filter(
        (p) => p?.appointment_stats?.active > 0
    ).length;
    const completedCount = patientsData.filter(
        (p) => p?.appointment_stats?.completed > 0
    ).length;

    const handleSearch = () => {
        router.get(route("doctor.patients.index"), searchParams, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearchParams({
            search: "",
            status_filter: "all",
        });
        router.get(
            route("doctor.patients.index"),
            { search: "", status_filter: "all" },
            { preserveState: true }
        );
    };

    const getStatusBadge = (appointment) => {
        if (!appointment)
            return (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    Tidak Ada
                </span>
            );

        const statusStyles = {
            scheduled: "bg-blue-100 text-blue-800",
            confirmed: "bg-green-100 text-green-800",
            in_progress: "bg-yellow-100 text-yellow-800",
            completed: "bg-purple-100 text-purple-800",
            canceled: "bg-red-100 text-red-800",
            no_show: "bg-gray-100 text-gray-800",
        };

        const statusLabels = {
            scheduled: "Terjadwal",
            confirmed: "Dikonfirmasi",
            in_progress: "Sedang Berlangsung",
            completed: "Selesai",
            canceled: "Dibatalkan",
            no_show: "Tidak Hadir",
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusStyles[appointment.status] ||
                    "bg-gray-100 text-gray-600"
                }`}
            >
                {statusLabels[appointment.status] || appointment.status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <AuthorizeLayout>
            <Head title="Daftar Pasien Saya" />

            {/* Stats Cards - Same layout as appointments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Patients */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users size={24} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm font-medium">
                                Total Pasien Saya
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {patientsTotal}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-gray-600 text-sm font-medium flex items-center">
                            Pasien dengan riwayat appointment
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
                        </p>
                    </div>
                </div>

                {/* Active Patients */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <UserCheck size={24} className="text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm font-medium">
                                Pasien Aktif
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {activeCount}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => {
                                setSearchParams({
                                    ...searchParams,
                                    status_filter: "active",
                                });
                                router.get(route("doctor.patients.index"), {
                                    ...searchParams,
                                    status_filter: "active",
                                });
                            }}
                            className="text-green-600 text-sm font-medium hover:underline flex items-center"
                        >
                            Lihat pasien dengan appointment aktif
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
                        </button>
                    </div>
                </div>

                {/* Completed Treatments */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <BarChart3 size={24} className="text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-gray-500 text-sm font-medium">
                                Perawatan Selesai
                            </p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {completedCount}
                            </h3>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => {
                                setSearchParams({
                                    ...searchParams,
                                    status_filter: "completed",
                                });
                                router.get(route("doctor.patients.index"), {
                                    ...searchParams,
                                    status_filter: "completed",
                                });
                            }}
                            className="text-purple-600 text-sm font-medium hover:underline flex items-center"
                        >
                            Lihat riwayat perawatan
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
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - Same layout as appointments */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Daftar Pasien
                    </h2>
                </div>

                {/* Flash Messages - Same as appointments */}
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

                {/* Search and Filter Section - Same as appointments */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <Filter size={20} className="mr-2" />
                        Filter Pasien
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cari Pasien
                            </label>
                            <input
                                type="text"
                                placeholder="Nama, telepon, atau No. RM..."
                                value={searchParams.search}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        search: e.target.value,
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
                                value={searchParams.status_filter}
                                onChange={(e) =>
                                    setSearchParams({
                                        ...searchParams,
                                        status_filter: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.entries(statusOptions || {}).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    )
                                )}
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

                {/* Patient List - Same structure as appointments */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Daftar Pasien
                        </h3>
                        {patientsTotal > 0 && (
                            <p className="text-gray-600 mt-1">
                                Total: {patientsTotal} Pasien
                            </p>
                        )}
                    </div>

                    {patientsData.length > 0 ? (
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
                                            Informasi Dasar
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Statistik Appointment
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Appointment Terakhir
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {patientsData.map((patient, index) => (
                                        <tr
                                            key={patient?.id || index}
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
                                                            {patient?.name ||
                                                                "N/A"}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {patient?.gender ===
                                                            "male"
                                                                ? "Laki-laki"
                                                                : "Perempuan"}
                                                            ,{" "}
                                                            {patient?.age ||
                                                                "-"}{" "}
                                                            tahun
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-900">
                                                {patient?.no_rm || "-"}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <Phone
                                                        size={16}
                                                        className="text-blue-600 mr-2"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {patient?.phone ||
                                                                "-"}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {patient?.blood_type ||
                                                                "Golongan darah: -"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div>
                                                        Total:{" "}
                                                        <span className="font-semibold">
                                                            {patient
                                                                ?.appointment_stats
                                                                ?.total || 0}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        Selesai:{" "}
                                                        <span className="text-purple-600">
                                                            {patient
                                                                ?.appointment_stats
                                                                ?.completed ||
                                                                0}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        Aktif:{" "}
                                                        <span className="text-blue-600">
                                                            {patient
                                                                ?.appointment_stats
                                                                ?.active || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {patient?.latest_appointment ? (
                                                    <div>
                                                        <div className="flex items-center">
                                                            <Calendar
                                                                size={16}
                                                                className="text-blue-600 mr-2"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {formatDate(
                                                                        patient
                                                                            .latest_appointment
                                                                            .appointment_date
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <Clock
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="mr-1"
                                                                    />
                                                                    Status:{" "}
                                                                    {getStatusBadge(
                                                                        patient.latest_appointment
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">
                                                        Tidak ada
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                {patient && patient.id ? (
                                                    <Link
                                                        href={route(
                                                            "doctor.patients.show",
                                                            patient.id
                                                        )}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all inline-block"
                                                    >
                                                        Detail
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <Users size={28} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                Tidak Ada Pasien
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchParams.search ||
                                searchParams.status_filter !== "all"
                                    ? "Tidak ada pasien yang sesuai dengan filter yang dipilih."
                                    : "Belum ada pasien dengan riwayat appointment."}
                            </p>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}

                    {/* Pagination - Same as appointments */}
                    {patients?.data?.length > 0 && patients?.links && (
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {patients.from || 0} sampai{" "}
                                    {patients.to || 0} dari{" "}
                                    {patients.total || 0} pasien
                                </div>
                                <div className="flex space-x-1">
                                    {patients.links.map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 text-sm border rounded bg-gray-100 text-gray-400 border-gray-300"
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            link.label || "...",
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm border rounded ${
                                                    link.active
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label || "...",
                                                }}
                                                preserveState
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthorizeLayout>
    );
};

export default Index;
