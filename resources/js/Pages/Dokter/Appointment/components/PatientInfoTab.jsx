import React from "react";
import { Link } from "@inertiajs/react";
import { User, PhoneCall, Activity, Info, Calendar } from "lucide-react";
import { formatDate } from "../utils/dateFormatters";

const PatientInfoTab = ({ appointment, patientData, canComplete }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Information */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <User size={18} className="mr-2 text-blue-600" />
                        Informasi Pasien
                    </h3>
                </div>
                <div className="p-4">
                    <div className="flex items-start mb-4">
                        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                            <User size={24} className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <h4 className="text-xl font-semibold text-gray-900">
                                {appointment.patient.name}
                            </h4>
                            <div className="flex items-center mt-1 text-gray-600">
                                <span className="mr-3">
                                    {appointment.patient.gender === "male"
                                        ? "Laki-laki"
                                        : "Perempuan"}
                                </span>
                                <span className="mx-1 text-gray-400">•</span>
                                <span className="mx-3">
                                    {appointment.patient.age} tahun
                                </span>
                                <span className="mx-1 text-gray-400">•</span>
                                <span className="mx-3">
                                    No. RM: {appointment.patient.no_rm}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-500 mb-2">
                                Tanggal Lahir
                            </h5>
                            <p className="text-gray-800">
                                {formatDate(appointment.patient.birth_date)}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-500 mb-2">
                                Nomor Telepon
                            </h5>
                            <p className="text-gray-800 flex items-center">
                                <PhoneCall
                                    size={16}
                                    className="mr-2 text-blue-600"
                                />
                                {patientData?.phone ||
                                    appointment.patient.phone ||
                                    "-"}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-500 mb-2">
                                Alamat
                            </h5>
                            <p className="text-gray-800">
                                {appointment.patient.address || "-"}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-500 mb-2">
                                Pekerjaan
                            </h5>
                            <p className="text-gray-800">
                                {appointment.patient.occupation || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href={route(
                                "medical-history.show",
                                appointment.patient.id
                            )}
                            className="inline-flex items-center text-blue-600 hover:underline"
                        >
                            <Activity size={16} className="mr-2" />
                            Lihat Riwayat Medis Pasien
                        </Link>
                    </div>

                    {appointment.status === "confirmed" && canComplete && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                <Info
                                    size={20}
                                    className="text-blue-600 mr-3"
                                />
                                <div>
                                    <p className="text-blue-800 font-medium">
                                        Pasien Menunggu Pemeriksaan
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Gunakan panel pemeriksaan terintegrasi
                                        untuk proses konsultasi yang lebih
                                        efisien.
                                    </p>
                                </div>
                                <Link
                                    href={route(
                                        "doctor.examination.show",
                                        appointment.id
                                    )}
                                    className="ml-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center text-sm"
                                >
                                    <Activity size={16} className="mr-2" />
                                    Mulai Pemeriksaan
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Appointment Information */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Calendar size={18} className="mr-2 text-blue-600" />
                        Detail Janji Temu
                    </h3>
                </div>
                <div className="p-4">
                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">
                            Keluhan Utama
                        </h5>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-800">
                                {appointment.chief_complaint}
                            </p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">
                            Jadwal Praktik
                        </h5>
                        <div className="p-3 bg-gray-50 rounded-lg flex items-center">
                            <Calendar
                                size={18}
                                className="text-blue-600 mr-2"
                            />
                            <p className="text-gray-800">
                                {appointment.schedule?.day_name || "Hari"},{" "}
                                {appointment.schedule?.formatted_time ||
                                    appointment.appointment_time?.substring(
                                        0,
                                        5
                                    ) + " WIB"}
                            </p>
                        </div>
                    </div>
                    {appointment.notes && (
                        <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-500 mb-2">
                                Catatan
                            </h5>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-800">
                                    {appointment.notes}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="mt-6">
                        <h5 className="text-sm font-medium text-gray-500 mb-2">
                            Informasi Tambahan
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h6 className="text-xs font-medium text-gray-500 mb-1">
                                    Dibuat Pada
                                </h6>
                                <p className="text-sm text-gray-800">
                                    {formatDate(appointment.created_at)}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <h6 className="text-xs font-medium text-gray-500 mb-1">
                                    Dibuat Oleh
                                </h6>
                                <p className="text-sm text-gray-800">
                                    {appointment.created_by?.name || "User"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientInfoTab;
