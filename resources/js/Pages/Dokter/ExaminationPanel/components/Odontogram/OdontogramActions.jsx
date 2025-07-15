// resources/js/Pages/Dokter/ExaminationPanel/components/Odontogram/OdontogramActions.jsx
import React from "react";
import { Button } from "@/Components/ui/button";
import { Save, ArrowLeft, ArrowRight, FileCheck, Trash2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { toast } from "react-hot-toast";

const OdontogramActions = ({
    onSave,
    onBack,
    onNext,
    canEdit,
    isLoading,
    data,
    patient,
    currentUser,
    odontogram,
}) => {
    const handleFinalize = () => {
        if (!odontogram?.id || !canEdit) {
            toast.error(
                "Anda tidak memiliki izin untuk memfinalisasi odontogram ini"
            );
            return;
        }

        if (
            window.confirm(
                "Apakah Anda yakin ingin memfinalisasi odontogram ini? Setelah difinalisasi, odontogram tidak dapat diedit lagi."
            )
        ) {
            router.post(
                route("odontogram.finalize", odontogram.id),
                {},
                {
                    onSuccess: () => {
                        toast.success("Odontogram berhasil difinalisasi");
                    },
                    onError: () => {
                        toast.error("Gagal memfinalisasi odontogram");
                    },
                    preserveScroll: true,
                }
            );
        }
    };

    const handleUnfinalize = () => {
        if (!odontogram?.id) {
            toast.error("Odontogram tidak ditemukan");
            return;
        }

        // Only employees/admins can unfinalize
        if (currentUser?.role !== "employee" && currentUser?.role !== "admin") {
            toast.error(
                "Hanya admin yang dapat membatalkan finalisasi odontogram"
            );
            return;
        }

        if (
            window.confirm(
                "Apakah Anda yakin ingin membatalkan finalisasi odontogram ini?"
            )
        ) {
            router.post(
                route("odontogram.unfinalize", odontogram.id),
                {},
                {
                    onSuccess: () => {
                        toast.success(
                            "Finalisasi odontogram berhasil dibatalkan"
                        );
                    },
                    onError: () => {
                        toast.error("Gagal membatalkan finalisasi odontogram");
                    },
                    preserveScroll: true,
                }
            );
        }
    };

    const handleReset = () => {
        if (!odontogram?.id || !canEdit) {
            toast.error(
                "Anda tidak memiliki izin untuk mereset odontogram ini"
            );
            return;
        }

        if (
            window.confirm(
                "Apakah Anda yakin ingin mereset odontogram ini? Semua data akan dihapus dan tidak dapat dikembalikan."
            )
        ) {
            router.post(
                route("odontogram.reset", odontogram.id),
                {},
                {
                    onSuccess: () => {
                        toast.success("Odontogram berhasil direset");
                    },
                    onError: () => {
                        toast.error("Gagal mereset odontogram");
                    },
                    preserveScroll: true,
                }
            );
        }
    };

    // Count total items for summary
    const totalConditions = data?.conditions?.length || 0;
    const totalBridges = data?.bridges?.length || 0;
    const totalIndicators = data?.indicators?.length || 0;
    const totalItems = totalConditions + totalBridges + totalIndicators;

    return (
        <div className="space-y-4">
            {/* Summary Info */}
            <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">
                    Ringkasan Odontogram
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Pasien:</span>
                        <p className="font-medium">
                            {patient?.name || "Tidak diketahui"}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">Kondisi Gigi:</span>
                        <p className="font-medium">{totalConditions}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Bridge:</span>
                        <p className="font-medium">{totalBridges}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Indikator:</span>
                        <p className="font-medium">{totalIndicators}</p>
                    </div>
                </div>

                {/* Status Info */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-gray-600">Status:</span>
                            <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    odontogram?.is_finalized
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                                {odontogram?.is_finalized
                                    ? "Difinalisasi"
                                    : "Draft"}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Mode:</span>
                            <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    canEdit
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {canEdit ? "Edit" : "View Only"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Primary Actions */}
                <div className="flex flex-wrap gap-2 flex-1">
                    {/* Save Button - Only for doctors */}
                    {canEdit && (
                        <Button
                            onClick={onSave}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <Save size={16} />
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    )}

                    {/* Finalize Button - Only for doctors and not finalized */}
                    {canEdit && !odontogram?.is_finalized && totalItems > 0 && (
                        <Button
                            onClick={handleFinalize}
                            disabled={isLoading}
                            variant="outline"
                            className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                        >
                            <FileCheck size={16} />
                            Finalisasi
                        </Button>
                    )}

                    {/* Unfinalize Button - Only for employees/admins and finalized */}
                    {(currentUser?.role === "employee" ||
                        currentUser?.role === "admin") &&
                        odontogram?.is_finalized && (
                            <Button
                                onClick={handleUnfinalize}
                                disabled={isLoading}
                                variant="outline"
                                className="flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                                <FileCheck size={16} />
                                Batal Finalisasi
                            </Button>
                        )}

                    {/* Reset Button - Only for doctors and not finalized */}
                    {canEdit && !odontogram?.is_finalized && totalItems > 0 && (
                        <Button
                            onClick={handleReset}
                            disabled={isLoading}
                            variant="outline"
                            className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                        >
                            <Trash2 size={16} />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                    {onBack && (
                        <Button
                            onClick={onBack}
                            variant="outline"
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Kembali
                        </Button>
                    )}

                    {onNext && (
                        <Button
                            onClick={onNext}
                            variant="outline"
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            Lanjut
                            <ArrowRight size={16} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Role-based Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
                {currentUser?.role === "doctor" && (
                    <>
                        <p>• Simpan perubahan secara berkala</p>
                        <p>
                            • Finalisasi odontogram jika pemeriksaan sudah
                            selesai
                        </p>
                        {odontogram?.is_finalized && (
                            <p>
                                • Odontogram yang sudah difinalisasi tidak dapat
                                diedit
                            </p>
                        )}
                    </>
                )}

                {currentUser?.role === "patient" && (
                    <p>• Anda dapat melihat odontogram hasil pemeriksaan</p>
                )}

                {currentUser?.role === "employee" && (
                    <>
                        <p>• Anda dapat melihat odontogram pasien</p>
                        <p>
                            • Admin dapat membatalkan finalisasi jika diperlukan
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OdontogramActions;
