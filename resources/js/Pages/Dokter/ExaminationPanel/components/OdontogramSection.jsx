// resources/js/Pages/Dokter/ExaminationPanel/components/OdontogramSection.jsx - CLEAN VERSION
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { router } from "@inertiajs/react";
import { toast } from "react-hot-toast";
import { usePage } from "@inertiajs/react";
import {
    Activity,
    BarChart3,
    Printer,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Info,
    Stethoscope,
    Settings,
} from "lucide-react";
import ToothIcon from "@/Components/Icons/ToothIcon";

// Import odontogram components
import OdontogramCanvas from "./Odontogram/OdontogramCanvas";
import OdontogramControls from "./Odontogram/OdontogramControls";
import OdontogramNotes from "./Odontogram/OdontogramNotes";
import OdontogramMetadata from "./Odontogram/OdontogramMetadata";
import OdontogramActions from "./Odontogram/OdontogramActions";
import DentalManagementSection from "./Odontogram/DentalManagementSection";
import OdontogramSummary from "./Odontogram/OdontogramSummary";
import OdontogramPrintView from "./Odontogram/OdontogramPrintView";

// Constants
import { ODONTOGRAM_MODE } from "./Odontogram/OdontogramConstants";

const OdontogramSection = ({
    odontogram,
    appointment,
    patient,
    diagnoses = [],
    treatments = [],
    canEdit = true,
    onBack,
    onNext,
}) => {
    const { props } = usePage();
    const currentUser = props.auth?.user;

    // Determine actual edit permissions based on user role and odontogram status
    const getActualCanEdit = useCallback(() => {
        if (!odontogram) return false;
        if (odontogram.is_finalized) return false;
        if (currentUser?.role !== "doctor") return false;
        return canEdit;
    }, [odontogram, currentUser, canEdit]);

    const actualCanEdit = getActualCanEdit();

    // Enhanced state management
    const [activeTab, setActiveTab] = useState("odontogram");
    const [activeMode, setActiveMode] = useState(ODONTOGRAM_MODE.DEFAULT);
    const [generalNotes, setGeneralNotes] = useState(
        odontogram?.general_notes || ""
    );
    const [isLoading, setIsLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [odontogramData, setOdontogramData] = useState({
        conditions: [],
        bridges: [],
        indicators: [],
    });
    const [odontogramStatistics, setOdontogramStatistics] = useState(null);

    // Metadata state
    const [occlusion, setOcclusion] = useState(
        odontogram?.occlusion || "normal"
    );
    const [torusPalatinus, setTorusPalatinus] = useState(
        odontogram?.torus_palatinus || "none"
    );
    const [torusMandibularis, setTorusMandibularis] = useState(
        odontogram?.torus_mandibularis || "none"
    );
    const [palatum, setPalatum] = useState(odontogram?.palatum || "medium");
    const [diastema, setDiastema] = useState(odontogram?.diastema || "");
    const [gigiAnomali, setGigiAnomali] = useState(
        odontogram?.gigi_anomali || ""
    );
    const [others, setOthers] = useState(odontogram?.others || "");

    // Auto-save functionality
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
    const [autoSaveInterval, setAutoSaveInterval] = useState(null);

    // Error handling state
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);

    // Load odontogram data when component mounts
    useEffect(() => {
        if (odontogram?.id) {
            loadOdontogramData(odontogram.id);
        }
    }, [odontogram?.id]);

    // Show flash messages
    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    // Auto-save setup
    useEffect(() => {
        if (autoSaveEnabled && hasUnsavedChanges && actualCanEdit) {
            const interval = setInterval(() => {
                saveOdontogramData(true); // Silent save
            }, 30000); // Auto-save every 30 seconds

            setAutoSaveInterval(interval);
            return () => clearInterval(interval);
        }
    }, [autoSaveEnabled, hasUnsavedChanges, actualCanEdit]);

    // Cleanup auto-save on unmount
    useEffect(() => {
        return () => {
            if (autoSaveInterval) {
                clearInterval(autoSaveInterval);
            }
        };
    }, [autoSaveInterval]);

    // Track changes for unsaved state
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [
        generalNotes,
        occlusion,
        torusPalatinus,
        torusMandibularis,
        palatum,
        diastema,
        gigiAnomali,
        others,
        odontogramData,
    ]);

    // Function to load odontogram data with enhanced error handling
    const loadOdontogramData = async (odontogramId) => {
        setIsLoading(true);
        setErrors([]);

        try {
            const response = await fetch(
                route("odontogram.get-canvas-data", odontogramId)
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            if (result.success && result.data) {
                setOdontogramData(result.data);
                setOdontogramStatistics(result.odontogram);

                // Update other fields if needed
                if (result.odontogram) {
                    setGeneralNotes(result.odontogram.general_notes || "");
                    setOcclusion(result.odontogram.occlusion || "normal");
                    setTorusPalatinus(
                        result.odontogram.torus_palatinus || "none"
                    );
                    setTorusMandibularis(
                        result.odontogram.torus_mandibularis || "none"
                    );
                    setPalatum(result.odontogram.palatum || "medium");
                    setDiastema(result.odontogram.diastema || "");
                    setGigiAnomali(result.odontogram.gigi_anomali || "");
                    setOthers(result.odontogram.others || "");
                }

                setHasUnsavedChanges(false);
                validateOdontogramData(result.data);
            } else {
                throw new Error(
                    result.message || "Failed to load odontogram data"
                );
            }
        } catch (error) {
            setErrors((prev) => [
                ...prev,
                `Gagal memuat data odontogram: ${error.message}`,
            ]);
            toast.error("Gagal memuat data odontogram");
        } finally {
            setIsLoading(false);
        }
    };

    // Validate odontogram data and show warnings
    const validateOdontogramData = (data) => {
        const newWarnings = [];

        // Check for conditions without diagnosis
        // const conditionsWithoutDiagnosis =
        //     data.conditions?.filter((c) => !c.diagnosis_id) || [];
        // if (conditionsWithoutDiagnosis.length > 0) {
        //     newWarnings.push(
        //         `${conditionsWithoutDiagnosis.length} kondisi gigi belum memiliki diagnosis`
        //     );
        // }

        // Check for conditions without treatment plan
        // const conditionsWithoutTreatment =
        //     data.conditions?.filter((c) => !c.planned_treatment_id) || [];
        // if (conditionsWithoutTreatment.length > 0) {
        //     newWarnings.push(
        //         `${conditionsWithoutTreatment.length} kondisi gigi belum memiliki rencana perawatan`
        //     );
        // }

        // Check for urgent conditions
        const urgentConditions =
            data.conditions?.filter((c) => c.priority === "urgent") || [];
        if (urgentConditions.length > 0) {
            newWarnings.push(
                `${urgentConditions.length} kondisi gigi memerlukan perawatan segera`
            );
        }

        setWarnings(newWarnings);
    };

    // Enhanced dental data update handler
    const handleDentalDataUpdate = useCallback(() => {
        if (odontogram?.id) {
            loadOdontogramData(odontogram.id);
        }
    }, [odontogram?.id]);

    // Handler for mode change
    const handleModeChange = (mode) => {
        if (!actualCanEdit) {
            toast.error(
                "Anda tidak memiliki izin untuk mengedit odontogram ini"
            );
            return;
        }
        setActiveMode(mode);
    };

    // Handler for canvas change
    const handleCanvasChange = (newData) => {
        if (!actualCanEdit) {
            toast.error(
                "Anda tidak memiliki izin untuk mengedit odontogram ini"
            );
            return;
        }

        setOdontogramData((prevData) => ({
            ...prevData,
            ...newData,
        }));
    };

    // Enhanced save with better error handling and progress tracking
    const saveOdontogramData = async (silent = false) => {
        if (!odontogram?.id || !actualCanEdit) {
            if (!silent) {
                toast.error(
                    "Anda tidak memiliki izin untuk menyimpan odontogram ini"
                );
            }
            return false;
        }

        setIsLoading(true);
        setSaveSuccess(false);
        setErrors([]);

        try {
            console.log("Saving odontogram data:", odontogramData);

            // Step 1: Save general metadata first
            await saveMetadata();

            // Step 2: Save tooth conditions (even if empty - this will delete removed conditions)
            await saveToothConditions();

            // Step 3: Save bridges (even if empty - this will delete removed bridges)
            await saveBridges();

            // Step 4: Save indicators (even if empty - this will delete removed indicators)
            await saveIndicators();

            if (!silent) {
                toast.success("Odontogram berhasil disimpan");
            }

            setSaveSuccess(true);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);

            // Reload data after successful save
            setTimeout(() => {
                loadOdontogramData(odontogram.id);
            }, 1000);

            return true;
        } catch (error) {
            const errorMessage = error.message || "Unknown error";
            setErrors((prev) => [
                ...prev,
                `Gagal menyimpan odontogram: ${errorMessage}`,
            ]);

            if (!silent) {
                toast.error(`Gagal menyimpan odontogram: ${errorMessage}`);
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions for saving
    const saveMetadata = () => {
        return new Promise((resolve, reject) => {
            const data = {
                general_notes: generalNotes,
                occlusion,
                torus_palatinus: torusPalatinus,
                torus_mandibularis: torusMandibularis,
                palatum,
                diastema,
                gigi_anomali: gigiAnomali,
                others,
            };

            router.post(route("odontogram.update", odontogram.id), data, {
                onSuccess: (page) => {
                    resolve(page);
                },
                onError: (errors) => {
                    reject(new Error(Object.values(errors).flat().join(", ")));
                },
                preserveScroll: true,
                preserveState: true,
            });
        });
    };

    const saveToothConditions = () => {
        return new Promise((resolve, reject) => {
            const data = {
                conditions: (odontogramData.conditions || []).map(
                    (condition) => {
                        // Convert condition_code from number to string if needed
                        let conditionCode = condition.condition_code;
                        if (typeof conditionCode === "number") {
                            conditionCode = convertModeToString(conditionCode);
                        }

                        // Default fallback
                        if (
                            !conditionCode ||
                            typeof conditionCode !== "string"
                        ) {
                            conditionCode = "CARIES";
                        }

                        return {
                            ...condition,
                            tooth_number: condition.tooth_number || "",
                            condition_code: conditionCode,
                            surface: condition.surface || null,
                            geometry_data: condition.geometry_data || null,
                            diagnosis_id: condition.diagnosis_id || null,
                            icd_10_code: condition.icd_10_code || null,
                        };
                    }
                ),
            };

            console.log("Sending conditions data:", data);

            router.post(
                route("odontogram.save-tooth-conditions", odontogram.id),
                data,
                {
                    onSuccess: (page) => {
                        console.log("Conditions saved successfully");
                        resolve(page);
                    },
                    onError: (errors) => {
                        console.error("Error saving conditions:", errors);
                        reject(
                            new Error(Object.values(errors).flat().join(", "))
                        );
                    },
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        });
    };

    const saveBridges = () => {
        return new Promise((resolve, reject) => {
            const data = {
                bridges: (odontogramData.bridges || [])
                    .map((bridge) => {
                        // Convert from/to format to connected_teeth array if needed
                        let connectedTeeth = bridge.connected_teeth || [];

                        // Handle backward compatibility - convert from/to to connected_teeth
                        if (
                            !connectedTeeth.length &&
                            bridge.from &&
                            bridge.to
                        ) {
                            connectedTeeth = [bridge.from, bridge.to];
                        }

                        // Ensure we have at least 2 connected teeth
                        if (connectedTeeth.length < 2) {
                            // Skip this bridge if it doesn't have proper connections
                            return null;
                        }

                        return {
                            bridge_name:
                                bridge.bridge_name || bridge.name || "Bridge",
                            connected_teeth: connectedTeeth,
                            bridge_type:
                                bridge.bridge_type || bridge.type || "fixed",
                            bridge_geometry:
                                bridge.bridge_geometry ||
                                bridge.geometry ||
                                null,
                            diagnosis_id: bridge.diagnosis_id || null,
                            icd_10_code: bridge.icd_10_code || null,
                            diagnosis_notes: bridge.diagnosis_notes || null,
                            planned_treatment_id:
                                bridge.planned_treatment_id || null,
                            treatment_notes: bridge.treatment_notes || null,
                            status: bridge.status || "planned",
                        };
                    })
                    .filter(Boolean), // Remove null entries
            };

            console.log("Sending bridges data:", data);

            router.post(
                route("odontogram.save-tooth-bridges", odontogram.id),
                data,
                {
                    onSuccess: (page) => {
                        console.log("Bridges saved successfully");
                        resolve(page);
                    },
                    onError: (errors) => {
                        console.error("Error saving bridges:", errors);
                        reject(
                            new Error(Object.values(errors).flat().join(", "))
                        );
                    },
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        });
    };

    // Helper function to convert mode number to string enum
    const convertModeToString = (mode) => {
        const modeToStringMap = {
            // Condition codes
            [ODONTOGRAM_MODE.AMF]: "AMF",
            [ODONTOGRAM_MODE.COF]: "COF",
            [ODONTOGRAM_MODE.FIS]: "FIS",
            [ODONTOGRAM_MODE.NVT]: "NVT",
            [ODONTOGRAM_MODE.RCT]: "RCT",
            [ODONTOGRAM_MODE.NON]: "NON",
            [ODONTOGRAM_MODE.UNE]: "UNE",
            [ODONTOGRAM_MODE.PRE]: "PRE",
            [ODONTOGRAM_MODE.ANO]: "ANO",
            [ODONTOGRAM_MODE.CARIES]: "CARIES",
            [ODONTOGRAM_MODE.CFR]: "CFR",
            [ODONTOGRAM_MODE.FMC]: "FMC",
            [ODONTOGRAM_MODE.POC]: "POC",
            [ODONTOGRAM_MODE.RRX]: "RRX",
            [ODONTOGRAM_MODE.MIS]: "MIS",
            [ODONTOGRAM_MODE.IPX]: "IPX",
            [ODONTOGRAM_MODE.FRM_ACR]: "FRM_ACR",
            [ODONTOGRAM_MODE.BRIDGE]: "BRIDGE",

            // Indicator types
            [ODONTOGRAM_MODE.ARROW_TOP_LEFT]: "ARROW_TOP_LEFT",
            [ODONTOGRAM_MODE.ARROW_TOP_RIGHT]: "ARROW_TOP_RIGHT",
            [ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT]: "ARROW_TOP_TURN_LEFT",
            [ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT]: "ARROW_TOP_TURN_RIGHT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT]: "ARROW_BOTTOM_LEFT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT]: "ARROW_BOTTOM_RIGHT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT]: "ARROW_BOTTOM_TURN_LEFT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT]:
                "ARROW_BOTTOM_TURN_RIGHT",
        };

        return modeToStringMap[mode] || mode;
    };

    const saveIndicators = () => {
        return new Promise((resolve, reject) => {
            if (
                !odontogramData.indicators ||
                !Array.isArray(odontogramData.indicators)
            ) {
                // Send empty array to clear all indicators
                const data = { indicators: [] };

                router.post(
                    route("odontogram.save-tooth-indicators", odontogram.id),
                    data,
                    {
                        onSuccess: (page) => {
                            console.log("Indicators cleared successfully");
                            resolve(page);
                        },
                        onError: (errors) => {
                            console.error("Error clearing indicators:", errors);
                            reject(
                                new Error(
                                    `Indicator save failed: ${Object.values(
                                        errors
                                    )
                                        .flat()
                                        .join(", ")}`
                                )
                            );
                        },
                        preserveScroll: true,
                        preserveState: true,
                    }
                );
                return;
            }

            const data = {
                indicators: odontogramData.indicators
                    .map((indicator, index) => {
                        try {
                            // Map tooth/type to tooth_number/indicator_type for backward compatibility
                            const toothNumber =
                                indicator.tooth_number || indicator.tooth || "";
                            let indicatorType =
                                indicator.indicator_type || indicator.type;

                            // Convert number to string if needed
                            if (typeof indicatorType === "number") {
                                indicatorType =
                                    convertModeToString(indicatorType);
                            }

                            // Validate indicator type against allowed values
                            const validIndicatorTypes = [
                                "ARROW_TOP_LEFT",
                                "ARROW_TOP_RIGHT",
                                "ARROW_TOP_TURN_LEFT",
                                "ARROW_TOP_TURN_RIGHT",
                                "ARROW_BOTTOM_LEFT",
                                "ARROW_BOTTOM_RIGHT",
                                "ARROW_BOTTOM_TURN_LEFT",
                                "ARROW_BOTTOM_TURN_RIGHT",
                            ];

                            if (!validIndicatorTypes.includes(indicatorType)) {
                                indicatorType = "ARROW_TOP_LEFT";
                            }

                            // Validate required fields
                            if (!toothNumber) {
                                return null;
                            }

                            return {
                                tooth_number: toothNumber,
                                indicator_type: indicatorType,
                                geometry_data:
                                    indicator.geometry_data ||
                                    indicator.geometry ||
                                    null,
                                notes: indicator.notes || null,
                            };
                        } catch (indicatorProcessError) {
                            return null; // Skip this indicator
                        }
                    })
                    .filter(Boolean), // Remove null entries
            };

            console.log("Sending indicators data:", data);

            router.post(
                route("odontogram.save-tooth-indicators", odontogram.id),
                data,
                {
                    onSuccess: (page) => {
                        console.log("Indicators saved successfully");
                        resolve(page);
                    },
                    onError: (errors) => {
                        console.error("Error saving indicators:", errors);
                        reject(
                            new Error(
                                `Indicator save failed: ${Object.values(errors)
                                    .flat()
                                    .join(", ")}`
                            )
                        );
                    },
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        });
    };

    // Render error and warning messages
    const renderMessages = () => {
        if (errors.length === 0 && warnings.length === 0) return null;

        return (
            <div className="space-y-2 mb-4">
                {errors.map((error, index) => (
                    <div
                        key={`error-${index}`}
                        className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md"
                    >
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                ))}

                {warnings.map((warning, index) => (
                    <div
                        key={`warning-${index}`}
                        className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                    >
                        <Info className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-yellow-700">
                            {warning}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    // Render role-based info
    const renderRoleBasedInfo = () => {
        if (currentUser?.role === "patient") {
            return (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">Info:</span> Anda dapat
                        melihat odontogram Anda, tetapi tidak dapat mengeditnya.
                    </p>
                </div>
            );
        }

        if (currentUser?.role === "employee") {
            return (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Info:</span> Anda dapat
                        melihat odontogram pasien, tetapi hanya dokter yang
                        dapat mengeditnya.
                    </p>
                </div>
            );
        }

        if (currentUser?.role === "doctor" && odontogram?.is_finalized) {
            return (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700">
                        <span className="font-medium">Info:</span> Odontogram
                        ini telah difinalisasi dan tidak dapat diedit.
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <ToothIcon className="mr-2" size={20} />
                            Odontogram Pemeriksaan
                            {currentUser?.role && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    (
                                    {currentUser.role === "doctor"
                                        ? "Dokter"
                                        : currentUser.role === "patient"
                                        ? "Pasien"
                                        : "Karyawan"}
                                    )
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            {hasUnsavedChanges && actualCanEdit && (
                                <span className="text-xs text-orange-600 flex items-center">
                                    <RefreshCw size={12} className="mr-1" />
                                    Belum disimpan
                                </span>
                            )}

                            {lastSaved && (
                                <span className="text-xs text-green-600 flex items-center">
                                    <CheckCircle size={12} className="mr-1" />
                                    Disimpan {lastSaved.toLocaleTimeString()}
                                </span>
                            )}

                            {actualCanEdit && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setAutoSaveEnabled(!autoSaveEnabled)
                                    }
                                    className={
                                        autoSaveEnabled
                                            ? "bg-green-50 text-green-700"
                                            : ""
                                    }
                                >
                                    Auto-save {autoSaveEnabled ? "ON" : "OFF"}
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Role-based information */}
                    {renderRoleBasedInfo()}

                    {/* Error and warning messages */}
                    {renderMessages()}

                    {/* Enhanced Tabs with clearer names */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger
                                value="odontogram"
                                className="flex items-center"
                            >
                                <ToothIcon size={16} className="mr-1" />
                                Canvas
                            </TabsTrigger>
                            <TabsTrigger
                                value="diagnosis"
                                className="flex items-center"
                            >
                                <Stethoscope size={16} className="mr-1" />
                                Diagnosis & Perawatan
                            </TabsTrigger>
                            <TabsTrigger
                                value="summary"
                                className="flex items-center"
                            >
                                <BarChart3 size={16} className="mr-1" />
                                Ringkasan
                            </TabsTrigger>
                            <TabsTrigger
                                value="print"
                                className="flex items-center"
                            >
                                <Printer size={16} className="mr-1" />
                                Cetak
                            </TabsTrigger>
                            {/* <TabsTrigger
                                value="settings"
                                className="flex items-center"
                                disabled={!actualCanEdit}
                            >
                                <Settings size={16} className="mr-1" />
                                Pengaturan
                            </TabsTrigger> */}
                        </TabsList>

                        <TabsContent value="odontogram" className="space-y-6">
                            {/* Canvas and Controls */}
                            <div className="flex flex-col space-y-6">
                                <div className="relative flex justify-center items-center bg-white p-3 border rounded-md">
                                    <OdontogramCanvas
                                        data={odontogramData}
                                        activeMode={activeMode}
                                        onChange={handleCanvasChange}
                                        isLoading={isLoading}
                                        canEdit={actualCanEdit}
                                        width={1300}
                                        height={600}
                                    />
                                </div>

                                <OdontogramControls
                                    activeMode={activeMode}
                                    onModeChange={handleModeChange}
                                    canEdit={actualCanEdit}
                                    isLoading={isLoading}
                                />

                                <div className="bg-white p-4 border rounded-md shadow-sm">
                                    <OdontogramNotes
                                        generalNotes={generalNotes}
                                        setGeneralNotes={setGeneralNotes}
                                        canEdit={actualCanEdit}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Metadata section */}
                            <div className="bg-white p-4 border rounded-md shadow-sm">
                                <OdontogramMetadata
                                    occlusion={occlusion}
                                    setOcclusion={setOcclusion}
                                    torusPalatinus={torusPalatinus}
                                    setTorusPalatinus={setTorusPalatinus}
                                    torusMandibularis={torusMandibularis}
                                    setTorusMandibularis={setTorusMandibularis}
                                    palatum={palatum}
                                    setPalatum={setPalatum}
                                    diastema={diastema}
                                    setDiastema={setDiastema}
                                    gigiAnomali={gigiAnomali}
                                    setGigiAnomali={setGigiAnomali}
                                    others={others}
                                    setOthers={setOthers}
                                    canEdit={actualCanEdit}
                                    isLoading={isLoading}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="diagnosis">
                            <DentalManagementSection
                                odontogramData={odontogramData}
                                canEdit={actualCanEdit}
                                onDataUpdate={handleDentalDataUpdate}
                            />
                        </TabsContent>

                        <TabsContent value="summary">
                            <OdontogramSummary
                                odontogramData={odontogramData}
                                statistics={odontogramStatistics}
                            />
                        </TabsContent>

                        <TabsContent value="print">
                            <OdontogramPrintView
                                odontogram={odontogram}
                                patient={patient}
                                doctor={appointment?.doctor}
                                appointment={appointment}
                                odontogramData={odontogramData}
                                statistics={odontogramStatistics}
                            />
                        </TabsContent>

                        {/* <TabsContent value="settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pengaturan Odontogram</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Auto-save
                                                </label>
                                                <p className="text-xs text-gray-500">
                                                    Simpan otomatis setiap 30
                                                    detik
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setAutoSaveEnabled(
                                                        !autoSaveEnabled
                                                    )
                                                }
                                                className={
                                                    autoSaveEnabled
                                                        ? "bg-green-50 text-green-700"
                                                        : ""
                                                }
                                            >
                                                {autoSaveEnabled ? "ON" : "OFF"}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Reload Data
                                                </label>
                                                <p className="text-xs text-gray-500">
                                                    Muat ulang data dari server
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    loadOdontogramData(
                                                        odontogram.id
                                                    )
                                                }
                                                disabled={isLoading}
                                            >
                                                <RefreshCw
                                                    size={16}
                                                    className={
                                                        isLoading
                                                            ? "animate-spin"
                                                            : ""
                                                    }
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent> */}
                    </Tabs>

                    {/* Actions section - Always visible */}
                    <OdontogramActions
                        onSave={() => saveOdontogramData(false)}
                        onBack={onBack}
                        onNext={onNext}
                        canEdit={actualCanEdit}
                        isLoading={isLoading}
                        data={odontogramData}
                        patient={patient}
                        currentUser={currentUser}
                        odontogram={odontogram}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default OdontogramSection;
