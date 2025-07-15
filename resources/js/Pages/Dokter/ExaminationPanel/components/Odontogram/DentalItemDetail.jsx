import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Activity,
    Stethoscope,
    Calendar,
    FileText,
    Link,
    Zap,
    Clock,
    User,
    MapPin,
    Code,
    Info,
    CheckCircle,
    AlertCircle,
    XCircle,
} from "lucide-react";

const DentalItemDetail = ({ isOpen, onClose, selectedItem }) => {
    // Get item type and basic info
    const itemInfo = useMemo(() => {
        if (!selectedItem) return null;

        const baseInfo = {
            id: selectedItem.id,
            itemType: selectedItem.itemType,
            created_at: selectedItem.created_at,
            updated_at: selectedItem.updated_at,
        };

        switch (selectedItem.itemType) {
            case "condition":
                return {
                    ...baseInfo,
                    title: `Kondisi Gigi ${selectedItem.tooth_number}`,
                    icon: FileText,
                    iconColor: "text-blue-600",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                    details: {
                        "Nomor Gigi": selectedItem.tooth_number,
                        Surface: selectedItem.surface || "Tidak ada",
                        "Kode Kondisi": selectedItem.condition_code,
                        Position: selectedItem.pos || "Tidak ada",
                    },
                };
            case "bridge":
                return {
                    ...baseInfo,
                    title: `Bridge: ${selectedItem.bridge_name}`,
                    icon: Link,
                    iconColor: "text-purple-600",
                    bgColor: "bg-purple-50",
                    borderColor: "border-purple-200",
                    details: {
                        "Nama Bridge": selectedItem.bridge_name,
                        "Tipe Bridge": selectedItem.bridge_type,
                        "Gigi Terhubung":
                            selectedItem.connected_teeth?.join(", ") ||
                            "Tidak ada",
                        "From-To": `${selectedItem.from || "?"} - ${
                            selectedItem.to || "?"
                        }`,
                    },
                };
            case "indicator":
                return {
                    ...baseInfo,
                    title: `Indikator Gigi ${selectedItem.tooth_number}`,
                    icon: Zap,
                    iconColor: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                    details: {
                        "Nomor Gigi": selectedItem.tooth_number,
                        "Tipe Indikator": selectedItem.indicator_type,
                        Position: selectedItem.pos || "Tidak ada",
                    },
                };
            default:
                return null;
        }
    }, [selectedItem]);

    // Get status information
    const statusInfo = useMemo(() => {
        if (!selectedItem) return null;

        let diagnosisStatus, treatmentStatus;

        if (
            selectedItem.itemType === "condition" ||
            selectedItem.itemType === "indicator"
        ) {
            diagnosisStatus = selectedItem.diagnosis_status;
            treatmentStatus = selectedItem.treatment_status;
        } else if (selectedItem.itemType === "bridge") {
            diagnosisStatus = selectedItem.primary_diagnosis
                ? "has_diagnosis"
                : "needs_diagnosis";
            treatmentStatus = selectedItem.treatment
                ? selectedItem.treatment.status === "in_progress"
                    ? "treatment_in_progress"
                    : selectedItem.treatment.status === "completed"
                    ? "treatment_completed"
                    : selectedItem.treatment.status === "planned"
                    ? "needs_treatment"
                    : "needs_treatment"
                : "no_treatment";
        }

        return { diagnosisStatus, treatmentStatus };
    }, [selectedItem]);

    // Format status text and color
    const getStatusInfo = (status) => {
        const statusMap = {
            needs_diagnosis: {
                text: "Perlu Diagnosis",
                color: "bg-orange-100 text-orange-800 border-orange-200",
                icon: AlertCircle,
            },
            no_diagnosis: {
                text: "Tanpa Diagnosis",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: XCircle,
            },
            has_diagnosis: {
                text: "Ada Diagnosis",
                color: "bg-blue-100 text-blue-800 border-blue-200",
                icon: CheckCircle,
            },
            no_treatment: {
                text: "Tanpa Treatment",
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: XCircle,
            },
            needs_treatment: {
                text: "Rencana Perawatan",
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: Calendar,
            },
            treatment_in_progress: {
                text: "Treatment Berlangsung",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
            },
            treatment_completed: {
                text: "Treatment Selesai",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
            },
            treatment_cancelled: {
                text: "Treatment Dibatalkan",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: XCircle,
            },
            planned: {
                text: "Direncanakan",
                color: "bg-blue-100 text-blue-800 border-blue-200",
                icon: Calendar,
            },
            in_progress: {
                text: "Berlangsung",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Clock,
            },
            completed: {
                text: "Selesai",
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
            },
            cancelled: {
                text: "Dibatalkan",
                color: "bg-red-100 text-red-800 border-red-200",
                icon: XCircle,
            },
        };
        return (
            statusMap[status] || {
                text: status,
                color: "bg-gray-100 text-gray-800 border-gray-200",
                icon: Info,
            }
        );
    };

    // Format date
    const formatDate = (dateString, includeTime = true) => {
        if (!dateString) return "Tidak tersedia";
        const date = new Date(dateString);
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        };
        if (includeTime) {
            options.hour = "2-digit";
            options.minute = "2-digit";
        }
        return date.toLocaleDateString("id-ID", options);
    };

    // Helper function to get user name
    const getUserName = (user) => {
        if (!user) return "Unknown";
        if (typeof user === "object") {
            return user.name || user.full_name || `User ID: ${user.id}`;
        }
        return `User ID: ${user}`;
    };

    if (!isOpen || !selectedItem || !itemInfo) {
        return null;
    }

    const ItemIcon = itemInfo.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg ${itemInfo.bgColor} ${itemInfo.borderColor} border`}
                        >
                            <ItemIcon
                                className={`h-6 w-6 ${itemInfo.iconColor}`}
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">
                                {itemInfo.title}
                            </h2>
                            <p className="text-sm text-gray-500 font-normal">
                                ID: {itemInfo.id} • Tipe:{" "}
                                {selectedItem.itemType === "condition"
                                    ? "Kondisi Gigi"
                                    : selectedItem.itemType === "bridge"
                                    ? "Bridge Gigi"
                                    : "Indikator Gigi"}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                        <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                        <TabsTrigger value="treatment">Treatment</TabsTrigger>
                        <TabsTrigger value="history">Riwayat</TabsTrigger>
                    </TabsList>

                    {/* Tab: Informasi Dasar */}
                    <TabsContent value="basic" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <Info className="mr-2 h-5 w-5 text-blue-600" />
                                        Informasi Dasar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(itemInfo.details).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                                            >
                                                <span className="font-medium text-gray-700">
                                                    {key}:
                                                </span>
                                                <span className="text-gray-900 font-semibold">
                                                    {value}
                                                </span>
                                            </div>
                                        )
                                    )}

                                    {/* Additional technical info */}
                                    {selectedItem.geometry_data && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                                                <MapPin className="mr-1 h-4 w-4" />
                                                Geometry Data
                                            </h5>
                                            <pre className="text-xs text-gray-600 overflow-x-auto">
                                                {JSON.stringify(
                                                    selectedItem.geometry_data,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    )}

                                    {/* Bridge specific info */}
                                    {selectedItem.itemType === "bridge" &&
                                        selectedItem.bridge_geometry && (
                                            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                                <h5 className="font-medium text-purple-700 mb-2 flex items-center">
                                                    <Link className="mr-1 h-4 w-4" />
                                                    Bridge Geometry
                                                </h5>
                                                <pre className="text-xs text-purple-600 overflow-x-auto">
                                                    {JSON.stringify(
                                                        selectedItem.bridge_geometry,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>
                                        )}
                                </CardContent>
                            </Card>

                            {/* Status Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <Activity className="mr-2 h-5 w-5 text-green-600" />
                                        Status Saat Ini
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Diagnosis Status */}
                                    <div className="space-y-2">
                                        <h5 className="font-medium text-gray-700">
                                            Status Diagnosis
                                        </h5>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const status = getStatusInfo(
                                                    statusInfo.diagnosisStatus
                                                );
                                                const StatusIcon = status.icon;
                                                return (
                                                    <>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                status.color
                                                            }
                                                        >
                                                            <StatusIcon className="mr-1 h-3 w-3" />
                                                            {status.text}
                                                        </Badge>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Treatment Status */}
                                    <div className="space-y-2">
                                        <h5 className="font-medium text-gray-700">
                                            Status Treatment
                                        </h5>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const status = getStatusInfo(
                                                    statusInfo.treatmentStatus
                                                );
                                                const StatusIcon = status.icon;
                                                return (
                                                    <>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                status.color
                                                            }
                                                        >
                                                            <StatusIcon className="mr-1 h-3 w-3" />
                                                            {status.text}
                                                        </Badge>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                                        <h5 className="font-medium text-gray-700 flex items-center">
                                            <Clock className="mr-1 h-4 w-4" />
                                            Timeline
                                        </h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Dibuat:
                                                </span>
                                                <span className="font-medium">
                                                    {formatDate(
                                                        selectedItem.created_at
                                                    )}
                                                </span>
                                            </div>
                                            {selectedItem.updated_at &&
                                                selectedItem.updated_at !==
                                                    selectedItem.created_at && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            Diperbarui:
                                                        </span>
                                                        <span className="font-medium">
                                                            {formatDate(
                                                                selectedItem.updated_at
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab: Diagnosis */}
                    <TabsContent value="diagnosis" className="space-y-6">
                        {/* Primary Diagnosis */}
                        {selectedItem.primary_diagnosis ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
                                        Diagnosis Primer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* ICD-10 Diagnosis */}
                                        <div className="space-y-4">
                                            <h5 className="font-medium text-blue-800 border-b border-blue-200 pb-2">
                                                Diagnosis Utama (ICD-10)
                                            </h5>
                                            {selectedItem.primary_diagnosis
                                                .icd10_diagnosis ||
                                            selectedItem.primary_diagnosis
                                                .icd10Diagnosis ? (
                                                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Code className="h-4 w-4 text-blue-600" />
                                                        <span className="font-semibold text-blue-800">
                                                            {
                                                                (
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10_diagnosis ||
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10Diagnosis
                                                                )?.code
                                                            }
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-medium text-blue-700 mb-1">
                                                            Deskripsi:
                                                        </h6>
                                                        <p className="text-sm text-blue-800">
                                                            {
                                                                (
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10_diagnosis ||
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10Diagnosis
                                                                )?.description
                                                            }
                                                        </p>
                                                    </div>
                                                    {selectedItem
                                                        .primary_diagnosis
                                                        .diagnosis_notes && (
                                                        <div>
                                                            <h6 className="font-medium text-blue-700 mb-1">
                                                                Catatan
                                                                Diagnosis:
                                                            </h6>
                                                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                                                {
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .diagnosis_notes
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                                                    <XCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p>
                                                        Tidak ada kode ICD-10
                                                        diagnosis
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* External Cause */}
                                        <div className="space-y-4">
                                            <h5 className="font-medium text-orange-800 border-b border-orange-200 pb-2">
                                                Penyebab External (ICD-10)
                                            </h5>
                                            {selectedItem.primary_diagnosis
                                                .icd10_external_cause ||
                                            selectedItem.primary_diagnosis
                                                .icd10ExternalCause ? (
                                                <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Code className="h-4 w-4 text-orange-600" />
                                                        <span className="font-semibold text-orange-800">
                                                            {
                                                                (
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10_external_cause ||
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10ExternalCause
                                                                )?.code
                                                            }
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-medium text-orange-700 mb-1">
                                                            Deskripsi:
                                                        </h6>
                                                        <p className="text-sm text-orange-800">
                                                            {
                                                                (
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10_external_cause ||
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .icd10ExternalCause
                                                                )?.description
                                                            }
                                                        </p>
                                                    </div>
                                                    {selectedItem
                                                        .primary_diagnosis
                                                        .external_cause_notes && (
                                                        <div>
                                                            <h6 className="font-medium text-orange-700 mb-1">
                                                                Catatan
                                                                Penyebab:
                                                            </h6>
                                                            <p className="text-sm text-orange-800 whitespace-pre-wrap">
                                                                {
                                                                    selectedItem
                                                                        .primary_diagnosis
                                                                        .external_cause_notes
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                                                    <XCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p>
                                                        Tidak ada kode external
                                                        cause
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Diagnosis Metadata */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                            <User className="mr-1 h-4 w-4" />
                                            Informasi Diagnosis
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        ID Diagnosis:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            selectedItem
                                                                .primary_diagnosis
                                                                .id
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Tanggal Diagnosis:
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            selectedItem
                                                                .primary_diagnosis
                                                                .diagnosed_at
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Diagnosed By:
                                                    </span>
                                                    <span className="font-medium">
                                                        {getUserName(
                                                            selectedItem
                                                                .primary_diagnosis
                                                                .diagnosed_by_user
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Belum Ada Diagnosis Primer
                                    </h3>
                                    <p className="text-gray-500">
                                        Item ini belum memiliki diagnosis primer
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Secondary Diagnoses */}
                        {selectedItem.secondary_diagnoses &&
                            selectedItem.secondary_diagnoses.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center">
                                            <Stethoscope className="mr-2 h-5 w-5 text-purple-600" />
                                            Diagnosis Sekunder (
                                            {
                                                selectedItem.secondary_diagnoses
                                                    .length
                                            }
                                            )
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {selectedItem.secondary_diagnoses.map(
                                                (diagnosis, index) => (
                                                    <div
                                                        key={diagnosis.id}
                                                        className="bg-purple-50 p-4 rounded-lg border border-purple-200"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-purple-100 text-purple-800 border-purple-300"
                                                            >
                                                                Sekunder #
                                                                {index + 1}
                                                            </Badge>
                                                            <Code className="h-4 w-4 text-purple-600" />
                                                            <span className="font-semibold text-purple-800">
                                                                {(
                                                                    diagnosis.icd10_diagnosis ||
                                                                    diagnosis.icd10Diagnosis
                                                                )?.code ||
                                                                    "Tidak ada kode"}
                                                            </span>
                                                        </div>
                                                        {(
                                                            diagnosis.icd10_diagnosis ||
                                                            diagnosis.icd10Diagnosis
                                                        )?.description && (
                                                            <div className="mb-3">
                                                                <h6 className="font-medium text-purple-700 mb-1">
                                                                    Deskripsi:
                                                                </h6>
                                                                <p className="text-sm text-purple-800">
                                                                    {
                                                                        (
                                                                            diagnosis.icd10_diagnosis ||
                                                                            diagnosis.icd10Diagnosis
                                                                        )
                                                                            .description
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                        {diagnosis.diagnosis_notes && (
                                                            <div className="mb-3">
                                                                <h6 className="font-medium text-purple-700 mb-1">
                                                                    Catatan:
                                                                </h6>
                                                                <p className="text-sm text-purple-800 whitespace-pre-wrap">
                                                                    {
                                                                        diagnosis.diagnosis_notes
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-purple-600 flex justify-between">
                                                            <span>
                                                                ID:{" "}
                                                                {diagnosis.id}
                                                            </span>
                                                            <span>
                                                                Tanggal:{" "}
                                                                {formatDate(
                                                                    diagnosis.diagnosed_at,
                                                                    false
                                                                )}
                                                            </span>
                                                            <span>
                                                                Oleh:{" "}
                                                                {getUserName(
                                                                    diagnosis.diagnosed_by_user
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                    </TabsContent>

                    {/* Tab: Treatment */}
                    <TabsContent value="treatment" className="space-y-6">
                        {/* Active Treatment */}
                        {selectedItem.treatment ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <Activity className="mr-2 h-5 w-5 text-green-600" />
                                        Treatment Aktif
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Treatment Information */}
                                        <div className="space-y-4">
                                            <h5 className="font-medium text-green-800 border-b border-green-200 pb-2">
                                                Informasi Treatment
                                            </h5>
                                            <div className="bg-green-50 p-4 rounded-lg space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-green-800">
                                                        Status:{" "}
                                                        {(() => {
                                                            const status =
                                                                getStatusInfo(
                                                                    selectedItem
                                                                        .treatment
                                                                        .status
                                                                );
                                                            return (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        status.color
                                                                    }
                                                                >
                                                                    {
                                                                        status.text
                                                                    }
                                                                </Badge>
                                                            );
                                                        })()}
                                                    </span>
                                                </div>

                                                {selectedItem.treatment
                                                    .notes && (
                                                    <div>
                                                        <h6 className="font-medium text-green-700 mb-1">
                                                            Catatan Treatment:
                                                        </h6>
                                                        <p className="text-sm text-green-800 whitespace-pre-wrap">
                                                            {
                                                                selectedItem
                                                                    .treatment
                                                                    .notes
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                {/* ICD-9-CM Codes */}
                                                {selectedItem.treatment
                                                    .icd9cm_codes &&
                                                    selectedItem.treatment
                                                        .icd9cm_codes.length >
                                                        0 && (
                                                        <div>
                                                            <h6 className="font-medium text-green-700 mb-2">
                                                                Kode Prosedur
                                                                (ICD-9-CM):
                                                            </h6>
                                                            <div className="space-y-2">
                                                                {selectedItem.treatment.icd9cm_codes.map(
                                                                    (
                                                                        code,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="bg-white p-3 rounded border border-green-200"
                                                                        >
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <Code className="h-4 w-4 text-green-600" />
                                                                                <span className="font-semibold text-green-800">
                                                                                    {
                                                                                        code.code
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-green-700">
                                                                                {
                                                                                    code.description
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="space-y-4">
                                            <h5 className="font-medium text-green-800 border-b border-green-200 pb-2">
                                                Timeline Treatment
                                            </h5>
                                            <div className="bg-green-50 p-4 rounded-lg space-y-4">
                                                {selectedItem.treatment
                                                    .planned_date && (
                                                    <div className="flex items-start gap-3">
                                                        <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                                                        <div>
                                                            <h6 className="font-medium text-blue-700">
                                                                Tanggal Rencana
                                                            </h6>
                                                            <p className="text-sm text-blue-800">
                                                                {formatDate(
                                                                    selectedItem
                                                                        .treatment
                                                                        .planned_date,
                                                                    false
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedItem.treatment
                                                    .started_date && (
                                                    <div className="flex items-start gap-3">
                                                        <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                        <div>
                                                            <h6 className="font-medium text-yellow-700">
                                                                Dimulai
                                                            </h6>
                                                            <p className="text-sm text-yellow-800">
                                                                {formatDate(
                                                                    selectedItem
                                                                        .treatment
                                                                        .started_date
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedItem.treatment
                                                    .completed_date && (
                                                    <div className="flex items-start gap-3">
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                        <div>
                                                            <h6 className="font-medium text-green-700">
                                                                Diselesaikan
                                                            </h6>
                                                            <p className="text-sm text-green-800">
                                                                {formatDate(
                                                                    selectedItem
                                                                        .treatment
                                                                        .completed_date
                                                                )}
                                                            </p>
                                                            {selectedItem
                                                                .treatment
                                                                .completed_by_user && (
                                                                <p className="text-xs text-green-600">
                                                                    oleh:{" "}
                                                                    {getUserName(
                                                                        selectedItem
                                                                            .treatment
                                                                            .completed_by_user
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Treatment Metadata */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                            <Info className="mr-1 h-4 w-4" />
                                            Informasi Treatment
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        ID Treatment:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            selectedItem
                                                                .treatment.id
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Dibuat:
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            selectedItem
                                                                .treatment
                                                                .created_at
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Diperbarui:
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            selectedItem
                                                                .treatment
                                                                .updated_at
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Created By:
                                                    </span>
                                                    <span className="font-medium">
                                                        {getUserName(
                                                            selectedItem
                                                                .treatment
                                                                .created_by_user
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Belum Ada Treatment
                                    </h3>
                                    <p className="text-gray-500">
                                        Item ini belum memiliki treatment aktif
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab: History */}
                    <TabsContent value="history" className="space-y-6">
                        {/* All Treatments History */}
                        {selectedItem.treatments &&
                        selectedItem.treatments.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <Clock className="mr-2 h-5 w-5 text-blue-600" />
                                        Riwayat Semua Treatment (
                                        {selectedItem.treatments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedItem.treatments.map(
                                            (treatment, index) => (
                                                <div
                                                    key={treatment.id}
                                                    className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-100 text-blue-800 border-blue-300"
                                                            >
                                                                Treatment #
                                                                {index + 1}
                                                            </Badge>
                                                            {(() => {
                                                                const status =
                                                                    getStatusInfo(
                                                                        treatment.status
                                                                    );
                                                                const StatusIcon =
                                                                    status.icon;
                                                                return (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            status.color
                                                                        }
                                                                    >
                                                                        <StatusIcon className="mr-1 h-3 w-3" />
                                                                        {
                                                                            status.text
                                                                        }
                                                                    </Badge>
                                                                );
                                                            })()}
                                                        </div>
                                                        <span className="text-xs text-blue-600">
                                                            ID: {treatment.id}
                                                        </span>
                                                    </div>

                                                    {treatment.notes && (
                                                        <div className="mb-3">
                                                            <h6 className="font-medium text-blue-700 mb-1">
                                                                Catatan:
                                                            </h6>
                                                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                                                {
                                                                    treatment.notes
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* ICD-9-CM Codes */}
                                                    {treatment.icd9cm_codes &&
                                                        treatment.icd9cm_codes
                                                            .length > 0 && (
                                                            <div className="mb-3">
                                                                <h6 className="font-medium text-blue-700 mb-2">
                                                                    Kode
                                                                    Prosedur:
                                                                </h6>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {treatment.icd9cm_codes.map(
                                                                        (
                                                                            code,
                                                                            codeIndex
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    codeIndex
                                                                                }
                                                                                className="bg-white p-2 rounded border border-blue-200 text-sm"
                                                                            >
                                                                                <div className="font-semibold text-blue-800">
                                                                                    {
                                                                                        code.code
                                                                                    }
                                                                                </div>
                                                                                <div className="text-blue-700">
                                                                                    {
                                                                                        code.description
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-600">
                                                        <div>
                                                            <strong>
                                                                Dibuat:
                                                            </strong>
                                                            <br />
                                                            {formatDate(
                                                                treatment.created_at
                                                            )}
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                Diperbarui:
                                                            </strong>
                                                            <br />
                                                            {formatDate(
                                                                treatment.updated_at
                                                            )}
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                Created By:
                                                            </strong>
                                                            <br />
                                                            {getUserName(
                                                                treatment.created_by_user
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Belum Ada Riwayat Treatment
                                    </h3>
                                    <p className="text-gray-500">
                                        Item ini belum memiliki riwayat
                                        treatment
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Creation and Update Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Info className="mr-2 h-5 w-5 text-gray-600" />
                                    Informasi Sistem
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h6 className="font-medium text-gray-700 mb-2">
                                                Pembuatan Item
                                            </h6>
                                            <div className="text-sm space-y-1">
                                                <div>
                                                    <strong>Tanggal:</strong>{" "}
                                                    {formatDate(
                                                        selectedItem.created_at
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>Item ID:</strong>{" "}
                                                    {selectedItem.id}
                                                </div>
                                                <div>
                                                    <strong>Tipe:</strong>{" "}
                                                    {selectedItem.itemType}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h6 className="font-medium text-gray-700 mb-2">
                                                Pembaruan Terakhir
                                            </h6>
                                            <div className="text-sm space-y-1">
                                                <div>
                                                    <strong>Tanggal:</strong>{" "}
                                                    {formatDate(
                                                        selectedItem.updated_at
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>
                                                        Status Diagnosis:
                                                    </strong>{" "}
                                                    {statusInfo.diagnosisStatus}
                                                </div>
                                                <div>
                                                    <strong>
                                                        Status Treatment:
                                                    </strong>{" "}
                                                    {statusInfo.treatmentStatus}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default DentalItemDetail;
