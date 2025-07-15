import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Calendar,
    Clock,
    FileText,
    CalendarCheck,
    CheckCircle,
    AlertCircle,
    User,
} from "lucide-react";

export default function PatientDashboard({
    patient,
    upcomingAppointments,
    pastAppointments,
    totalAppointments,
    completedAppointments,
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-extrabold text-[#EEE4D3]">
                        Dashboard Pasien
                    </h2>
                    <span className="text-[#1D1D22] bg-[#F8D465] px-4 py-2 rounded-lg">
                        Halo, {auth.user.name}!
                    </span>
                </div>
            }
        >
            <Head title="Dashboard Pasien" />

            <div className="py-8 min-h-screen bg-gradient-to-r from-[#1D1D22] via-[#3C2A25] to-[#4F3623]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Info Pasien */}
                    <div className="bg-[#F8D465] p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold text-[#1D1D22]">
                            Selamat datang, {auth.user.name}! 👋
                        </h3>
                        <p className="text-[#1D1D22] mt-2">
                            Lihat informasi janji temu, riwayat perawatan, dan
                            jadwal kontrol.
                        </p>
                    </div>

                    {/* Statistik */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                        <StatCard
                            title="Janji Temu"
                            value={totalAppointments}
                            icon={Calendar}
                        />
                        <StatCard
                            title="Perawatan Selesai"
                            value={completedAppointments}
                            icon={CheckCircle}
                        />
                        <StatCard
                            title="Janji Temu Mendatang"
                            value={upcomingAppointments.length}
                            icon={CalendarCheck}
                        />
                    </div>

                    {/* Akses Cepat */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-[#EEE4D3] mb-4">
                            Akses Cepat
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <ActionCard
                                title="Buat Janji Baru"
                                href="/appointments/create"
                                icon={Calendar}
                            />
                            <ActionCard
                                title="Lihat Janji Temu"
                                href="/appointments"
                                icon={Clock}
                            />
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-[#EEE4D3] mb-4">
                            Janji Temu Mendatang
                        </h3>

                        {upcomingAppointments.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {upcomingAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="bg-[#D5CABB] p-6 rounded-lg shadow-lg border-l-4 border-[#F8D465]"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-lg font-semibold text-[#1D1D22]">
                                                    Dr.{" "}
                                                    {appointment.doctor.name}
                                                </p>
                                                <p className="text-sm text-[#3C2A25]">
                                                    {
                                                        appointment.doctor
                                                            .specialization
                                                    }
                                                </p>
                                            </div>
                                            <div
                                                className={`px-2 py-1 text-xs rounded ${
                                                    appointment.status ===
                                                    "scheduled"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {appointment.status ===
                                                "scheduled"
                                                    ? "Terjadwal"
                                                    : "Dikonfirmasi"}
                                            </div>
                                        </div>

                                        <div className="flex items-center mb-3">
                                            <Calendar
                                                size={16}
                                                className="text-[#3C2A25] mr-2"
                                            />
                                            <span className="text-[#1D1D22]">
                                                {formatDate(
                                                    appointment.appointment_date
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center mb-4">
                                            <Clock
                                                size={16}
                                                className="text-[#3C2A25] mr-2"
                                            />
                                            <span className="text-[#1D1D22]">
                                                {formatTime(
                                                    appointment.appointment_time
                                                )}{" "}
                                                WIB
                                            </span>
                                        </div>

                                        <Link
                                            href={route(
                                                "patient.appointments.show",
                                                appointment.id
                                            )}
                                            className="block text-center px-4 py-2 bg-[#C3A764] text-[#1D1D22] rounded-lg font-semibold hover:bg-[#F8D465] transition-all mt-2"
                                        >
                                            Lihat Detail
                                        </Link>
                                    </div>
                                ))}
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
                                    Anda belum memiliki janji temu. Buat janji
                                    temu untuk konsultasi dengan dokter gigi
                                    kami.
                                </p>
                                <Link
                                    href="/appointments/create"
                                    className="px-6 py-3 bg-[#C3A764] text-[#1D1D22] rounded-lg font-semibold hover:bg-[#F8D465] transition-all"
                                >
                                    Buat Janji Sekarang
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Past Appointments */}
                    {pastAppointments.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-[#EEE4D3] mb-4">
                                Riwayat Perawatan
                            </h3>
                            <div className="bg-[#D5CABB] p-6 rounded-lg shadow-lg">
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left py-2 px-3 text-[#1D1D22]">
                                                Tanggal
                                            </th>
                                            <th className="text-left py-2 px-3 text-[#1D1D22]">
                                                Dokter
                                            </th>
                                            <th className="text-left py-2 px-3 text-[#1D1D22]">
                                                Status
                                            </th>
                                            <th className="text-right py-2 px-3 text-[#1D1D22]">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3C2A25] divide-opacity-10">
                                        {pastAppointments.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td className="py-3 px-3 text-[#1D1D22]">
                                                    {formatDate(
                                                        appointment.appointment_date
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-[#1D1D22]">
                                                    Dr.{" "}
                                                    {appointment.doctor.name}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                        Selesai
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <Link
                                                        href={route(
                                                            "patient.appointments.show",
                                                            appointment.id
                                                        )}
                                                        className="text-[#C3A764] hover:text-[#F8D465] font-medium"
                                                    >
                                                        Lihat Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-4 text-center">
                                    <Link
                                        href="/appointments?status=completed"
                                        className="inline-block px-4 py-2 bg-[#C3A764] text-[#1D1D22] rounded-lg font-medium hover:bg-[#F8D465] transition-all"
                                    >
                                        Lihat Semua Riwayat
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Patient Info */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-[#EEE4D3] mb-4">
                            Informasi Pasien
                        </h3>
                        <div className="bg-[#D5CABB] p-6 rounded-lg shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-[#1D1D22] mb-3">
                                        Data Pribadi
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Nama
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.name}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Nomor RM
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.no_rm || "-"}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Tanggal Lahir
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.birth_date
                                                    ? formatDate(
                                                          patient.birth_date
                                                      )
                                                    : "-"}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Umur
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.age || "-"} tahun
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Jenis Kelamin
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.gender === "male"
                                                    ? "Laki-laki"
                                                    : patient.gender ===
                                                      "female"
                                                    ? "Perempuan"
                                                    : "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-[#1D1D22] mb-3">
                                        Kontak
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Alamat
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.address || "-"}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Telepon
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.phone || "-"}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <span className="text-[#3C2A25] w-32">
                                                Golongan Darah
                                            </span>
                                            <span className="text-[#1D1D22] font-medium">
                                                {patient.blood_type || "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-right">
                                        <Link
                                            href="/patient-profile"
                                            className="inline-block px-4 py-2 bg-[#C3A764] text-[#1D1D22] rounded-lg font-medium hover:bg-[#F8D465] transition-all"
                                        >
                                            Edit Profil
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Komponen Kartu Statistik
function StatCard({ title, value, icon: Icon }) {
    return (
        <div className="bg-[#D5CABB] p-6 rounded-lg shadow-lg flex items-center space-x-4 border-l-4 border-[#F8D465] hover:bg-[#F8D465] transition-all">
            <Icon size={32} className="text-[#1D1D22]" />
            <div>
                <p className="text-lg font-semibold text-[#1D1D22]">{title}</p>
                <p className="text-2xl font-bold text-[#1D1D22]">{value}</p>
            </div>
        </div>
    );
}

// Komponen Kartu Aksi
function ActionCard({ title, href, icon: Icon }) {
    return (
        <Link
            href={href}
            className="bg-[#C3A764] p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:bg-[#F8D465] transition-all"
        >
            <Icon size={28} className="text-[#1D1D22]" />
            <p className="text-lg font-semibold text-[#1D1D22]">{title}</p>
        </Link>
    );
}
