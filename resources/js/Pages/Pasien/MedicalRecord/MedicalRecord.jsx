// resources/js/Pages/Patient/MedicalRecords.jsx
import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import { format } from "date-fns";
import id from "date-fns/locale/id";

const PatientMedicalRecords = ({ patient, medicalRecords }) => {
    return (
        <AuthorizeLayout>
            <Head title="Rekam Medis Saya" />

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Rekam Medis Saya
                </h2>

                <div className="mb-6">
                    <Link
                        href={route("patient.medical-history")}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        Lihat Riwayat Medis
                    </Link>
                </div>

                {medicalRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">
                                        Nomor RM
                                    </th>
                                    <th className="border px-4 py-2">
                                        Tanggal
                                    </th>
                                    <th className="border px-4 py-2">Dokter</th>
                                    <th className="border px-4 py-2">
                                        Pemeriksaan
                                    </th>
                                    <th className="border px-4 py-2">
                                        Perawatan
                                    </th>
                                    <th className="border px-4 py-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicalRecords.map((record) => (
                                    <tr key={record.id}>
                                        <td className="border px-4 py-2">
                                            {record.formatted_record_number}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {format(
                                                new Date(record.created_at),
                                                "d MMMM yyyy",
                                                { locale: id }
                                            )}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {record.created_by_doctor.name}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {record.odontograms.length > 0 ? (
                                                <span className="text-green-600">
                                                    {record.odontograms.length}{" "}
                                                    odontogram
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {record.treatments.length > 0 ? (
                                                <span className="text-green-600">
                                                    {record.treatments.length}{" "}
                                                    perawatan
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="border px-4 py-2">
                                            <Link
                                                href={route(
                                                    "patient.medical-records.show",
                                                    record.id
                                                )}
                                                className="text-blue-600 hover:text-blue-800"
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
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                        <p>Belum ada rekam medis untuk Anda.</p>
                    </div>
                )}
            </div>
        </AuthorizeLayout>
    );
};

export default PatientMedicalRecords;
