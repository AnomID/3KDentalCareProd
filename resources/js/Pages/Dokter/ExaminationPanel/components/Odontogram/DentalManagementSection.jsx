import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Activity,
    Stethoscope,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    X,
    Ban,
    Zap,
    Link,
    Edit,
    Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { router } from "@inertiajs/react";

// Import the forms and detail component
import DentalDiagnosisForm from "./DentalDiagnosisForm";
import DentalTreatmentForm from "./DentalTreatmentForm";
import DentalItemDetail from "./DentalItemDetail";

const DentalManagementSection = ({
    odontogramData,
    canEdit = true,
    onDataUpdate,
}) => {
    const [activeTab, setActiveTab] = useState("all-items");
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState(null);
    const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
    const [showTreatmentForm, setShowTreatmentForm] = useState(false);
    const [showItemDetails, setShowItemDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get items from odontogram data with useMemo to prevent recalculation
    const conditions = useMemo(
        () => odontogramData?.conditions || [],
        [odontogramData?.conditions]
    );
    const bridges = useMemo(
        () => odontogramData?.bridges || [],
        [odontogramData?.bridges]
    );
    const indicators = useMemo(
        () => odontogramData?.indicators || [],
        [odontogramData?.indicators]
    );

    // Combine all items for unified management with useMemo
    const allItems = useMemo(
        () => [
            ...conditions.map((c) => ({ ...c, itemType: "condition" })),
            ...bridges.map((b) => ({ ...b, itemType: "bridge" })),
            ...indicators.map((i) => ({ ...i, itemType: "indicator" })),
        ],
        [conditions, bridges, indicators]
    );

    // Filter items by status with useMemo to prevent recalculation
    const itemsNeedingChoice = useMemo(
        () =>
            allItems.filter((item) => {
                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    return item.diagnosis_status === "needs_diagnosis";
                } else if (item.itemType === "bridge") {
                    return !item.primary_diagnosis;
                }
                return false;
            }),
        [allItems]
    );

    const itemsWithDiagnosis = useMemo(
        () =>
            allItems.filter((item) => {
                let hasDiagnosis = false;
                let hasTreatment = false;

                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    hasDiagnosis = item.diagnosis_status === "has_diagnosis";
                    hasTreatment = item.treatment_status !== "no_treatment";
                } else if (item.itemType === "bridge") {
                    hasDiagnosis = !!item.primary_diagnosis;
                    hasTreatment = !!item.treatment;
                }

                return hasDiagnosis && !hasTreatment;
            }),
        [allItems]
    );

    const itemsWithoutDiagnosis = useMemo(
        () =>
            allItems.filter((item) => {
                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    return item.diagnosis_status === "no_diagnosis";
                }
                return false;
            }),
        [allItems]
    );

    const itemsNeedingTreatment = useMemo(
        () =>
            allItems.filter((item) => {
                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    return item.treatment_status === "needs_treatment";
                } else if (item.itemType === "bridge") {
                    const hasDiagnosis = !!item.primary_diagnosis;
                    const hasActiveTreatment =
                        item.treatment && item.treatment.status !== "cancelled";
                    return hasDiagnosis && !hasActiveTreatment;
                }
                return false;
            }),
        [allItems]
    );

    const itemsWithPlannedTreatment = useMemo(
        () =>
            allItems.filter((item) => {
                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    return (
                        item.treatment_status === "needs_treatment" &&
                        item.treatment &&
                        item.treatment.status === "planned"
                    );
                } else if (item.itemType === "bridge") {
                    return (
                        item.treatment && item.treatment.status === "planned"
                    );
                }
                return false;
            }),
        [allItems]
    );

    const itemsWithTreatmentInProgress = useMemo(
        () =>
            allItems.filter((item) => {
                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    return item.treatment_status === "treatment_in_progress";
                } else if (item.itemType === "bridge") {
                    return (
                        item.treatment &&
                        item.treatment.status === "in_progress"
                    );
                }
                return false;
            }),
        [allItems]
    );

    const itemsWithTreatmentCompleted = useMemo(
        () =>
            allItems.filter((item) => {
                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    return item.treatment_status === "treatment_completed";
                } else if (item.itemType === "bridge") {
                    return (
                        item.treatment && item.treatment.status === "completed"
                    );
                }
                return false;
            }),
        [allItems]
    );

    // Handle opening diagnosis form with useCallback
    const handleOpenDiagnosis = useCallback((item) => {
        setSelectedItem(item);
        setSelectedItemType(item.itemType);
        setShowDiagnosisForm(true);
    }, []);

    // Handle opening treatment form with useCallback
    const handleOpenTreatment = useCallback((item, isEdit = false) => {
        setSelectedItem(item);
        setSelectedItemType(item.itemType);
        setShowTreatmentForm(true);
    }, []);

    // Handle start treatment with useCallback
    const handleStartTreatment = useCallback(
        async (item) => {
            if (!canEdit) return;

            setIsLoading(true);
            try {
                let existingTreatment = null;
                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    existingTreatment = item.treatment;
                } else if (item.itemType === "bridge") {
                    existingTreatment = item.treatment;
                }

                if (!existingTreatment) {
                    toast.error("Treatment tidak ditemukan");
                    return;
                }

                const payload = {
                    icd_9cm_codes_ids:
                        existingTreatment.icd9cm_codes?.map(
                            (code) => code.id
                        ) || [],
                    notes: existingTreatment.notes,
                    status: "in_progress",
                    planned_date: existingTreatment.planned_date,
                };

                router.put(
                    route("tooth-treatments.update", {
                        toothTreatment: existingTreatment.id,
                    }),
                    payload,
                    {
                        onSuccess: () => {
                            toast.success("Treatment berhasil dimulai");
                            if (onDataUpdate) {
                                onDataUpdate();
                            }
                        },
                        onError: (errors) => {
                            console.error("Error starting treatment:", errors);
                            toast.error("Gagal memulai treatment");
                        },
                    }
                );
            } catch (error) {
                console.error("Error:", error);
                toast.error("Terjadi kesalahan");
            } finally {
                setIsLoading(false);
            }
        },
        [canEdit, onDataUpdate]
    );

    // Handle opening item details with useCallback
    const handleOpenDetails = useCallback((item) => {
        setSelectedItem(item);
        setSelectedItemType(item.itemType);
        setShowItemDetails(true);
    }, []);

    // Handle "Tanpa Diagnosa" selection with useCallback
    const handleNoDiagnosis = useCallback(
        async (item) => {
            if (!canEdit) return;

            setIsLoading(true);
            try {
                const payload = {};

                if (item.itemType === "condition") {
                    payload.tooth_condition_id = item.id;
                } else if (item.itemType === "bridge") {
                    payload.tooth_bridge_id = item.id;
                } else if (item.itemType === "indicator") {
                    payload.tooth_indicator_id = item.id;
                }

                await router.post(
                    route("tooth-diagnoses.set-no-diagnosis"),
                    payload,
                    {
                        onSuccess: () => {
                            toast.success(
                                'Status "Tanpa Diagnosa" berhasil disimpan'
                            );
                            if (onDataUpdate) {
                                onDataUpdate();
                            }
                        },
                        onError: (errors) => {
                            console.error(
                                "Error setting no diagnosis:",
                                errors
                            );
                            toast.error("Gagal menyimpan status");
                        },
                    }
                );
            } catch (error) {
                console.error("Error:", error);
                toast.error("Terjadi kesalahan");
            } finally {
                setIsLoading(false);
            }
        },
        [canEdit, onDataUpdate]
    );

    // NEW: Handle delete diagnosis with useCallback
    const handleDeleteDiagnosis = useCallback(
        async (item) => {
            if (!canEdit) return;

            // Confirm deletion
            if (
                !confirm(
                    "Apakah Anda yakin ingin menghapus diagnosis ini? Tindakan ini tidak dapat dibatalkan."
                )
            ) {
                return;
            }

            setIsLoading(true);
            try {
                let primaryDiagnosis = null;

                if (
                    item.itemType === "condition" ||
                    item.itemType === "indicator"
                ) {
                    primaryDiagnosis = item.primary_diagnosis;
                } else if (item.itemType === "bridge") {
                    primaryDiagnosis = item.primary_diagnosis;
                }

                if (!primaryDiagnosis || !primaryDiagnosis.id) {
                    toast.error("Diagnosis tidak ditemukan");
                    return;
                }

                router.delete(
                    route("tooth-diagnoses.destroy-primary", {
                        primaryDiagnosis: primaryDiagnosis.id,
                    }),
                    {
                        onSuccess: () => {
                            toast.success("Diagnosis berhasil dihapus");
                            if (onDataUpdate) {
                                onDataUpdate();
                            }
                        },
                        onError: (errors) => {
                            console.error("Error deleting diagnosis:", errors);
                            toast.error("Gagal menghapus diagnosis");
                        },
                    }
                );
            } catch (error) {
                console.error("Error:", error);
                toast.error("Terjadi kesalahan");
            } finally {
                setIsLoading(false);
            }
        },
        [canEdit, onDataUpdate]
    );

    // Handle treatment completion with useCallback
    const handleCompleteTraeatment = useCallback(
        async (item) => {
            if (!canEdit) return;

            setIsLoading(true);
            try {
                const payload = {};

                if (item.itemType === "condition") {
                    payload.tooth_condition_id = item.id;
                } else if (item.itemType === "bridge") {
                    payload.tooth_bridge_id = item.id;
                } else if (item.itemType === "indicator") {
                    payload.tooth_indicator_id = item.id;
                }

                await router.post(route("tooth-treatments.complete"), payload, {
                    onSuccess: () => {
                        toast.success("Treatment berhasil diselesaikan");
                        if (onDataUpdate) {
                            onDataUpdate();
                        }
                    },
                    onError: (errors) => {
                        console.error("Error completing treatment:", errors);
                        toast.error("Gagal menyelesaikan treatment");
                    },
                });
            } catch (error) {
                console.error("Error:", error);
                toast.error("Terjadi kesalahan");
            } finally {
                setIsLoading(false);
            }
        },
        [canEdit, onDataUpdate]
    );

    // Handle treatment cancellation with useCallback
    const handleCancelTreatment = useCallback(
        async (item) => {
            if (!canEdit) return;

            setIsLoading(true);
            try {
                const payload = {};

                if (item.itemType === "condition") {
                    payload.tooth_condition_id = item.id;
                } else if (item.itemType === "bridge") {
                    payload.tooth_bridge_id = item.id;
                } else if (item.itemType === "indicator") {
                    payload.tooth_indicator_id = item.id;
                }

                await router.post(route("tooth-treatments.cancel"), payload, {
                    onSuccess: () => {
                        toast.success("Treatment berhasil dibatalkan");
                        if (onDataUpdate) {
                            onDataUpdate();
                        }
                    },
                    onError: (errors) => {
                        console.error("Error cancelling treatment:", errors);
                        toast.error("Gagal membatalkan treatment");
                    },
                });
            } catch (error) {
                console.error("Error:", error);
                toast.error("Terjadi kesalahan");
            } finally {
                setIsLoading(false);
            }
        },
        [canEdit, onDataUpdate]
    );

    // Handle form save with useCallback
    const handleFormSave = useCallback(
        (updatedData) => {
            setShowDiagnosisForm(false);
            setShowTreatmentForm(false);
            setSelectedItem(null);
            setSelectedItemType(null);

            if (onDataUpdate) {
                onDataUpdate();
            }
        },
        [onDataUpdate]
    );

    // Create stable selected item references to prevent loops
    const stableSelectedItem = useMemo(
        () => selectedItem,
        [selectedItem?.id, selectedItem?.itemType]
    );
    const stableToothCondition = useMemo(
        () => (selectedItemType === "condition" ? stableSelectedItem : null),
        [selectedItemType, stableSelectedItem]
    );
    const stableToothBridge = useMemo(
        () => (selectedItemType === "bridge" ? stableSelectedItem : null),
        [selectedItemType, stableSelectedItem]
    );
    const stableToothIndicator = useMemo(
        () => (selectedItemType === "indicator" ? stableSelectedItem : null),
        [selectedItemType, stableSelectedItem]
    );

    // Create stable diagnosis data to prevent loops
    const stablePrimaryDiagnosis = useMemo(() => {
        if (!stableSelectedItem) return null;
        return stableSelectedItem.primary_diagnosis || null;
    }, [stableSelectedItem?.primary_diagnosis?.id]);

    const stableSecondaryDiagnoses = useMemo(() => {
        if (!stableSelectedItem) return [];
        return stableSelectedItem.secondary_diagnoses || [];
    }, [stableSelectedItem?.secondary_diagnoses?.length]);

    // Create stable close handlers with useCallback
    const handleCloseDiagnosisForm = useCallback(() => {
        setShowDiagnosisForm(false);
        setSelectedItem(null);
        setSelectedItemType(null);
    }, []);

    const handleCloseTreatmentForm = useCallback(() => {
        setShowTreatmentForm(false);
        setSelectedItem(null);
        setSelectedItemType(null);
    }, []);

    const handleCloseItemDetails = useCallback(() => {
        setShowItemDetails(false);
        setSelectedItem(null);
        setSelectedItemType(null);
    }, []);

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "treatment_completed":
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "treatment_in_progress":
            case "in_progress":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "needs_treatment":
            case "planned":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "has_diagnosis":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "needs_diagnosis":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "no_diagnosis":
            case "no_treatment":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "treatment_cancelled":
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Format status text
    const formatStatus = (status) => {
        const statusMap = {
            needs_diagnosis: "Perlu Tindakan",
            no_diagnosis: "Tanpa Diagnosa",
            has_diagnosis: "Ada Diagnosa",
            no_treatment: "Tanpa Treatment",
            needs_treatment: "Rencana Perawatan",
            treatment_in_progress: "Treatment Berlangsung",
            treatment_completed: "Treatment Selesai",
            treatment_cancelled: "Treatment Dibatalkan",
            planned: "Direncanakan",
            in_progress: "Berlangsung",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };
        return statusMap[status] || status;
    };

    // Get item icon based on type
    const getItemIcon = (itemType) => {
        switch (itemType) {
            case "condition":
                return FileText;
            case "bridge":
                return Link;
            case "indicator":
                return Zap;
            default:
                return FileText;
        }
    };

    // Get item description
    const getItemDescription = (item) => {
        switch (item.itemType) {
            case "condition":
                return `Gigi ${item.tooth_number}${
                    item.surface ? ` - Surface ${item.surface}` : ""
                } (${item.condition_code})`;
            case "bridge":
                return `Bridge ${item.bridge_name} (${
                    item.connected_teeth ? item.connected_teeth.join(", ") : ""
                })`;
            case "indicator":
                return `Indikator Gigi ${item.tooth_number} (${item.indicator_type})`;
            default:
                return "Unknown item";
        }
    };

    // Get button configuration based on item status
    const getItemButtons = (item) => {
        const buttons = [
            {
                key: "detail",
                label: "Detail",
                icon: Eye,
                variant: "outline",
                onClick: () => handleOpenDetails(item),
            },
        ];

        if (!canEdit) return buttons;

        let diagnosisStatus = "needs_diagnosis";
        if (item.itemType === "condition" || item.itemType === "indicator") {
            diagnosisStatus = item.diagnosis_status;
        } else if (item.itemType === "bridge") {
            diagnosisStatus = item.primary_diagnosis
                ? "has_diagnosis"
                : "needs_diagnosis";
        }

        let treatmentStatus = "no_treatment";
        let hasPlannedTreatment = false;

        if (item.itemType === "condition" || item.itemType === "indicator") {
            treatmentStatus = item.treatment_status;
            hasPlannedTreatment =
                item.treatment && item.treatment.status === "planned";
        } else if (item.itemType === "bridge") {
            if (item.treatment) {
                treatmentStatus =
                    item.treatment.status === "in_progress"
                        ? "treatment_in_progress"
                        : item.treatment.status === "completed"
                        ? "treatment_completed"
                        : item.treatment.status === "planned"
                        ? "needs_treatment"
                        : "needs_treatment";
                hasPlannedTreatment = item.treatment.status === "planned";
            }
        }

        switch (diagnosisStatus) {
            case "needs_diagnosis":
                buttons.push(
                    {
                        key: "add-diagnosis",
                        label: "Tambah Diagnosa",
                        icon: Stethoscope,
                        variant: "outline",
                        className: "text-blue-600 hover:text-blue-700",
                        onClick: () => handleOpenDiagnosis(item),
                    },
                    {
                        key: "no-diagnosis",
                        label: "Tanpa Diagnosa",
                        icon: X,
                        variant: "outline",
                        className: "text-gray-600 hover:text-gray-700",
                        onClick: () => handleNoDiagnosis(item),
                    }
                );
                break;

            case "has_diagnosis":
                if (treatmentStatus === "no_treatment") {
                    // UPDATED: Add new buttons for edit and delete diagnosis
                    buttons.push(
                        {
                            key: "edit-diagnosis",
                            label: "Ubah Diagnosa",
                            icon: Edit,
                            variant: "outline",
                            className: "text-purple-600 hover:text-purple-700",
                            onClick: () => handleOpenDiagnosis(item),
                        },
                        {
                            key: "delete-diagnosis",
                            label: "Hapus Diagnosa",
                            icon: Trash2,
                            variant: "outline",
                            className: "text-red-600 hover:text-red-700",
                            onClick: () => handleDeleteDiagnosis(item),
                        },
                        {
                            key: "add-treatment",
                            label: "Tambah Perawatan",
                            icon: Activity,
                            variant: "outline",
                            className: "text-green-600 hover:text-green-700",
                            onClick: () => handleOpenTreatment(item),
                        }
                    );
                } else if (
                    treatmentStatus === "needs_treatment" &&
                    hasPlannedTreatment
                ) {
                    buttons.push(
                        {
                            key: "edit-treatment",
                            label: "Ubah Rencana Perawatan",
                            icon: Activity,
                            variant: "outline",
                            className: "text-blue-600 hover:text-blue-700",
                            onClick: () => handleOpenTreatment(item, true),
                        },
                        {
                            key: "start-treatment",
                            label: "Mulai Treatment",
                            icon: Clock,
                            variant: "outline",
                            className: "text-green-600 hover:text-green-700",
                            onClick: () => handleStartTreatment(item),
                        }
                    );
                }
                break;

            case "no_diagnosis":
                buttons.push({
                    key: "add-diagnosis",
                    label: "Tambah Diagnosa",
                    icon: Stethoscope,
                    variant: "outline",
                    className: "text-blue-600 hover:text-blue-700",
                    onClick: () => handleOpenDiagnosis(item),
                });
                break;
        }

        if (treatmentStatus === "treatment_in_progress") {
            buttons.push(
                {
                    key: "complete-treatment",
                    label: "Selesai",
                    icon: CheckCircle,
                    variant: "outline",
                    className: "text-green-600 hover:text-green-700",
                    onClick: () => handleCompleteTraeatment(item),
                },
                {
                    key: "cancel-treatment",
                    label: "Batal",
                    icon: Ban,
                    variant: "outline",
                    className: "text-red-600 hover:text-red-700",
                    onClick: () => handleCancelTreatment(item),
                }
            );
        }

        return buttons;
    };

    // Render item card
    const renderItemCard = (item) => {
        const buttons = getItemButtons(item);
        const ItemIcon = getItemIcon(item.itemType);

        let diagnosisStatus = "needs_diagnosis";
        if (item.itemType === "condition" || item.itemType === "indicator") {
            diagnosisStatus = item.diagnosis_status;
        } else if (item.itemType === "bridge") {
            diagnosisStatus = item.primary_diagnosis
                ? "has_diagnosis"
                : "needs_diagnosis";
        }

        let treatmentStatus = "no_treatment";
        if (item.itemType === "condition" || item.itemType === "indicator") {
            treatmentStatus = item.treatment_status;
        } else if (item.itemType === "bridge") {
            if (item.treatment) {
                treatmentStatus =
                    item.treatment.status === "in_progress"
                        ? "treatment_in_progress"
                        : item.treatment.status === "completed"
                        ? "treatment_completed"
                        : item.treatment.status === "planned"
                        ? "needs_treatment"
                        : "needs_treatment";
            }
        }

        return (
            <Card key={`${item.itemType}-${item.id}`} className="mb-4">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <ItemIcon className="h-4 w-4 text-gray-500" />
                                <h4 className="font-medium">
                                    {getItemDescription(item)}
                                </h4>
                                <Badge
                                    variant="outline"
                                    className={getStatusColor(diagnosisStatus)}
                                >
                                    {formatStatus(diagnosisStatus)}
                                </Badge>
                                {treatmentStatus !== "no_treatment" && (
                                    <Badge
                                        variant="outline"
                                        className={getStatusColor(
                                            treatmentStatus
                                        )}
                                    >
                                        {formatStatus(treatmentStatus)}
                                    </Badge>
                                )}
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                                <strong>Tipe:</strong>{" "}
                                {item.itemType === "condition"
                                    ? "Kondisi Gigi"
                                    : item.itemType === "bridge"
                                    ? "Bridge"
                                    : "Indikator"}
                            </div>

                            {item.itemType === "condition" && (
                                <div className="text-sm text-gray-600 mb-2">
                                    <strong>Kondisi:</strong>{" "}
                                    {item.condition_code}
                                </div>
                            )}

                            {item.itemType === "bridge" && (
                                <div className="text-sm text-gray-600 mb-2">
                                    <strong>Tipe Bridge:</strong>{" "}
                                    {item.bridge_type}
                                </div>
                            )}

                            {item.itemType === "indicator" && (
                                <div className="text-sm text-gray-600 mb-2">
                                    <strong>Tipe Indikator:</strong>{" "}
                                    {item.indicator_type}
                                </div>
                            )}

                            {item.primary_diagnosis &&
                                item.primary_diagnosis.icd10Diagnosis && (
                                    <div className="text-sm text-gray-600 mb-2">
                                        <strong>Diagnosis:</strong>{" "}
                                        {
                                            item.primary_diagnosis
                                                .icd10Diagnosis.description
                                        }
                                        {item.primary_diagnosis.icd10Diagnosis
                                            .code &&
                                            ` (${item.primary_diagnosis.icd10Diagnosis.code})`}
                                    </div>
                                )}

                            {item.treatment &&
                                item.treatment.icd9cm_codes &&
                                item.treatment.icd9cm_codes.length > 0 && (
                                    <div className="text-sm text-gray-600 mb-2">
                                        <strong>Treatment:</strong>{" "}
                                        {item.treatment.icd9cm_codes
                                            .map((code) => code.description)
                                            .join(", ")}
                                    </div>
                                )}

                            {item.treatment && item.treatment.planned_date && (
                                <div className="text-sm text-gray-600 mb-2 flex items-center">
                                    <Calendar size={14} className="mr-1" />
                                    <strong>Tanggal Rencana:</strong>{" "}
                                    {new Date(
                                        item.treatment.planned_date
                                    ).toLocaleDateString("id-ID")}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            {buttons.map((button) => {
                                const Icon = button.icon;
                                return (
                                    <Button
                                        key={button.key}
                                        variant={button.variant}
                                        size="sm"
                                        onClick={button.onClick}
                                        className={button.className}
                                        disabled={isLoading}
                                    >
                                        <Icon size={14} className="mr-1" />
                                        {button.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Render statistics cards
    const renderStatistics = () => (
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-6">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Kondisi Gigi
                            </p>
                            <p className="text-2xl font-bold">
                                {conditions.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Bridge
                            </p>
                            <p className="text-2xl font-bold">
                                {bridges.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Link className="h-4 w-4 text-purple-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Indikator
                            </p>
                            <p className="text-2xl font-bold">
                                {indicators.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Zap className="h-4 w-4 text-yellow-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Ada Diagnosa
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                {itemsWithDiagnosis.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tanpa Diagnosa
                            </p>
                            <p className="text-2xl font-bold text-gray-600">
                                {itemsWithoutDiagnosis.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <X className="h-4 w-4 text-gray-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Rencana Perawatan
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                                {itemsWithPlannedTreatment.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Perawatan Berlangsung
                            </p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {itemsWithTreatmentInProgress.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Perawatan Selesai
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {itemsWithTreatmentCompleted.length}
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Statistics */}
            {renderStatistics()}

            {/* Main Content */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all-items">
                        Semua Item ({allItems.length})
                    </TabsTrigger>
                    <TabsTrigger value="conditions">
                        Kondisi ({conditions.length})
                    </TabsTrigger>
                    <TabsTrigger value="bridges">
                        Bridge ({bridges.length})
                    </TabsTrigger>
                    <TabsTrigger value="indicators">
                        Indikator ({indicators.length})
                    </TabsTrigger>
                </TabsList>

                <TabsList className="grid w-full grid-cols-6 mt-3">
                    <TabsTrigger value="need-choice">
                        Perlu Tindakan ({itemsNeedingChoice.length})
                    </TabsTrigger>
                    <TabsTrigger value="withoutDiagnosis">
                        Tanpa Diagnosa ({itemsWithoutDiagnosis.length})
                    </TabsTrigger>
                    <TabsTrigger value="diagnosis">
                        Diagnosa ({itemsWithDiagnosis.length})
                    </TabsTrigger>
                    <TabsTrigger value="planned-treatment">
                        Rencana Perawatan ({itemsWithPlannedTreatment.length})
                    </TabsTrigger>
                    <TabsTrigger value="treatment-progress">
                        Perawatan ({itemsWithTreatmentInProgress.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Selesai ({itemsWithTreatmentCompleted.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all-items" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Semua Item (Kondisi, Bridge, Indikator)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {allItems.length > 0 ? (
                                <div className="space-y-4">
                                    {allItems.map(renderItemCard)}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText
                                        size={48}
                                        className="mx-auto mb-4 opacity-50"
                                    />
                                    <p>Belum ada item yang tercatat</p>
                                    <p className="text-sm">
                                        Tambahkan kondisi, bridge, atau
                                        indikator melalui odontogram canvas
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="conditions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="mr-2 text-blue-600" />
                                Kondisi Gigi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {conditions.length > 0 ? (
                                <div className="space-y-4">
                                    {conditions.map((c) =>
                                        renderItemCard({
                                            ...c,
                                            itemType: "condition",
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText
                                        size={48}
                                        className="mx-auto mb-4 text-blue-500"
                                    />
                                    <p>Belum ada kondisi gigi</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bridges" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Link className="mr-2 text-purple-600" />
                                Bridge Gigi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bridges.length > 0 ? (
                                <div className="space-y-4">
                                    {bridges.map((b) =>
                                        renderItemCard({
                                            ...b,
                                            itemType: "bridge",
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Link
                                        size={48}
                                        className="mx-auto mb-4 text-purple-500"
                                    />
                                    <p>Belum ada bridge gigi</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="indicators" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Zap className="mr-2 text-yellow-600" />
                                Indikator Gigi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {indicators.length > 0 ? (
                                <div className="space-y-4">
                                    {indicators.map((i) =>
                                        renderItemCard({
                                            ...i,
                                            itemType: "indicator",
                                        })
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Zap
                                        size={48}
                                        className="mx-auto mb-4 text-yellow-500"
                                    />
                                    <p>Belum ada indikator gigi</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Other tab contents... */}
                <TabsContent value="diagnosis" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Stethoscope className="mr-2 text-blue-600" />
                                Item dengan Diagnosa (Belum Ada Treatment)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsWithDiagnosis.length > 0 ? (
                                <div className="space-y-4">
                                    {itemsWithDiagnosis.map(renderItemCard)}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Stethoscope
                                        size={48}
                                        className="mx-auto mb-4 text-blue-500"
                                    />
                                    <p>
                                        Semua item dengan diagnosis sudah
                                        memiliki treatment
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="planned-treatment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Calendar className="mr-2 text-purple-600" />
                                Rencana Perawatan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsWithPlannedTreatment.length > 0 ? (
                                <div className="space-y-4">
                                    {itemsWithPlannedTreatment.map(
                                        renderItemCard
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar
                                        size={48}
                                        className="mx-auto mb-4 text-purple-500"
                                    />
                                    <p>Belum ada rencana perawatan</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="treatment-progress" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Clock className="mr-2 text-yellow-600" />
                                Perawatan Berlangsung
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsWithTreatmentInProgress.length > 0 ? (
                                <div className="space-y-4">
                                    {itemsWithTreatmentInProgress.map(
                                        renderItemCard
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock
                                        size={48}
                                        className="mx-auto mb-4 text-yellow-500"
                                    />
                                    <p>
                                        Belum ada perawatan yang sedang
                                        berlangsung
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="need-choice" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="mr-2 text-orange-600" />
                                Item yang Membutuhkan Tindakan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsNeedingChoice.length > 0 ? (
                                <div className="space-y-4">
                                    {itemsNeedingChoice.map(renderItemCard)}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle
                                        size={48}
                                        className="mx-auto mb-4 text-green-500"
                                    />
                                    <p>Semua Gigi sudah ada Tindakan</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withoutDiagnosis" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="mr-2 text-orange-600" />
                                Tanpa Diagnosis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsWithoutDiagnosis.length > 0 ? (
                                <div className="space-y-4">
                                    {itemsWithoutDiagnosis.map(renderItemCard)}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle
                                        size={48}
                                        className="mx-auto mb-4 text-green-500"
                                    />
                                    <p>Data Diagnosis Kosong</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="mr-2 text-orange-600" />
                                Selesai Treatment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemsWithTreatmentCompleted.length > 0 ? (
                                <div className="space-y-4">
                                    {itemsWithTreatmentCompleted.map(
                                        renderItemCard
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle
                                        size={48}
                                        className="mx-auto mb-4 text-green-500"
                                    />
                                    <p>Data Selesai Perawatan Gigi Kosong</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Forms and Detail Component */}
            {/* Diagnosis Form Dialog */}
            {showDiagnosisForm && (
                <DentalDiagnosisForm
                    isOpen={showDiagnosisForm}
                    onClose={handleCloseDiagnosisForm}
                    toothCondition={stableToothCondition}
                    toothBridge={stableToothBridge}
                    toothIndicator={stableToothIndicator}
                    existingPrimaryDiagnosis={stablePrimaryDiagnosis}
                    existingSecondaryDiagnoses={stableSecondaryDiagnoses}
                    onSave={handleFormSave}
                    canEdit={canEdit}
                />
            )}

            {/* Treatment Form Dialog */}
            {showTreatmentForm && (
                <DentalTreatmentForm
                    isOpen={showTreatmentForm}
                    onClose={handleCloseTreatmentForm}
                    toothCondition={
                        selectedItemType === "condition" ? selectedItem : null
                    }
                    toothBridge={
                        selectedItemType === "bridge" ? selectedItem : null
                    }
                    toothIndicator={
                        selectedItemType === "indicator" ? selectedItem : null
                    }
                    existingTreatment={selectedItem?.treatment || null}
                    onSave={handleFormSave}
                    canEdit={canEdit}
                />
            )}

            {/* Dental Item Detail Component */}
            <DentalItemDetail
                isOpen={showItemDetails}
                onClose={handleCloseItemDetails}
                selectedItem={selectedItem}
            />
        </div>
    );
};

export default DentalManagementSection;
