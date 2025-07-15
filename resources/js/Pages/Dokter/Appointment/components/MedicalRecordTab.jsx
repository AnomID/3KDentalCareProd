// File: MedicalHistoryTab.jsx
import React from "react";
import { Activity } from "lucide-react";
import MedicalHistoryCreate from "./MedicalHistoryCreate";
import MedicalHistoryShowEdit from "./MedicalHistoryShowEdit";

const MedicalHistoryTab = (props) => {
    const { medicalHistory, appointment } = props;

    // Log untuk debugging
    console.log("[MedicalHistoryTab] Props:", {
        medicalHistory,
        hasHistory: Boolean(medicalHistory),
        medicalHistoryData: medicalHistory || "No medical history data",
    });

    // Pengecekan yang lebih ketat untuk memastikan medicalHistory ada dan valid
    const hasMedicalHistory =
        Boolean(medicalHistory) &&
        typeof medicalHistory === "object" &&
        Object.keys(medicalHistory).length > 0;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Activity size={18} className="mr-2 text-blue-600" />
                    Riwayat Medis Pasien
                </h3>
            </div>

            {/* Render komponen berbeda berdasarkan ketersediaan data */}
            {hasMedicalHistory ? (
                <MedicalHistoryShowEdit {...props} />
            ) : (
                <MedicalHistoryCreate {...props} />
            )}
        </div>
    );
};

export default MedicalHistoryTab;
