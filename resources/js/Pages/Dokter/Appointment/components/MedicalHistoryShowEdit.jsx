// File: MedicalHistoryShowEdit.jsx
import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Activity, Heart, AlertTriangle, Info, Edit } from "lucide-react";
import { formatDate } from "../utils/dateFormatters";
import ConditionField from "./ConditionField";

const MedicalHistoryShowEdit = ({
    appointment,
    medicalHistory,
    bloodTypes,
    historyData,
    handleHistoryChange,
    handleHistorySubmit,
}) => {
    // State untuk mode edit/view
    const [isEditing, setIsEditing] = useState(false);

    console.log("[MedicalHistoryShowEdit] Rendering with data:", {
        medicalHistory,
        historyData,
        isEditing,
    });

    // Handler untuk toggle mode edit/view
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    // Handler untuk submit form
    const onSubmit = (e) => {
        e.preventDefault();

        if (typeof handleHistorySubmit === "function") {
            // Memanggil handler submit yang sudah ada
            const result = handleHistorySubmit(e);

            // Setelah submit selesai, redirect ke halaman examination
            if (result instanceof Promise) {
                // Jika handleHistorySubmit mengembalikan Promise
                result.then(() => {
                    setIsEditing(false);
                    window.location.href = route(
                        "doctor.examination.show",
                        appointment.id
                    );
                });
            } else {
                // Jika tidak mengembalikan Promise, redirect langsung
                setIsEditing(false);
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
                        setIsEditing(false);
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

    // Helper function untuk menampilkan informasi kondisi medis
    const ConditionDisplay = ({ label, hasCondition, note }) => (
        <div className="mb-4">
            <div className="flex items-center">
                <div
                    className={`w-5 h-5 rounded-full mr-2 ${
                        hasCondition ? "bg-red-100" : "bg-green-100"
                    } flex items-center justify-center`}
                >
                    <span
                        className={`text-xs font-bold ${
                            hasCondition ? "text-red-600" : "text-green-600"
                        }`}
                    >
                        {hasCondition ? "✓" : "✗"}
                    </span>
                </div>
                <span className="font-medium">
                    {label}:{" "}
                    <span
                        className={
                            hasCondition ? "text-red-600" : "text-green-600"
                        }
                    >
                        {hasCondition ? "Ya" : "Tidak"}
                    </span>
                </span>
            </div>
            {hasCondition && note && (
                <div className="ml-7 mt-1 text-gray-600 text-sm">{note}</div>
            )}
        </div>
    );

    // Helper untuk warna status tekanan darah
    const getBpStatusColor = (status) => {
        switch (status) {
            case "hypertension":
                return "text-red-600";
            case "hypotension":
                return "text-yellow-600";
            default:
                return "text-green-600";
        }
    };

    return (
        <div className="p-6">
            {/* Header informasi */}
            <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-gray-800">
                        {isEditing
                            ? "Edit Riwayat Medis"
                            : "Informasi Riwayat Medis"}
                    </h4>
                    <div className="flex items-center">
                        <p className="text-sm text-gray-500 mr-4">
                            Terakhir diperbarui:{" "}
                            {formatDate(medicalHistory.updated_at)}
                        </p>
                        {!isEditing && (
                            <button
                                onClick={toggleEditMode}
                                className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                                <Edit size={16} className="mr-1" />
                                Edit
                            </button>
                        )}
                    </div>
                </div>
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

            {/* Conditional rendering berdasarkan mode */}
            {isEditing ? (
                // Form Edit
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
                                    historyData.blood_pressure_status ||
                                    "normal"
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
                                        icon={
                                            <Heart className="text-red-500" />
                                        }
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
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                        >
                            Batal
                        </button>
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
                                Perbarui & Lanjutkan
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                // View Mode
                <div>
                    {/* Bagian Informasi Dasar */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            Informasi Dasar
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Golongan Darah
                                </p>
                                <p className="font-medium text-gray-800">
                                    {medicalHistory.blood_type ||
                                        "Tidak Diketahui"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Tekanan Darah
                                </p>
                                <p className="font-medium text-gray-800">
                                    {medicalHistory.blood_pressure ||
                                        "Tidak Diketahui"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Status Tekanan Darah
                                </p>
                                <p
                                    className={`font-medium ${getBpStatusColor(
                                        medicalHistory.blood_pressure_status
                                    )}`}
                                >
                                    {medicalHistory.blood_pressure_status ===
                                    "normal"
                                        ? "Normal"
                                        : medicalHistory.blood_pressure_status ===
                                          "hypertension"
                                        ? "Hipertensi"
                                        : medicalHistory.blood_pressure_status ===
                                          "hypotension"
                                        ? "Hipotensi"
                                        : "Tidak Diketahui"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Riwayat Penyakit */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                            <Heart size={18} className="mr-2 text-red-500" />
                            Riwayat Penyakit
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <ConditionDisplay
                                    label="Penyakit Jantung"
                                    hasCondition={
                                        medicalHistory.has_heart_disease
                                    }
                                    note={medicalHistory.heart_disease_note}
                                />
                                <ConditionDisplay
                                    label="Diabetes"
                                    hasCondition={medicalHistory.has_diabetes}
                                    note={medicalHistory.diabetes_note}
                                />
                                <ConditionDisplay
                                    label="Hemofilia"
                                    hasCondition={medicalHistory.has_hemophilia}
                                    note={medicalHistory.hemophilia_note}
                                />
                            </div>
                            <div>
                                <ConditionDisplay
                                    label="Hepatitis"
                                    hasCondition={medicalHistory.has_hepatitis}
                                    note={medicalHistory.hepatitis_note}
                                />
                                <ConditionDisplay
                                    label="Gastritis"
                                    hasCondition={medicalHistory.has_gastritis}
                                    note={medicalHistory.gastritis_note}
                                />
                                <ConditionDisplay
                                    label="Penyakit Lainnya"
                                    hasCondition={
                                        medicalHistory.has_other_disease
                                    }
                                    note={medicalHistory.other_disease_note}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bagian Riwayat Alergi */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                            <AlertTriangle
                                size={18}
                                className="mr-2 text-amber-500"
                            />
                            Riwayat Alergi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <ConditionDisplay
                                    label="Alergi Obat"
                                    hasCondition={
                                        medicalHistory.has_drug_allergy
                                    }
                                    note={medicalHistory.drug_allergy_note}
                                />
                            </div>
                            <div>
                                <ConditionDisplay
                                    label="Alergi Makanan"
                                    hasCondition={
                                        medicalHistory.has_food_allergy
                                    }
                                    note={medicalHistory.food_allergy_note}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bagian Tombol */}
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={toggleEditMode}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center"
                        >
                            <Edit size={18} className="mr-2" />
                            Edit Riwayat Medis
                        </button>
                        <Link
                            href={route(
                                "doctor.examination.show",
                                appointment.id
                            )}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                        >
                            Lanjutkan ke Panel Pemeriksaan
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalHistoryShowEdit;
