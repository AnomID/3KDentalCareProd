import React from "react";
import { Heart, AlertTriangle, Activity } from "lucide-react";
// import { formatDate } from "@/Utils/dateFormatters";

export default function MedicalHistoryView({ patient, medicalHistory }) {
    // Helper to display status with color
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

    // Helper to display condition with icon and status
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

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Informasi Dasar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-500">Golongan Darah</p>
                        <p className="font-medium text-gray-800">
                            {medicalHistory.blood_type || "Tidak Diketahui"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tekanan Darah</p>
                        <p className="font-medium text-gray-800">
                            {medicalHistory.blood_pressure || "Tidak Diketahui"}
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
                            {medicalHistory.blood_pressure_status === "normal"
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

            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Heart size={18} className="mr-2 text-red-500" />
                    Riwayat Penyakit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <ConditionDisplay
                            label="Penyakit Jantung"
                            hasCondition={medicalHistory.has_heart_disease}
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
                            hasCondition={medicalHistory.has_other_disease}
                            note={medicalHistory.other_disease_note}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <AlertTriangle size={18} className="mr-2 text-amber-500" />
                    Riwayat Alergi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <ConditionDisplay
                            label="Alergi Obat"
                            hasCondition={medicalHistory.has_drug_allergy}
                            note={medicalHistory.drug_allergy_note}
                        />
                    </div>
                    <div>
                        <ConditionDisplay
                            label="Alergi Makanan"
                            hasCondition={medicalHistory.has_food_allergy}
                            note={medicalHistory.food_allergy_note}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>
                    Terakhir diperbarui oleh{" "}
                    {medicalHistory.updated_by_doctor?.name || "Unknown"} pada{" "}
                    {formatDate(medicalHistory.updated_at)}
                </p>
            </div>
        </div>
    );
}
