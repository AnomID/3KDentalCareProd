import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    User,
    FileText,
    Phone,
    MapPin,
    MessageSquare,
    ArrowLeft,
    X,
    CheckCircle,
    AlertCircle,
    Calendar as CalendarIcon,
} from "lucide-react";
import { useState } from "react";

export default function AppointmentsShow({
    appointment,
    canCancel,
    canComplete,
    canMarkNoShow,
}) {
    const { auth } = usePage().props;
    // Get flash messages, with fallback to empty object if undefined
    const flash = usePage().props.flash || {};
    const [processing, setProcessing] = useState(false);

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

    const updateStatus = async (status) => {
        let message = "";

        switch (status) {
            case "canceled":
                message = "Apakah Anda yakin ingin membatalkan janji temu ini?";
                break;
            case "completed":
                message = "Tandai janji temu ini sebagai selesai?";
                break;
            case "no_show":
                message = "Tandai pasien sebagai tidak hadir?";
                break;
            default:
                message = "Ubah status menjadi " + statusLabels[status] + "?";
        }

        if (confirm(message)) {
            setProcessing(true);

            router.put(
                route("appointments.update-status", {
                    appointment: appointment.id,
                    status: status,
                }),
                {},
                {
                    onFinish: () => setProcessing(false),
                }
            );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-extrabold text-[#EEE4D3]">
                        Detail Janji Temu
                    </h2>
                    <span className="text-[#1D1D22] bg-[#F8D465] px-4 py-2 rounded-lg">
                        Halo, {auth.user.name}!
                    </span>
                </div>
            }
        >
            <Head title="Detail Janji Temu" />

            <div className="py-8 min-h-screen bg-gradient-to-r from-[#1D1D22] via-[#3C2A25] to-[#4F3623]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash Message */}
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

                    {/* Back Button */}
                    <Link
                        href="/appointments"
                        className="inline-flex items-center text-[#EEE4D3] mb-6 hover:text-[#F8D465] transition-all"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Kembali ke Daftar Janji Temu
                    </Link>

                    {/* Appointment Status */}
                    <div className="bg-[#F8D465] p-6 rounded-lg shadow-lg mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-4 h-4 rounded-full ${
                                            statusColors[appointment.status]
                                        } mr-2`}
                                    ></span>
                                    <h3 className="text-2xl font-bold text-[#1D1D22]">
                                        {statusLabels[appointment.status]}
                                    </h3>
                                </div>
                                <p className="text-[#1D1D22] mt-2">
                                    Nomor Antrian:{" "}
                                    <span className="font-semibold">
                                        {appointment.queue
                                            ? appointment.queue
                                                  .formatted_queue_number ||
                                              "A" +
                                                  String(
                                                      appointment.queue
                                                          .queue_number
                                                  ).padStart(3, "0")
                                            : "-"}
                                    </span>
                                </p>
                            </div>

                            <div className="mt-4 md:mt-0 flex space-x-2">
                                {canCancel && (
                                    <button
                                        onClick={() => updateStatus("canceled")}
                                        disabled={processing}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                                    >
                                        <X size={16} className="inline mr-1" />
                                        Batalkan
                                    </button>
                                )}

                                {canComplete && (
                                    <button
                                        onClick={() =>
                                            updateStatus("completed")
                                        }
                                        disabled={processing}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all"
                                    >
                                        <CheckCircle
                                            size={16}
                                            className="inline mr-1"
                                        />
                                        Selesai
                                    </button>
                                )}

                                {canMarkNoShow && (
                                    <button
                                        onClick={() => updateStatus("no_show")}
                                        disabled={processing}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                                    >
                                        <X size={16} className="inline mr-1" />
                                        Tidak Hadir
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Appointment Details */}
                        <div className="bg-[#D5CABB] p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
                            <h4 className="text-lg font-semibold text-[#1D1D22] mb-4">
                                Detail Janji Temu
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <CalendarIcon
                                            size={20}
                                            className="text-[#3C2A25] mr-3"
                                        />
                                        <div>
                                            <p className="text-sm text-[#3C2A25]">
                                                Tanggal
                                            </p>
                                            <p className="font-semibold text-[#1D1D22]">
                                                {new Date(
                                                    appointment.appointment_date
                                                ).toLocaleDateString("id-ID", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center mb-2">
                                        <Clock
                                            size={20}
                                            className="text-[#3C2A25] mr-3"
                                        />
                                        <div>
                                            <p className="text-sm text-[#3C2A25]">
                                                Waktu
                                            </p>
                                            <p className="font-semibold text-[#1D1D22]">
                                                {appointment.appointment_time.substring(
                                                    0,
                                                    5
                                                )}{" "}
                                                WIB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center mb-2">
                                        <User
                                            size={20}
                                            className="text-[#3C2A25] mr-3"
                                        />
                                        <div>
                                            <p className="text-sm text-[#3C2A25]">
                                                Pasien
                                            </p>
                                            <p className="font-semibold text-[#1D1D22]">
                                                {appointment.patient.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center mb-2">
                                        <User
                                            size={20}
                                            className="text-[#3C2A25] mr-3"
                                        />
                                        <div>
                                            <p className="text-sm text-[#3C2A25]">
                                                Dokter
                                            </p>
                                            <p className="font-semibold text-[#1D1D22]">
                                                {appointment.doctor.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start mb-2">
                                        <FileText
                                            size={20}
                                            className="text-[#3C2A25] mr-3 mt-1"
                                        />
                                        <div>
                                            <p className="text-sm text-[#3C2A25]">
                                                Spesialisasi
                                            </p>
                                            <p className="font-semibold text-[#1D1D22]">
                                                {
                                                    appointment.doctor
                                                        .specialization
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {appointment.doctor.phone && (
                                        <div className="flex items-center mb-2">
                                            <Phone
                                                size={20}
                                                className="text-[#3C2A25] mr-3"
                                            />
                                            <div>
                                                <p className="text-sm text-[#3C2A25]">
                                                    Kontak Klinik
                                                </p>
                                                <p className="font-semibold text-[#1D1D22]">
                                                    {appointment.doctor.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 border-t border-[#3C2A25] border-opacity-20 pt-6">
                                <div className="flex items-start mb-4">
                                    <MessageSquare
                                        size={20}
                                        className="text-[#3C2A25] mr-3 mt-1"
                                    />
                                    <div>
                                        <p className="text-sm text-[#3C2A25]">
                                            Keluhan Utama
                                        </p>
                                        <p className="font-semibold text-[#1D1D22] mt-1">
                                            {appointment.chief_complaint}
                                        </p>
                                    </div>
                                </div>

                                {appointment.notes && (
                                    <div className="flex items-start">
                                        <FileText
                                            size={20}
                                            className="text-[#3C2A25] mr-3 mt-1"
                                        />
                                        <div>
                                            <p className="text-sm text-[#3C2A25]">
                                                Catatan Tambahan
                                            </p>
                                            <p className="font-semibold text-[#1D1D22] mt-1">
                                                {appointment.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
