// File: MedicalHistoryCreate.jsx
import React from "react";
import { Link, router } from "@inertiajs/react";
import { Activity, Heart, AlertTriangle, Info } from "lucide-react";
import ConditionField from "./ConditionField";

const MedicalHistoryCreate = ({
    appointment,
    bloodTypes,
    historyData,
    handleHistoryChange,
    handleHistorySubmit,
}) => {
    console.log("[MedicalHistoryCreate] Rendering with data:", {
        historyData,
        appointment,
    });

    // Handler untuk submit form yang mengarahkan ke doctor.examination.show setelah save
    const onSubmit = (e) => {
        e.preventDefault();

        if (typeof handleHistorySubmit === "function") {
            // Memanggil handler submit yang sudah ada
            const result = handleHistorySubmit(e);

            // Setelah submit selesai, redirect ke halaman examination
            if (result instanceof Promise) {
                // Jika handleHistorySubmit mengembalikan Promise
                result.then(() => {
                    window.location.href = route(
                        "doctor.examination.show",
                        appointment.id
                    );
                });
            } else {
                // Jika tidak mengembalikan Promise, redirect langsung
                window.location.href = route(
                    "doctor.examination.show",
                    appointment.id
                );
            }
        } else {
            // Jika tidak ada handler submit, implementasi fallback
            const formattedData = {
                ...historyData,
                has_heart_disease: Boolean(historyData.has_heart_disease),
                has_diabetes: Boolean(historyData.has_diabetes),
                has_hemophilia: Boolean(historyData.has_hemophilia),
                has_hepatitis: Boolean(historyData.has_hepatitis),
                has_gastritis: Boolean(historyData.has_gastritis),
                has_other_disease: Boolean(historyData.has_other_disease),
                has_drug_allergy: Boolean(historyData.has_drug_allergy),
                has_food_allergy: Boolean(historyData.has_food_allergy),
            };

            router.post(
                route("medical-history.saveOrUpdate", appointment.patient_id),
                formattedData,
                {
                    onSuccess: () => {
                        window.location.href = route(
                            "doctor.examination.show",
                            appointment.id
                        );
                    },
                    onError: (errors) => {
                        console.error("Form submission errors:", errors);
                        alert("Error saving data. Please try again.");
                    },
                }
            );
        }
    };

    return (
        <div className="p-6">
            {/* Header informasi */}
            <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-800">
                    Buat Riwayat Medis Baru
                </h4>
                <p className="text-sm text-gray-500">
                    Pasien belum memiliki riwayat medis. Silakan isi formulir di
                    bawah ini.
                </p>
            </div>

            {/* Banner panel pemeriksaan terintegrasi */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                    <Info size={24} className="text-blue-600 mr-4 mt-1" />
                    <div>
                        <h4 className="text-md font-semibold text-blue-800 mb-2">
                            Panel Pemeriksaan Terintegrasi Tersedia
                        </h4>
                        <p className="text-blue-700 text-sm mb-4">
                            Gunakan panel pemeriksaan terintegrasi untuk
                            memproses konsultasi pasien lebih efisien dengan
                            semua tahapan pemeriksaan dalam satu tampilan.
                        </p>
                        <Link
                            href={route(
                                "doctor.examination.show",
                                appointment.id
                            )}
                            className="inline-flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
                        >
                            <Activity size={18} className="mr-2" />
                            Gunakan Panel Pemeriksaan Terintegrasi
                        </Link>
                    </div>
                </div>
            </div>

            {/* Form input riwayat medis */}
            <form onSubmit={onSubmit}>
                {/* Bagian Informasi Dasar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Golongan Darah
                        </label>
                        <select
                            name="blood_type"
                            value={historyData.blood_type || ""}
                            onChange={handleHistoryChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Pilih golongan darah</option>
                            {bloodTypes &&
                                bloodTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tekanan Darah
                        </label>
                        <input
                            type="text"
                            name="blood_pressure"
                            value={historyData.blood_pressure || ""}
                            onChange={handleHistoryChange}
                            placeholder="contoh: 120/80"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Tekanan Darah
                        </label>
                        <select
                            name="blood_pressure_status"
                            value={
                                historyData.blood_pressure_status || "normal"
                            }
                            onChange={handleHistoryChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="normal">Normal</option>
                            <option value="hypertension">Hipertensi</option>
                            <option value="hypotension">Hipotensi</option>
                        </select>
                    </div>
                </div>

                {/* Bagian Riwayat Penyakit */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <Heart size={18} className="mr-2 text-red-500" />
                        Riwayat Penyakit
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <ConditionField
                                    label="Penyakit Jantung"
                                    fieldName="heart_disease"
                                    checked={historyData.has_heart_disease}
                                    note={historyData.heart_disease_note}
                                    onChange={handleHistoryChange}
                                    icon={<Heart className="text-red-500" />}
                                />
                                <ConditionField
                                    label="Diabetes"
                                    fieldName="diabetes"
                                    checked={historyData.has_diabetes}
                                    note={historyData.diabetes_note}
                                    onChange={handleHistoryChange}
                                />
                                <ConditionField
                                    label="Hemofilia"
                                    fieldName="hemophilia"
                                    checked={historyData.has_hemophilia}
                                    note={historyData.hemophilia_note}
                                    onChange={handleHistoryChange}
                                />
                            </div>
                            <div>
                                <ConditionField
                                    label="Hepatitis"
                                    fieldName="hepatitis"
                                    checked={historyData.has_hepatitis}
                                    note={historyData.hepatitis_note}
                                    onChange={handleHistoryChange}
                                />
                                <ConditionField
                                    label="Gastritis"
                                    fieldName="gastritis"
                                    checked={historyData.has_gastritis}
                                    note={historyData.gastritis_note}
                                    onChange={handleHistoryChange}
                                />
                                <ConditionField
                                    label="Penyakit Lainnya"
                                    fieldName="other_disease"
                                    checked={historyData.has_other_disease}
                                    note={historyData.other_disease_note}
                                    onChange={handleHistoryChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian Riwayat Alergi */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <AlertTriangle
                            size={18}
                            className="mr-2 text-amber-500"
                        />
                        Riwayat Alergi
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <ConditionField
                                    label="Alergi Obat"
                                    fieldName="drug_allergy"
                                    checked={historyData.has_drug_allergy}
                                    note={historyData.drug_allergy_note}
                                    onChange={handleHistoryChange}
                                />
                            </div>
                            <div>
                                <ConditionField
                                    label="Alergi Makanan"
                                    fieldName="food_allergy"
                                    checked={historyData.has_food_allergy}
                                    note={historyData.food_allergy_note}
                                    onChange={handleHistoryChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian Tombol */}
                <div className="flex justify-end">
                    <div className="flex space-x-3">
                        <Link
                            href={route(
                                "doctor.examination.show",
                                appointment.id
                            )}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
                        >
                            <Activity size={18} className="mr-2" />
                            Panel Pemeriksaan
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                        >
                            Simpan & Lanjutkan
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MedicalHistoryCreate;
