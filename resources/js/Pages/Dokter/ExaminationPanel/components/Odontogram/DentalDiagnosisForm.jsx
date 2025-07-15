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
    Stethoscope,
    Search,
    X,
    Save,
    Clock,
    Plus,
    Minus,
    Activity,
    FileText,
    ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DentalDiagnosisForm = ({
    isOpen,
    onClose,
    toothCondition = null,
    toothBridge = null,
    toothIndicator = null,
    existingPrimaryDiagnosis = null,
    existingSecondaryDiagnoses = [],
    onSave,
    canEdit = true,
}) => {
    console.log("DentalDiagnosisForm Props:", {
        isOpen,
        toothCondition,
        toothBridge,
        toothIndicator,
        existingPrimaryDiagnosis,
        existingSecondaryDiagnoses,
        canEdit,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Data sources
    const [primaryDiagnosisCodes, setPrimaryDiagnosisCodes] = useState([]);
    const [secondaryDiagnosisCodes, setSecondaryDiagnosisCodes] = useState([]);
    const [externalCauseCodes, setExternalCauseCodes] = useState([]);

    // Search states
    const [primaryDiagnosisSearch, setPrimaryDiagnosisSearch] = useState("");
    const [secondaryDiagnosisSearch, setSecondaryDiagnosisSearch] =
        useState("");
    const [externalCauseSearch, setExternalCauseSearch] = useState("");

    // Form state for primary diagnosis
    const [primaryFormData, setPrimaryFormData] = useState({
        icd_10_codes_diagnoses_id: "",
        diagnosis_notes: "",
        icd_10_codes_external_cause_id: "",
        external_cause_notes: "",
    });

    // Form state for secondary diagnoses
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState([]);

    // Form validation & errors
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    // Determine target item
    const targetItem = toothCondition || toothBridge || toothIndicator;
    const targetType = toothCondition
        ? "condition"
        : toothBridge
        ? "bridge"
        : "indicator";

    // Create stable dependencies for useEffect
    const primaryDiagnosisId = useMemo(
        () => existingPrimaryDiagnosis?.id || null,
        [existingPrimaryDiagnosis?.id]
    );
    const secondaryDiagnosesIds = useMemo(() => {
        if (
            !existingSecondaryDiagnoses ||
            existingSecondaryDiagnoses.length === 0
        )
            return "";
        return existingSecondaryDiagnoses
            .map((d) => d.id)
            .sort()
            .join(",");
    }, [existingSecondaryDiagnoses]);

    // Initialize form data
    useEffect(() => {
        if (!isOpen) return;

        if (existingPrimaryDiagnosis) {
            console.log(
                "Setting primary form data from existing diagnosis:",
                existingPrimaryDiagnosis
            );

            const newPrimaryData = {
                icd_10_codes_diagnoses_id:
                    existingPrimaryDiagnosis.icd_10_codes_diagnoses_id || "",
                diagnosis_notes: existingPrimaryDiagnosis.diagnosis_notes || "",
                icd_10_codes_external_cause_id:
                    existingPrimaryDiagnosis.icd_10_codes_external_cause_id ||
                    "",
                external_cause_notes:
                    existingPrimaryDiagnosis.external_cause_notes || "",
            };

            setPrimaryFormData((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(newPrimaryData)) {
                    return prev;
                }
                return newPrimaryData;
            });
        } else {
            console.log("Resetting primary form data to defaults");
            const defaultData = {
                icd_10_codes_diagnoses_id: "",
                diagnosis_notes: "",
                icd_10_codes_external_cause_id: "",
                external_cause_notes: "",
            };
            setPrimaryFormData((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(defaultData)) {
                    return prev;
                }
                return defaultData;
            });
        }

        // Set secondary diagnoses
        if (
            existingSecondaryDiagnoses &&
            existingSecondaryDiagnoses.length > 0
        ) {
            const newSecondaryData = existingSecondaryDiagnoses.map(
                (secondary) => ({
                    id: secondary.id,
                    icd_10_codes_diagnoses_id:
                        secondary.icd_10_codes_diagnoses_id || "",
                    diagnosis_notes: secondary.diagnosis_notes || "",
                    isExisting: true,
                    diagnosis_data:
                        secondary.icd10_diagnosis ||
                        secondary.icd10Diagnosis ||
                        null,
                })
            );

            setSecondaryDiagnoses((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(newSecondaryData)) {
                    return prev;
                }
                return newSecondaryData;
            });
        } else {
            setSecondaryDiagnoses((prev) => {
                if (prev.length === 0) {
                    return prev;
                }
                return [];
            });
        }
    }, [isOpen, primaryDiagnosisId, secondaryDiagnosesIds]);

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
            await Promise.all([
                loadPrimaryDiagnosisCodes(""),
                loadSecondaryDiagnosisCodes(""),
                loadExternalCauseCodes(""),
            ]);
        } catch (error) {
            console.error("Error loading initial data:", error);
            toast.error("Gagal memuat data pendukung");
        } finally {
            setLoadingData(false);
        }
    }, []);

    // Load functions
    const loadPrimaryDiagnosisCodes = useCallback(async (search = "") => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("active", "1");

            const response = await fetch(
                route("api.icd10-diagnosis-codes") + "?" + params.toString()
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setPrimaryDiagnosisCodes(result.data || []);
            }
        } catch (error) {
            console.error(
                "Error loading PRIMARY ICD-10 diagnosis codes:",
                error
            );
        }
    }, []);

    const loadSecondaryDiagnosisCodes = useCallback(async (search = "") => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("active", "1");

            const response = await fetch(
                route("api.icd10-diagnosis-codes") + "?" + params.toString()
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setSecondaryDiagnosisCodes(result.data || []);
            }
        } catch (error) {
            console.error(
                "Error loading SECONDARY ICD-10 diagnosis codes:",
                error
            );
        }
    }, []);

    const loadExternalCauseCodes = useCallback(async (search = "") => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("active", "1");

            const response = await fetch(
                route("api.icd10-external-cause-codes") +
                    "?" +
                    params.toString()
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                setExternalCauseCodes(result.data || []);
            }
        } catch (error) {
            console.error("Error loading ICD-10 external cause codes:", error);
        }
    }, []);

    // Debounced search handlers
    const debouncedPrimaryDiagnosisSearch = useCallback(
        debounce((search) => loadPrimaryDiagnosisCodes(search), 300),
        [loadPrimaryDiagnosisCodes]
    );

    const debouncedSecondaryDiagnosisSearch = useCallback(
        debounce((search) => loadSecondaryDiagnosisCodes(search), 300),
        [loadSecondaryDiagnosisCodes]
    );

    const debouncedExternalCauseSearch = useCallback(
        debounce((search) => loadExternalCauseCodes(search), 300),
        [loadExternalCauseCodes]
    );

    // Form handlers
    const handlePrimaryInputChange = useCallback((field, value) => {
        console.log(`Changing primary ${field} to:`, value);
        setPrimaryFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: null,
        }));

        setGeneralError("");
    }, []);

    const handleAddSecondaryDiagnosis = useCallback(
        (diagnosisId) => {
            const diagnosis = secondaryDiagnosisCodes.find(
                (code) => code.id.toString() === diagnosisId
            );
            if (!diagnosis) return;

            if (
                secondaryDiagnoses.some(
                    (sec) => sec.icd_10_codes_diagnoses_id === diagnosisId
                )
            ) {
                toast.error("Diagnosis sekunder ini sudah dipilih");
                return;
            }

            if (primaryFormData.icd_10_codes_diagnoses_id === diagnosisId) {
                toast.error(
                    "Diagnosis sekunder tidak boleh sama dengan diagnosis primer"
                );
                return;
            }

            setSecondaryDiagnoses((prev) => [
                ...prev,
                {
                    icd_10_codes_diagnoses_id: diagnosisId,
                    diagnosis_notes: "",
                    isExisting: false,
                    tempId: Date.now(),
                    diagnosis_data: diagnosis,
                },
            ]);

            console.log("Added secondary diagnosis:", diagnosis);
        },
        [
            secondaryDiagnosisCodes,
            secondaryDiagnoses,
            primaryFormData.icd_10_codes_diagnoses_id,
        ]
    );

    const handleRemoveSecondaryDiagnosis = useCallback((index) => {
        setSecondaryDiagnoses((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpdateSecondaryNotes = useCallback((index, notes) => {
        setSecondaryDiagnoses((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                diagnosis_notes: notes,
            };
            return updated;
        });
    }, []);

    const validateForm = useCallback(() => {
        console.log("Validating form...");
        const newErrors = {};

        if (!primaryFormData.icd_10_codes_diagnoses_id) {
            newErrors.icd_10_codes_diagnoses_id =
                "Diagnosis primer harus dipilih";
        }

        if (!targetItem) {
            newErrors.general = "Target diagnosis tidak valid";
        }

        console.log("Validation errors:", newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [primaryFormData.icd_10_codes_diagnoses_id, targetItem]);

    const handleSubmit = async () => {
        console.log("=== DIAGNOSIS FORM SUBMIT START ===");
        console.log("Primary form data:", primaryFormData);
        console.log("Secondary diagnoses:", secondaryDiagnoses);
        console.log("Target item:", targetItem);
        console.log("Target type:", targetType);

        if (!validateForm()) {
            toast.error("Mohon lengkapi data yang diperlukan");
            return;
        }

        setIsLoading(true);
        setGeneralError("");

        try {
            const payload = { ...primaryFormData };

            if (targetType === "condition") {
                payload.tooth_condition_id = targetItem.id;
            } else if (targetType === "bridge") {
                payload.tooth_bridge_id = targetItem.id;
            } else if (targetType === "indicator") {
                payload.tooth_indicator_id = targetItem.id;
            }

            if (secondaryDiagnoses.length > 0) {
                payload.secondary_diagnoses = secondaryDiagnoses.map(
                    (secondary) => ({
                        icd_10_codes_diagnoses_id:
                            secondary.icd_10_codes_diagnoses_id,
                        diagnosis_notes: secondary.diagnosis_notes || null,
                    })
                );
            }

            Object.keys(payload).forEach((key) => {
                if (
                    key !== "secondary_diagnoses" &&
                    (payload[key] === null ||
                        payload[key] === "" ||
                        payload[key] === undefined)
                ) {
                    delete payload[key];
                }
            });

            console.log("Final payload:", payload);

            const routeName = existingPrimaryDiagnosis
                ? "tooth-diagnoses.update-primary"
                : "tooth-diagnoses.store-primary";

            const routeParams = existingPrimaryDiagnosis
                ? { primaryDiagnosis: existingPrimaryDiagnosis.id }
                : {};

            console.log("Using route:", routeName, routeParams);

            const requestPromise = new Promise((resolve, reject) => {
                if (existingPrimaryDiagnosis) {
                    router.put(route(routeName, routeParams), payload, {
                        onSuccess: (page) => {
                            console.log(
                                "Primary + Secondary update success:",
                                page
                            );
                            resolve(
                                page.props?.data || {
                                    primary_diagnosis:
                                        page.props?.updatedDiagnosis,
                                    secondary_diagnoses:
                                        page.props?.updatedSecondaryDiagnoses ||
                                        [],
                                }
                            );
                        },
                        onError: (errors) => {
                            console.error(
                                "Primary + Secondary update validation errors:",
                                errors
                            );
                            reject(errors);
                        },
                        preserveState: true,
                        preserveScroll: true,
                    });
                } else {
                    router.post(route(routeName), payload, {
                        onSuccess: (page) => {
                            console.log(
                                "Primary + Secondary create success:",
                                page
                            );
                            resolve(
                                page.props?.data || {
                                    primary_diagnosis: page.props?.newDiagnosis,
                                    secondary_diagnoses:
                                        page.props?.newSecondaryDiagnoses || [],
                                }
                            );
                        },
                        onError: (errors) => {
                            console.error(
                                "Primary + Secondary create validation errors:",
                                errors
                            );
                            reject(errors);
                        },
                        preserveState: true,
                        preserveScroll: true,
                    });
                }
            });

            const result = await requestPromise;
            console.log("Diagnosis saved successfully:", result);

            const successMessage = existingPrimaryDiagnosis
                ? "Diagnosis berhasil diperbarui"
                : "Diagnosis berhasil disimpan";

            const secondaryCount = result.secondary_diagnoses?.length || 0;
            const fullMessage =
                secondaryCount > 0
                    ? `${successMessage} (${secondaryCount} diagnosis sekunder)`
                    : successMessage;

            toast.success(fullMessage);

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
        setErrors(errors);

        if (errors.general) {
            setGeneralError(
                Array.isArray(errors.general)
                    ? errors.general[0]
                    : errors.general
            );
        }

        Object.entries(errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            toast.error(`${field}: ${message}`);
        });
    };

    const handleClose = useCallback(() => {
        console.log("Closing dialog...");
        setPrimaryFormData({
            icd_10_codes_diagnoses_id: "",
            diagnosis_notes: "",
            icd_10_codes_external_cause_id: "",
            external_cause_notes: "",
        });
        setSecondaryDiagnoses([]);
        setErrors({});
        setGeneralError("");
        setPrimaryDiagnosisSearch("");
        setSecondaryDiagnosisSearch("");
        setExternalCauseSearch("");
        onClose();
    }, [onClose]);

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

    // ✅ SIMPLE FIX: Ensure selected items are always available in dropdown
    const filteredPrimaryDiagnosisCodes = useMemo(() => {
        let filtered = primaryDiagnosisCodes.filter(
            (d) =>
                d.code
                    .toLowerCase()
                    .includes(primaryDiagnosisSearch.toLowerCase()) ||
                d.description
                    .toLowerCase()
                    .includes(primaryDiagnosisSearch.toLowerCase())
        );

        // ✅ SIMPLE: Add selected item if not in filtered results
        const selectedId = primaryFormData.icd_10_codes_diagnoses_id;
        const selectedData =
            existingPrimaryDiagnosis?.icd10_diagnosis ||
            existingPrimaryDiagnosis?.icd10Diagnosis;

        if (
            selectedId &&
            selectedData &&
            !filtered.find((item) => item.id.toString() === selectedId)
        ) {
            filtered = [selectedData, ...filtered];
        }

        return filtered;
    }, [
        primaryDiagnosisCodes,
        primaryDiagnosisSearch,
        primaryFormData.icd_10_codes_diagnoses_id,
        existingPrimaryDiagnosis,
    ]);

    const filteredSecondaryDiagnosisCodes = useMemo(() => {
        return secondaryDiagnosisCodes.filter(
            (d) =>
                d.code
                    .toLowerCase()
                    .includes(secondaryDiagnosisSearch.toLowerCase()) ||
                d.description
                    .toLowerCase()
                    .includes(secondaryDiagnosisSearch.toLowerCase())
        );
    }, [secondaryDiagnosisCodes, secondaryDiagnosisSearch]);

    const filteredExternalCauseCodes = useMemo(() => {
        let filtered = externalCauseCodes.filter(
            (c) =>
                c.code
                    .toLowerCase()
                    .includes(externalCauseSearch.toLowerCase()) ||
                c.description
                    .toLowerCase()
                    .includes(externalCauseSearch.toLowerCase())
        );

        // ✅ SIMPLE: Add selected item if not in filtered results
        const selectedId = primaryFormData.icd_10_codes_external_cause_id;
        const selectedData =
            existingPrimaryDiagnosis?.icd10_external_cause ||
            existingPrimaryDiagnosis?.icd10ExternalCause;

        if (
            selectedId &&
            selectedData &&
            !filtered.find((item) => item.id.toString() === selectedId)
        ) {
            filtered = [selectedData, ...filtered];
        }

        return filtered;
    }, [
        externalCauseCodes,
        externalCauseSearch,
        primaryFormData.icd_10_codes_external_cause_id,
        existingPrimaryDiagnosis,
    ]);

    const availableSecondaryDiagnosisCodes = useMemo(() => {
        const selectedSecondaryIds = secondaryDiagnoses.map(
            (sec) => sec.icd_10_codes_diagnoses_id
        );
        return filteredSecondaryDiagnosisCodes.filter(
            (code) =>
                !selectedSecondaryIds.includes(code.id.toString()) &&
                code.id.toString() !== primaryFormData.icd_10_codes_diagnoses_id
        );
    }, [
        filteredSecondaryDiagnosisCodes,
        secondaryDiagnoses,
        primaryFormData.icd_10_codes_diagnoses_id,
    ]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-gray-100">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Stethoscope className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <span className="text-gray-900">
                                {existingPrimaryDiagnosis
                                    ? "Edit Diagnosis"
                                    : "Tambah Diagnosis Baru"}
                            </span>
                            {existingPrimaryDiagnosis && (
                                <div className="text-sm font-normal text-gray-500 mt-1">
                                    Mengubah data diagnosis yang sudah ada
                                </div>
                            )}
                        </div>
                    </DialogTitle>
                    <DialogDescription className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                                Target:
                            </span>
                            <span className="font-semibold text-purple-700">
                                {getTargetDisplay()}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Diagnosis akan diterapkan pada item odontogram di
                            atas
                        </div>
                    </DialogDescription>
                </DialogHeader>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6">
                    {/* Primary Diagnosis Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-600" />
                                Diagnosis Primer (Wajib)
                            </CardTitle>
                            <CardDescription>
                                Diagnosis utama berdasarkan kode ICD-10
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label
                                    htmlFor="primary_diagnosis"
                                    className="text-base font-medium"
                                >
                                    Kode ICD-10 Diagnosis{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Ketik untuk mencari kode ICD-10 diagnosis primer..."
                                            value={primaryDiagnosisSearch}
                                            onChange={(e) => {
                                                setPrimaryDiagnosisSearch(
                                                    e.target.value
                                                );
                                                debouncedPrimaryDiagnosisSearch(
                                                    e.target.value
                                                );
                                            }}
                                            className="pl-10"
                                            disabled={!canEdit}
                                        />
                                        {primaryDiagnosisSearch && (
                                            <button
                                                onClick={() => {
                                                    setPrimaryDiagnosisSearch(
                                                        ""
                                                    );
                                                    loadPrimaryDiagnosisCodes(
                                                        ""
                                                    );
                                                }}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                type="button"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <Select
                                        value={
                                            primaryFormData.icd_10_codes_diagnoses_id
                                        }
                                        onValueChange={(value) =>
                                            handlePrimaryInputChange(
                                                "icd_10_codes_diagnoses_id",
                                                value
                                            )
                                        }
                                        disabled={!canEdit}
                                    >
                                        <SelectTrigger
                                            className={`${
                                                errors.icd_10_codes_diagnoses_id
                                                    ? "border-red-500 focus:border-red-500"
                                                    : "focus:border-purple-500"
                                            }`}
                                        >
                                            <SelectValue placeholder="Pilih kode ICD-10 diagnosis primer..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] overflow-y-auto">
                                            {filteredPrimaryDiagnosisCodes.length ===
                                            0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    {primaryDiagnosisSearch
                                                        ? `Tidak ada hasil untuk "${primaryDiagnosisSearch}"`
                                                        : "Ketik untuk mencari diagnosis primer"}
                                                </div>
                                            ) : (
                                                filteredPrimaryDiagnosisCodes.map(
                                                    (code) => (
                                                        <SelectItem
                                                            key={code.id}
                                                            value={code.id.toString()}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex flex-col py-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs">
                                                                        {
                                                                            code.code
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {
                                                                        code.description
                                                                    }
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>

                                    {errors.icd_10_codes_diagnoses_id && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.icd_10_codes_diagnoses_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="primary_diagnosis_notes"
                                    className="text-base font-medium"
                                >
                                    Catatan Diagnosis Primer
                                </Label>
                                <Textarea
                                    id="primary_diagnosis_notes"
                                    value={primaryFormData.diagnosis_notes}
                                    onChange={(e) =>
                                        handlePrimaryInputChange(
                                            "diagnosis_notes",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Catatan mengenai diagnosis primer..."
                                    rows={3}
                                    disabled={!canEdit}
                                    className="focus:border-purple-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Secondary Diagnoses Section - (unchanged, sudah bekerja dengan baik) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>Diagnosis Sekunder (Opsional)</span>
                            </CardTitle>
                            <CardDescription>
                                Diagnosis tambahan yang mendukung diagnosis
                                primer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Secondary diagnoses display and add functionality - unchanged */}
                            {secondaryDiagnoses.length > 0 && (
                                <div>
                                    <Label className="text-base font-medium mb-3 block">
                                        Diagnosis Sekunder Terpilih (
                                        {secondaryDiagnoses.length})
                                    </Label>
                                    <div className="space-y-3">
                                        {secondaryDiagnoses.map(
                                            (secondary, index) => {
                                                const diagnosisData =
                                                    secondary.diagnosis_data ||
                                                    secondaryDiagnosisCodes.find(
                                                        (code) =>
                                                            code.id.toString() ===
                                                            secondary.icd_10_codes_diagnoses_id
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            secondary.id ||
                                                            secondary.tempId ||
                                                            index
                                                        }
                                                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-blue-600 bg-white px-2 py-1 rounded border text-sm">
                                                                    {diagnosisData?.code ||
                                                                        "N/A"}
                                                                </span>
                                                                <span className="text-gray-800 font-medium">
                                                                    {diagnosisData?.description ||
                                                                        "Diagnosis tidak ditemukan"}
                                                                </span>
                                                            </div>
                                                            {canEdit && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRemoveSecondaryDiagnosis(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                                                Catatan
                                                                Diagnosis
                                                                Sekunder
                                                            </Label>
                                                            <Textarea
                                                                value={
                                                                    secondary.diagnosis_notes ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateSecondaryNotes(
                                                                        index,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Catatan untuk diagnosis sekunder ini..."
                                                                rows={2}
                                                                disabled={
                                                                    !canEdit
                                                                }
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}

                            {canEdit && (
                                <div>
                                    <Label className="text-base font-medium mb-3 block">
                                        Tambah Diagnosis Sekunder
                                    </Label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Ketik untuk mencari kode ICD-10 diagnosis sekunder..."
                                                value={secondaryDiagnosisSearch}
                                                onChange={(e) => {
                                                    setSecondaryDiagnosisSearch(
                                                        e.target.value
                                                    );
                                                    debouncedSecondaryDiagnosisSearch(
                                                        e.target.value
                                                    );
                                                }}
                                                className="pl-10"
                                            />
                                            {secondaryDiagnosisSearch && (
                                                <button
                                                    onClick={() => {
                                                        setSecondaryDiagnosisSearch(
                                                            ""
                                                        );
                                                        loadSecondaryDiagnosisCodes(
                                                            ""
                                                        );
                                                    }}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    type="button"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
                                            {availableSecondaryDiagnosisCodes.length ===
                                            0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    {secondaryDiagnosisSearch
                                                        ? `Tidak ada hasil untuk "${secondaryDiagnosisSearch}"`
                                                        : secondaryDiagnoses.length >
                                                          0
                                                        ? "Semua diagnosis tersedia telah dipilih"
                                                        : "Ketik untuk mencari diagnosis sekunder"}
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-200">
                                                    {availableSecondaryDiagnosisCodes.map(
                                                        (code) => (
                                                            <div
                                                                key={code.id}
                                                                className="p-3 hover:bg-gray-50 cursor-pointer"
                                                                onClick={() =>
                                                                    handleAddSecondaryDiagnosis(
                                                                        code.id.toString()
                                                                    )
                                                                }
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
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

                                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                            💡 <strong>Tips:</strong> Klik pada
                                            diagnosis di atas untuk
                                            menambahkannya sebagai diagnosis
                                            sekunder
                                        </div>
                                    </div>
                                </div>
                            )}

                            {secondaryDiagnoses.length === 0 && !canEdit && (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText
                                        size={48}
                                        className="mx-auto mb-4 text-blue-300"
                                    />
                                    <p>Tidak ada diagnosis sekunder</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* External Cause Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ExternalLink className="h-5 w-5 text-orange-600" />
                                Penyebab Eksternal (Opsional)
                            </CardTitle>
                            <CardDescription>
                                Faktor eksternal yang menyebabkan kondisi dental
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label
                                    htmlFor="external_cause_code"
                                    className="text-base font-medium"
                                >
                                    Kode ICD-10 External Cause
                                </Label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Ketik untuk mencari kode external cause..."
                                            value={externalCauseSearch}
                                            onChange={(e) => {
                                                setExternalCauseSearch(
                                                    e.target.value
                                                );
                                                debouncedExternalCauseSearch(
                                                    e.target.value
                                                );
                                            }}
                                            className="pl-10"
                                            disabled={!canEdit}
                                        />
                                        {externalCauseSearch && (
                                            <button
                                                onClick={() => {
                                                    setExternalCauseSearch("");
                                                    loadExternalCauseCodes("");
                                                }}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                type="button"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <Select
                                        value={
                                            primaryFormData.icd_10_codes_external_cause_id
                                        }
                                        onValueChange={(value) =>
                                            handlePrimaryInputChange(
                                                "icd_10_codes_external_cause_id",
                                                value
                                            )
                                        }
                                        disabled={!canEdit}
                                    >
                                        <SelectTrigger className="focus:border-orange-500">
                                            <SelectValue placeholder="Pilih kode external cause..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] overflow-y-auto">
                                            {filteredExternalCauseCodes.length ===
                                            0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    {externalCauseSearch
                                                        ? `Tidak ada hasil untuk "${externalCauseSearch}"`
                                                        : "Ketik untuk mencari external cause"}
                                                </div>
                                            ) : (
                                                filteredExternalCauseCodes.map(
                                                    (code) => (
                                                        <SelectItem
                                                            key={code.id}
                                                            value={code.id.toString()}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex flex-col py-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs">
                                                                        {
                                                                            code.code
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {
                                                                        code.description
                                                                    }
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="external_cause_notes"
                                    className="text-base font-medium"
                                >
                                    Catatan Penyebab Eksternal
                                </Label>
                                <Textarea
                                    id="external_cause_notes"
                                    value={primaryFormData.external_cause_notes}
                                    onChange={(e) =>
                                        handlePrimaryInputChange(
                                            "external_cause_notes",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Catatan mengenai penyebab eksternal..."
                                    rows={3}
                                    disabled={!canEdit}
                                    className="focus:border-orange-500"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            {canEdit ? (
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Anda dapat mengedit data diagnosis
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
                                        !primaryFormData.icd_10_codes_diagnoses_id
                                    }
                                    className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {existingPrimaryDiagnosis
                                                ? "Update Diagnosis"
                                                : "Simpan Diagnosis"}
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

export default React.memo(DentalDiagnosisForm);
