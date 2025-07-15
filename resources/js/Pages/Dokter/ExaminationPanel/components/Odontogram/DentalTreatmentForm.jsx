import React, { useState, useEffect, useCallback, useMemo } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    AlertCircle,
    Activity,
    Search,
    X,
    Save,
    Clock,
    Plus,
    Minus,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DentalTreatmentForm = ({
    isOpen,
    onClose,
    toothCondition = null,
    toothBridge = null,
    toothIndicator = null,
    existingTreatment = null,
    onSave,
    canEdit = true,
}) => {
    console.log("DentalTreatmentForm Props:", {
        isOpen,
        toothCondition,
        toothBridge,
        toothIndicator,
        existingTreatment,
        canEdit,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Data sources
    const [icd9cmCodes, setIcd9cmCodes] = useState([]);

    // Search states
    const [icd9Search, setIcd9Search] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        icd_9cm_codes_ids: [], // Array of selected ICD-9-CM code IDs
        notes: "",
        status: "planned",
        planned_date: "",
    });

    // Selected procedures for display
    const [selectedProcedures, setSelectedProcedures] = useState([]);

    // Form validation & errors
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    // Determine target item (condition, bridge, or indicator)
    const targetItem = toothCondition || toothBridge || toothIndicator;
    const targetType = toothCondition
        ? "condition"
        : toothBridge
        ? "bridge"
        : "indicator";

    // Create stable dependencies for useEffect
    const existingTreatmentId = useMemo(
        () => existingTreatment?.id || null,
        [existingTreatment?.id]
    );

    // Status options
    const statusOptions = [
        {
            value: "planned",
            label: "Direncanakan",
            color: "bg-blue-100 text-blue-800",
            description: "Treatment belum dimulai",
        },
        {
            value: "in_progress",
            label: "Sedang Berlangsung",
            color: "bg-yellow-100 text-yellow-800",
            description: "Treatment sedang berjalan",
        },
        {
            value: "completed",
            label: "Selesai",
            color: "bg-green-100 text-green-800",
            description: "Treatment telah selesai",
        },
    ];

    // Initialize form data - ONLY when dialog is opened
    useEffect(() => {
        if (!isOpen) return;

        if (existingTreatment) {
            console.log(
                "Setting form data from existing treatment:",
                existingTreatment
            );

            // Extract ICD-9-CM code IDs from existing treatment
            const icd9CodeIds =
                existingTreatment.icd9cmCodes || existingTreatment.icd9cm_codes
                    ? (
                          existingTreatment.icd9cmCodes ||
                          existingTreatment.icd9cm_codes
                      ).map((code) => code.id.toString())
                    : [];

            const newFormData = {
                icd_9cm_codes_ids: icd9CodeIds,
                notes: existingTreatment.notes || "",
                status: existingTreatment.status || "planned",
                planned_date: existingTreatment.planned_date || "",
            };

            setFormData((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(newFormData)) {
                    return prev;
                }
                return newFormData;
            });

            // Set selected procedures for display
            const procedures =
                existingTreatment.icd9cmCodes ||
                existingTreatment.icd9cm_codes ||
                [];
            setSelectedProcedures((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(procedures)) {
                    return prev;
                }
                return procedures;
            });
        } else {
            console.log("Resetting form data to defaults");
            const defaultData = {
                icd_9cm_codes_ids: [],
                notes: "",
                status: "planned",
                planned_date: "",
            };

            setFormData((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(defaultData)) {
                    return prev;
                }
                return defaultData;
            });

            setSelectedProcedures((prev) => {
                if (prev.length === 0) {
                    return prev;
                }
                return [];
            });
        }
    }, [isOpen, existingTreatmentId]);

    // Load initial data when dialog opens
    useEffect(() => {
        if (isOpen) {
            console.log("Dialog opened, loading initial data...");
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = useCallback(async () => {
        setLoadingData(true);
        try {
            await loadIcd9cmCodes("");
        } catch (error) {
            console.error("Error loading initial data:", error);
            toast.error("Gagal memuat data pendukung");
        } finally {
            setLoadingData(false);
        }
    }, []);

    const loadIcd9cmCodes = useCallback(async (search = "") => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("active", "1");

            const response = await fetch(
                route("api.icd9cm-codes") + "?" + params.toString()
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setIcd9cmCodes(result.data || []);
                console.log("Loaded ICD-9-CM codes:", result.data?.length || 0);
            }
        } catch (error) {
            console.error("Error loading ICD-9-CM codes:", error);
        }
    }, []);

    // Debounced search handlers
    const debouncedIcd9Search = useCallback(
        debounce((search) => loadIcd9cmCodes(search), 300),
        [loadIcd9cmCodes]
    );

    // Form handlers
    const handleInputChange = useCallback((field, value) => {
        console.log(`Changing ${field} to:`, value);
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear related error
        setErrors((prev) => ({
            ...prev,
            [field]: null,
        }));

        // Clear general error
        setGeneralError("");
    }, []);

    // Handle adding procedure
    const handleAddProcedure = useCallback(
        (procedureId) => {
            const procedure = icd9cmCodes.find(
                (code) => code.id.toString() === procedureId
            );
            if (!procedure) return;

            // Check if already selected
            if (formData.icd_9cm_codes_ids.includes(procedureId)) {
                toast.error("Prosedur ini sudah dipilih");
                return;
            }

            // Add to form data
            setFormData((prev) => ({
                ...prev,
                icd_9cm_codes_ids: [...prev.icd_9cm_codes_ids, procedureId],
            }));

            // Add to selected procedures for display
            setSelectedProcedures((prev) => [...prev, procedure]);

            console.log("Added procedure:", procedure);
        },
        [icd9cmCodes, formData.icd_9cm_codes_ids]
    );

    // Handle removing procedure
    const handleRemoveProcedure = useCallback((procedureId) => {
        const procedureIdStr = procedureId.toString();

        // Remove from form data
        setFormData((prev) => ({
            ...prev,
            icd_9cm_codes_ids: prev.icd_9cm_codes_ids.filter(
                (id) => id !== procedureIdStr
            ),
        }));

        // Remove from selected procedures for display
        setSelectedProcedures((prev) =>
            prev.filter((proc) => proc.id.toString() !== procedureIdStr)
        );

        console.log("Removed procedure:", procedureId);
    }, []);

    const validateForm = useCallback(() => {
        console.log("Validating form...");
        const newErrors = {};

        if (
            !formData.icd_9cm_codes_ids ||
            formData.icd_9cm_codes_ids.length === 0
        ) {
            newErrors.icd_9cm_codes_ids = "Minimal satu prosedur harus dipilih";
        }

        if (!targetItem) {
            newErrors.general = "Target treatment tidak valid";
        }

        console.log("Validation errors:", newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.icd_9cm_codes_ids, targetItem]);

    const handleSubmit = async () => {
        console.log("=== TREATMENT FORM SUBMIT START ===");
        console.log("Form data:", formData);
        console.log("Target item:", targetItem);
        console.log("Target type:", targetType);

        if (!validateForm()) {
            toast.error("Mohon lengkapi data yang diperlukan");
            return;
        }

        setIsLoading(true);
        setGeneralError("");

        try {
            // Prepare payload based on target type
            const payload = {
                ...formData,
            };

            // Add the appropriate parent ID based on target type
            if (targetType === "condition") {
                payload.tooth_condition_id = targetItem.id;
            } else if (targetType === "bridge") {
                payload.tooth_bridge_id = targetItem.id;
            } else if (targetType === "indicator") {
                payload.tooth_indicator_id = targetItem.id;
            }

            // Remove empty/null values except for arrays
            Object.keys(payload).forEach((key) => {
                if (
                    key !== "icd_9cm_codes_ids" &&
                    (payload[key] === null ||
                        payload[key] === "" ||
                        payload[key] === undefined)
                ) {
                    delete payload[key];
                }
            });

            console.log("Final payload:", payload);

            const routeName = existingTreatment
                ? "tooth-treatments.update"
                : "tooth-treatments.store";

            const routeParams = existingTreatment
                ? { toothTreatment: existingTreatment.id }
                : {};

            console.log("Using route:", routeName, routeParams);

            // Create promise to handle the request
            const requestPromise = new Promise((resolve, reject) => {
                if (existingTreatment) {
                    // Update
                    router.put(route(routeName, routeParams), payload, {
                        onSuccess: (page) => {
                            console.log("Update success:", page);
                            resolve(page.props?.updatedTreatment || payload);
                        },
                        onError: (errors) => {
                            console.error("Update validation errors:", errors);
                            reject(errors);
                        },
                        preserveState: true,
                        preserveScroll: true,
                    });
                } else {
                    // Create
                    router.post(route(routeName), payload, {
                        onSuccess: (page) => {
                            console.log("Create success:", page);
                            resolve(page.props?.newTreatment || payload);
                        },
                        onError: (errors) => {
                            console.error("Create validation errors:", errors);
                            reject(errors);
                        },
                        preserveState: true,
                        preserveScroll: true,
                    });
                }
            });

            const result = await requestPromise;

            toast.success(
                existingTreatment
                    ? "Treatment berhasil diperbarui"
                    : "Treatment berhasil disimpan"
            );

            if (onSave && typeof onSave === "function") {
                onSave(result);
            }

            handleClose();
        } catch (error) {
            console.error("Submit error:", error);
            handleFormErrors(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormErrors = (errors) => {
        console.log("Handling form errors:", errors);

        // Set field-specific errors
        setErrors(errors);

        // Set general error if exists
        if (errors.general) {
            setGeneralError(
                Array.isArray(errors.general)
                    ? errors.general[0]
                    : errors.general
            );
        }

        // Show toast for each error
        Object.entries(errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            toast.error(`${field}: ${message}`);
        });
    };

    const handleClose = useCallback(() => {
        console.log("Closing dialog...");
        setFormData({
            icd_9cm_codes_ids: [],
            notes: "",
            status: "planned",
            planned_date: "",
        });
        setSelectedProcedures([]);
        setErrors({});
        setGeneralError("");
        setIcd9Search("");
        onClose();
    }, [onClose]);

    // Get target display text
    const getTargetDisplay = () => {
        if (toothCondition) {
            return `Gigi ${toothCondition.tooth_number}${
                toothCondition.surface ? ` - ${toothCondition.surface}` : ""
            } (${
                toothCondition.condition_name || toothCondition.condition_code
            })`;
        } else if (toothBridge) {
            return `Bridge ${toothBridge.bridge_name} (${
                toothBridge.connected_teeth
                    ? toothBridge.connected_teeth.join(", ")
                    : ""
            })`;
        } else if (toothIndicator) {
            return `Indikator Gigi ${toothIndicator.tooth_number} (${toothIndicator.indicator_type})`;
        }
        return "Target tidak diketahui";
    };

    // Filter functions with useMemo
    const filteredIcd9Codes = useMemo(() => {
        return icd9cmCodes.filter(
            (code) =>
                code.code.toLowerCase().includes(icd9Search.toLowerCase()) ||
                code.description
                    .toLowerCase()
                    .includes(icd9Search.toLowerCase())
        );
    }, [icd9cmCodes, icd9Search]);

    // Available codes (not yet selected)
    const availableIcd9Codes = useMemo(() => {
        return filteredIcd9Codes.filter(
            (code) => !formData.icd_9cm_codes_ids.includes(code.id.toString())
        );
    }, [filteredIcd9Codes, formData.icd_9cm_codes_ids]);

    // Early return if dialog is not open
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-gray-100">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <span className="text-gray-900">
                                {existingTreatment
                                    ? "Edit Treatment"
                                    : "Tambah Treatment Baru"}
                            </span>
                            {existingTreatment && (
                                <div className="text-sm font-normal text-gray-500 mt-1">
                                    Mengubah data treatment yang sudah ada
                                </div>
                            )}
                        </div>
                    </DialogTitle>
                    <DialogDescription className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                                Target:
                            </span>
                            <span className="font-semibold text-blue-700">
                                {getTargetDisplay()}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Treatment akan diterapkan pada item odontogram di
                            atas
                        </div>
                    </DialogDescription>
                </DialogHeader>

                {/* Show general error */}
                {generalError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6">
                    {/* Main Treatment Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Prosedur Treatment (ICD-9-CM)
                            </CardTitle>
                            <CardDescription>
                                Pilih satu atau lebih prosedur treatment
                                berdasarkan kode ICD-9-CM
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Selected Procedures Display */}
                            {selectedProcedures.length > 0 && (
                                <div>
                                    <Label className="text-base font-medium mb-3 block">
                                        Prosedur Terpilih (
                                        {selectedProcedures.length})
                                    </Label>
                                    <div className="space-y-2">
                                        {selectedProcedures.map((procedure) => (
                                            <div
                                                key={procedure.id}
                                                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-green-600 bg-white px-2 py-1 rounded border text-sm">
                                                        {procedure.code}
                                                    </span>
                                                    <span className="text-gray-800 font-medium">
                                                        {procedure.description}
                                                    </span>
                                                </div>
                                                {canEdit && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveProcedure(
                                                                procedure.id
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Procedure */}
                            {canEdit && (
                                <div>
                                    <Label className="text-base font-medium mb-3 block">
                                        Tambah Prosedur
                                        {selectedProcedures.length === 0 && (
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        )}
                                    </Label>
                                    <div className="space-y-2">
                                        {/* Search Input */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Ketik untuk mencari kode ICD-9-CM..."
                                                value={icd9Search}
                                                onChange={(e) => {
                                                    setIcd9Search(
                                                        e.target.value
                                                    );
                                                    debouncedIcd9Search(
                                                        e.target.value
                                                    );
                                                }}
                                                className="pl-10"
                                            />
                                            {icd9Search && (
                                                <button
                                                    onClick={() => {
                                                        setIcd9Search("");
                                                        loadIcd9cmCodes("");
                                                    }}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    type="button"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Available Procedures List */}
                                        <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
                                            {availableIcd9Codes.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    {icd9Search
                                                        ? `Tidak ada hasil untuk "${icd9Search}"`
                                                        : selectedProcedures.length >
                                                          0
                                                        ? "Semua prosedur tersedia telah dipilih"
                                                        : "Ketik untuk mencari prosedur"}
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200">
                                                    {availableIcd9Codes.map(
                                                        (code) => (
                                                            <div
                                                                key={code.id}
                                                                className="p-3 hover:bg-gray-50 cursor-pointer"
                                                                onClick={() =>
                                                                    handleAddProcedure(
                                                                        code.id.toString()
                                                                    )
                                                                }
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="font-bold text-green-600 bg-white px-2 py-1 rounded border text-sm">
                                                                            {
                                                                                code.code
                                                                            }
                                                                        </span>
                                                                        <div className="flex-1">
                                                                            <div className="text-gray-800 font-medium">
                                                                                {
                                                                                    code.description
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-green-600 hover:text-green-700"
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Error Display */}
                                        {errors.icd_9cm_codes_ids && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.icd_9cm_codes_ids}
                                            </p>
                                        )}

                                        {/* Tips */}
                                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                            💡 <strong>Tips:</strong> Klik pada
                                            prosedur di atas untuk
                                            menambahkannya
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {selectedProcedures.length === 0 && !canEdit && (
                                <div className="text-center py-8 text-gray-500">
                                    <Activity
                                        size={48}
                                        className="mx-auto mb-4 text-blue-300"
                                    />
                                    <p>Tidak ada prosedur treatment</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Treatment Details Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Detail Treatment
                            </CardTitle>
                            <CardDescription>
                                Atur status dan informasi tambahan treatment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status Selection */}
                            <div>
                                <Label
                                    htmlFor="status"
                                    className="text-base font-medium"
                                >
                                    Status Treatment
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        handleInputChange("status", value)
                                    }
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger className="focus:border-blue-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 py-1">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${option.color}`}
                                                    >
                                                        {option.label}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {option.description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Status Info Display */}
                                {formData.status && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-gray-700">
                                                Status saat ini:
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    statusOptions.find(
                                                        (opt) =>
                                                            opt.value ===
                                                            formData.status
                                                    )?.color ||
                                                    "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {statusOptions.find(
                                                    (opt) =>
                                                        opt.value ===
                                                        formData.status
                                                )?.label || formData.status}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Planned Date */}
                            <div>
                                <Label
                                    htmlFor="planned_date"
                                    className="text-base font-medium"
                                >
                                    Tanggal Rencana
                                </Label>
                                <Input
                                    type="date"
                                    id="planned_date"
                                    value={formData.planned_date}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "planned_date",
                                            e.target.value
                                        )
                                    }
                                    disabled={!canEdit}
                                    className="focus:border-blue-500"
                                />
                            </div>

                            {/* Treatment Notes */}
                            <div>
                                <Label
                                    htmlFor="notes"
                                    className="text-base font-medium"
                                >
                                    Catatan Treatment
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "notes",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Contoh: Treatment dilakukan dengan bius lokal, pasien kooperatif, tidak ada komplikasi..."
                                    rows={4}
                                    disabled={!canEdit}
                                    className="focus:border-blue-500"
                                />
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>
                                        {formData.notes?.length || 0} karakter
                                    </span>
                                    <span className="flex items-center gap-1">
                                        💡 Tips: Catat hal penting seperti
                                        metode, komplikasi, atau hasil treatment
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            {canEdit ? (
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Anda dapat mengedit data treatment
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Mode hanya baca - data tidak dapat diubah
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="min-w-[100px]"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Batal
                            </Button>
                            {canEdit && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        isLoading ||
                                        loadingData ||
                                        formData.icd_9cm_codes_ids.length === 0
                                    }
                                    className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {existingTreatment
                                                ? "Update Treatment"
                                                : "Simpan Treatment"}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(DentalTreatmentForm);
