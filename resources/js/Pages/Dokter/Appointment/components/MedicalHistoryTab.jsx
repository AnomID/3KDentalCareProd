import React, { useEffect } from "react";
import { Activity } from "lucide-react";
import MedicalHistoryCreate from "./MedicalHistoryCreate";
import MedicalHistoryShowEdit from "./MedicalHistoryShowEdit";

const MedicalHistoryTab = (props) => {
    const { medicalHistory, appointment } = props;

    // Detailed logging untuk debugging
    useEffect(() => {
        console.log("[MedicalHistoryTab] Component mounted with props:", {
            medicalHistory,
            medicalHistoryExists: Boolean(medicalHistory),
            medicalHistoryId: medicalHistory?.id,
            medicalHistoryType: typeof medicalHistory,
            historyDataExists: Boolean(props.historyData),
            appointment,
            allProps: props,
        });
    }, [medicalHistory, appointment, props]);

    // Pengecekan yang tepat dengan multiple kondisi
    const hasMedicalHistory =
        Boolean(medicalHistory) &&
        typeof medicalHistory === "object" &&
        Object.keys(medicalHistory).length > 0 &&
        medicalHistory.id != null;

    // Debug logging untuk keputusan render
    console.log(
        "[MedicalHistoryTab] Rendering decision:",
        hasMedicalHistory ? "EDIT MODE" : "CREATE MODE",
        "hasMedicalHistory =",
        hasMedicalHistory,
        "medicalHistory =",
        medicalHistory
    );

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
