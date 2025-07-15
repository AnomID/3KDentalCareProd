// resources/js/Pages/Patient/MedicalHistory.jsx
import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

const PatientMedicalHistory = ({ patient, medicalHistory }) => {
    return (
        <AuthorizeLayout>
            <Head title="Riwayat Medis Saya" />

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Riwayat Medis Saya
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route("patient.medical-records")}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            Informasi Umum
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Golongan Darah
                                </p>
                                <p className="font-medium">
                                    {medicalHistory.blood_type ||
                                        "Tidak Diketahui"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Tekanan Darah
                                </p>
                                <p className="font-medium">
                                    {medicalHistory.blood_pressure ||
                                        "Tidak Diketahui"}
                                    {medicalHistory.blood_pressure_status && (
                                        <span
                                            className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                medicalHistory.blood_pressure_status ===
                                                "normal"
                                                    ? "bg-green-200 text-green-800"
                                                    : medicalHistory.blood_pressure_status ===
                                                      "hypertension"
                                                    ? "bg-red-200 text-red-800"
                                                    : "bg-blue-200 text-blue-800"
                                            }`}
                                        >
                                            {
                                                medicalHistory.formatted_blood_pressure_status
                                            }
                                        </span>
                                    )}
                                </p>
                            </div>
                            // resources/js/Pages/Patient/MedicalHistory.jsx
                            (continued)
                            <div>
                                <p className="text-sm text-gray-500">
                                    Terakhir diperbarui oleh
                                </p>
                                <p className="font-medium">
                                    {medicalHistory.updated_by_doctor
                                        ? medicalHistory.updated_by_doctor.name
                                        : "Tidak Diketahui"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            Penyakit
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            medicalHistory.has_heart_disease
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    ></span>
                                    <p className="font-medium">
                                        Penyakit Jantung
                                    </p>
                                </div>
                                {medicalHistory.has_heart_disease &&
                                    medicalHistory.heart_disease_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.heart_disease_note}
                                        </p>
                                    )}
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            medicalHistory.has_diabetes
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    ></span>
                                    <p className="font-medium">Diabetes</p>
                                </div>
                                {medicalHistory.has_diabetes &&
                                    medicalHistory.diabetes_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.diabetes_note}
                                        </p>
                                    )}
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            medicalHistory.has_hemophilia
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    ></span>
                                    <p className="font-medium">Hemofilia</p>
                                </div>
                                {medicalHistory.has_hemophilia &&
                                    medicalHistory.hemophilia_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.hemophilia_note}
                                        </p>
                                    )}
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            medicalHistory.has_hepatitis
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    ></span>
                                    <p className="font-medium">Hepatitis</p>
                                </div>
                                {medicalHistory.has_hepatitis &&
                                    medicalHistory.hepatitis_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.hepatitis_note}
                                        </p>
                                    )}
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            medicalHistory.has_gastritis
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    ></span>
                                    <p className="font-medium">Gastritis</p>
                                </div>
                                {medicalHistory.has_gastritis &&
                                    medicalHistory.gastritis_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.gastritis_note}
                                        </p>
                                    )}
                            </div>

                            {medicalHistory.has_other_disease && (
                                <div>
                                    <div className="flex items-center">
                                        <span className="inline-block w-3 h-3 rounded-full mr-2 bg-red-500"></span>
                                        <p className="font-medium">
                                            Penyakit Lainnya
                                        </p>
                                    </div>
                                    {medicalHistory.other_disease_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.other_disease_note}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            Alergi
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            medicalHistory.has_drug_allergy
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    ></span>
                                    <p className="font-medium">Alergi Obat</p>
                                </div>
                                {medicalHistory.has_drug_allergy &&
                                    medicalHistory.drug_allergy_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.drug_allergy_note}
                                        </p>
                                    )}
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            medicalHistory.has_food_allergy
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    ></span>
                                    <p className="font-medium">
                                        Alergi Makanan
                                    </p>
                                </div>
                                {medicalHistory.has_food_allergy &&
                                    medicalHistory.food_allergy_note && (
                                        <p className="text-sm text-gray-700 mt-1 ml-5">
                                            {medicalHistory.food_allergy_note}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-blue-700">
                        Informasi ini penting untuk perawatan gigi Anda. Jika
                        ada perubahan pada riwayat medis Anda, mohon
                        informasikan kepada dokter gigi saat kunjungan
                        berikutnya.
                    </p>
                </div>
            </div>
        </AuthorizeLayout>
    );
};

export default PatientMedicalHistory;
