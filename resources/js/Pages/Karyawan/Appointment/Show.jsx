import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    Calendar,
    Clock,
    User,
    FileText,
    CheckCircle,
    AlertCircle,
    X,
    AlertTriangle,
    Clipboard,
    MessageSquare,
    ArrowLeft,
} from "lucide-react";
import Modal from "@/Components/Modal";

export default function EmployeeAppointmentShow({
    appointment,
    canCancel,
    canComplete,
    canMarkNoShow,
}) {
    const { auth } = usePage().props;
    const flash = usePage().props.flash || {};
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState("");
    const [modalTitle, setModalTitle] = useState("");

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
    };
    const getHariFromDayOfWeek = (day) => {
        const hari = [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
        ];
        return hari[day] || "-";
    };
    const openModal = (action, title) => {
        setModalAction(action);
        setModalTitle(title);
        setModalOpen(true);
    };

    const handleUpdateStatus = (status) => {
        router.put(
            route("employee.appointments.update-status", {
                appointment: appointment.id,
                status: status,
            })
        );
        setModalOpen(false);
    };

    return (
        <AuthorizeLayout>
            <Head title="Detail Janji Temu" />

            <div className="bg-white shadow-lg rounded-lg">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <Link
                                href={route("employee.appointments.index")}
                                className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
                            >
                                <ArrowLeft size={18} className="mr-1" />
                                <span>Kembali</span>
                            </Link>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Detail Janji Temu
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {appointment.status === "scheduled" && (
                                <button
                                    onClick={() =>
                                        openModal(
                                            "confirm",
                                            "Konfirmasi Janji Temu"
                                        )
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center"
                                >
                                    <CheckCircle size={18} className="mr-2" />
                                    Konfirmasi
                                </button>
                            )}
                            {canCancel && (
                                <button
                                    onClick={() =>
                                        openModal(
                                            "cancel",
                                            "Batalkan Janji Temu"
                                        )
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center"
                                >
                                    <X size={18} className="mr-2" />
                                    Batalkan
                                </button>
                            )}
                            {canMarkNoShow && (
                                <button
                                    onClick={() =>
                                        openModal(
                                            "no_show",
                                            "Tandai Tidak Hadir"
                                        )
                                    }
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center"
                                >
                                    <AlertTriangle size={18} className="mr-2" />
                                    Tidak Hadir
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mx-6 mt-6 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle size={18} className="mr-2" />
                            <p>{flash.success}</p>
                        </div>
                    </div>
                )}

                {flash.error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-6 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle size={18} className="mr-2" />
                            <p>{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Status Card */}
                <div className="p-6">
                    <div className="mb-8">
                        <div className="flex flex-col items-center p-6 border border-gray-200 rounded-lg bg-gray-50">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    statusColors[appointment.status]
                                } mb-2`}
                            >
                                {statusLabels[appointment.status]}
                            </span>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                {appointment.status === "scheduled" &&
                                    "Janji Temu Telah Terjadwal"}
                                {appointment.status === "confirmed" &&
                                    "Janji Temu Telah Dikonfirmasi"}
                                {appointment.status === "completed" &&
                                    "Janji Temu Telah Selesai"}
                                {appointment.status === "canceled" &&
                                    "Janji Temu Telah Dibatalkan"}
                                {appointment.status === "no_show" &&
                                    "Pasien Tidak Hadir"}
                            </h3>
                            {appointment.queue && (
                                <div className="bg-blue-100 text-blue-800 text-center px-4 py-2 rounded-lg mb-4 w-full md:w-auto">
                                    <p className="text-lg font-bold">
                                        Nomor Antrian
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {appointment.queue
                                            ? appointment.queue
                                                  .formatted_queue_number ||
                                              (appointment.queue.queue_number
                                                  ? "A" +
                                                    String(
                                                        appointment.queue
                                                            .queue_number
                                                    ).padStart(3, "0")
                                                  : "-")
                                            : "-"}
                                    </p>
                                </div>
                            )}
                            <div className="flex items-center text-gray-700 mb-2">
                                <Calendar
                                    size={18}
                                    className="mr-2 text-blue-600"
                                />
                                <span>
                                    {new Date(
                                        appointment.appointment_date
                                    ).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Clock
                                    size={18}
                                    className="mr-2 text-blue-600"
                                />
                                <span>
                                    {appointment.appointment_time.substring(
                                        0,
                                        5
                                    )}{" "}
                                    WIB
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Information */}
                        <div className="bg-white p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <User
                                    size={20}
                                    className="mr-2 text-blue-600"
                                />
                                Informasi Pasien
                            </h3>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Nama Pasien
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {appointment.patient.name}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Nomor Rekam Medis
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {appointment.patient &&
                                        appointment.patient.no_rm
                                            ? appointment.patient.no_rm
                                            : "-"}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Tanggal Lahir
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(
                                            appointment.patient.birth_date
                                        ).toLocaleDateString("id-ID", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Jenis Kelamin
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {appointment.patient.gender === "male"
                                            ? "Laki-laki"
                                            : "Perempuan"}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Nomor Telepon
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {appointment.patient &&
                                        typeof appointment.patient === "object"
                                            ? appointment.patient.phone || "-"
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Information */}
                        <div className="bg-white p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <User
                                    size={20}
                                    className="mr-2 text-blue-600"
                                />
                                Informasi Dokter
                            </h3>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Nama Dokter
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        dr. {appointment.doctor.name}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Spesialisasi
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {appointment.doctor.specialization}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Jadwal
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {appointment.schedule
                                            ? appointment.schedule.day_name ||
                                              getHariFromDayOfWeek(
                                                  appointment.schedule
                                                      .day_of_week
                                              )
                                            : "-"}
                                        {appointment.schedule ? ", " : ""}
                                        {appointment.schedule
                                            ? appointment.schedule
                                                  .formatted_time ||
                                              `${appointment.schedule.start_time.substring(
                                                  0,
                                                  5
                                              )} - ${appointment.schedule.end_time.substring(
                                                  0,
                                                  5
                                              )}`
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="bg-white p-6 border border-gray-200 rounded-lg md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FileText
                                    size={20}
                                    className="mr-2 text-blue-600"
                                />
                                Detail Janji Temu
                            </h3>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">
                                        Keluhan Utama
                                    </span>
                                    <span className="font-medium text-gray-900 whitespace-pre-line">
                                        {appointment.chief_complaint}
                                    </span>
                                </div>

                                {appointment.notes && (
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">
                                            Catatan Tambahan
                                        </span>
                                        <span className="font-medium text-gray-900 whitespace-pre-line">
                                            {appointment.notes}
                                        </span>
                                    </div>
                                )}

                                {appointment.medical_record && (
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">
                                            Catatan Medis
                                        </span>
                                        <span className="font-medium text-gray-900 whitespace-pre-line">
                                            {
                                                appointment.medical_record
                                                    .diagnosis
                                            }
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col pt-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-500">
                                        Dibuat pada
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(
                                            appointment.created_at
                                        ).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modals */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {modalTitle}
                    </h3>

                    {modalAction === "confirm" && (
                        <>
                            <p className="text-gray-700 mb-6">
                                Apakah Anda yakin ingin mengonfirmasi janji temu
                                ini?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleUpdateStatus("confirmed")
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                                >
                                    Konfirmasi
                                </button>
                            </div>
                        </>
                    )}

                    {modalAction === "cancel" && (
                        <>
                            <p className="text-gray-700 mb-6">
                                Apakah Anda yakin ingin membatalkan janji temu
                                ini?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Tidak
                                </button>
                                <button
                                    onClick={() =>
                                        handleUpdateStatus("canceled")
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                >
                                    Ya, Batalkan
                                </button>
                            </div>
                        </>
                    )}

                    {modalAction === "no_show" && (
                        <>
                            <p className="text-gray-700 mb-6">
                                Apakah Anda yakin ingin menandai pasien sebagai
                                tidak hadir?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                                >
                                    Tidak
                                </button>
                                <button
                                    onClick={() =>
                                        handleUpdateStatus("no_show")
                                    }
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                                >
                                    Ya, Tandai
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </AuthorizeLayout>
    );
}
