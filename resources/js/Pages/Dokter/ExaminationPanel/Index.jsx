// File: resources/js/Pages/Dokter/ExaminationPanel/Index.jsx (Enhanced Full-Width)
import React, { useState, useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
    User,
    FileText,
    Activity,
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    X,
    UserX,
    CalendarPlus,
    Info,
    Edit,
    Eye,
} from "lucide-react";

// Import ToothIcon kustom dari Components/icons
import ToothIcon from "@/Components/Icons/ToothIcon";

// Import component sections
import PatientInfoSection from "./components/PatientInfoSection";
import MedicalHistorySection from "./components/MedicalHistorySection";
import OdontogramSection from "./components/OdontogramSection";
// import AppointmentSection from "./components/AppointmentSection";

// Import layout
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

// Enhanced ExaminationHeader Component
const ExaminationHeader = ({
    patient,
    appointment,
    appointmentContext,
    appointmentHistory = [],
    formatDate,
    onStatusChange,
}) => {
    // Status badge styling
    const getStatusBadgeClass = (status) => {
        const statusColors = {
            scheduled: "bg-blue-100 text-blue-800",
            confirmed: "bg-green-100 text-green-800",
            in_progress: "bg-yellow-100 text-yellow-800",
            completed: "bg-purple-100 text-purple-800",
            canceled: "bg-red-100 text-red-800",
            no_show: "bg-gray-100 text-gray-800",
        };
        return statusColors[status] || "bg-gray-100 text-gray-800";
    };

    const StatusBadge = ({ status }) => {
        const statusLabels = {
            scheduled: "Terjadwal",
            confirmed: "Dikonfirmasi",
            in_progress: "Sedang Berlangsung",
            completed: "Selesai",
            canceled: "Dibatalkan",
            no_show: "Tidak Hadir",
        };

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    status
                )}`}
            >
                {statusLabels[status]}
            </span>
        );
    };

    const handleStatusChange = (newStatus) => {
        const statusMessages = {
            confirmed: "mengkonfirmasi appointment ini?",
            completed: "menyelesaikan appointment ini?",
            canceled: "membatalkan appointment ini?",
            no_show: "menandai pasien tidak hadir?",
        };

        if (confirm(`Apakah Anda yakin ingin ${statusMessages[newStatus]}`)) {
            onStatusChange(newStatus);
        }
    };

    const getAvailableStatusActions = () => {
        const currentStatus = appointment.status;
        const actions = [];

        switch (currentStatus) {
            case "scheduled":
                actions.push(
                    {
                        status: "confirmed",
                        label: "Konfirmasi",
                        icon: CheckCircle,
                        variant: "default",
                    },
                    {
                        status: "canceled",
                        label: "Batalkan",
                        icon: X,
                        variant: "destructive",
                    },
                    {
                        status: "no_show",
                        label: "Tidak Hadir",
                        icon: UserX,
                        variant: "secondary",
                    }
                );
                break;
            case "confirmed":
                actions.push(
                    {
                        status: "completed",
                        label: "Selesai",
                        icon: CheckCircle,
                        variant: "default",
                    },
                    {
                        status: "canceled",
                        label: "Batalkan",
                        icon: X,
                        variant: "destructive",
                    },
                    {
                        status: "no_show",
                        label: "Tidak Hadir",
                        icon: UserX,
                        variant: "secondary",
                    }
                );
                break;
            case "in_progress":
                actions.push({
                    status: "completed",
                    label: "Selesai",
                    icon: CheckCircle,
                    variant: "default",
                });
                break;
            case "completed":
            case "canceled":
            case "no_show":
                break;
        }

        return actions;
    };

    return (
        <div className="space-y-4 mb-6">
            {/* Main Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link
                        href={route("doctor.appointments.today")}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-600"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Pemeriksaan Pasien
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {patient.name}{" "}
                            {patient.no_rm ? `(No. RM: ${patient.no_rm})` : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {/* Status Actions */}
                    <div className="flex items-center space-x-2">
                        {getAvailableStatusActions().map((action, index) => {
                            const IconComponent = action.icon;
                            return (
                                <Button
                                    key={index}
                                    variant={action.variant}
                                    size="sm"
                                    onClick={() =>
                                        handleStatusChange(action.status)
                                    }
                                    className="flex items-center space-x-1"
                                >
                                    <IconComponent className="h-4 w-4" />
                                    <span>{action.label}</span>
                                </Button>
                            );
                        })}
                    </div>

                    <div className="h-6 border-l border-gray-300"></div>

                    {/* Current Status Badge */}
                    <StatusBadge status={appointment.status} />

                    {/* Appointment Date */}
                    <span className="text-gray-600 text-sm">
                        {formatDate(appointment.appointment_date)}
                    </span>
                </div>
            </div>

            {/* Appointment Context Alert */}
            {appointmentContext && (
                <Alert
                    variant={
                        appointmentContext.mode === "create_new"
                            ? "default"
                            : appointmentContext.can_edit
                            ? "default"
                            : "default"
                    }
                    className={
                        appointmentContext.mode === "create_new"
                            ? "border-blue-200 bg-blue-50"
                            : appointmentContext.can_edit
                            ? "border-green-200 bg-green-50"
                            : "border-orange-200 bg-orange-50"
                    }
                >
                    <Info className="h-4 w-4" />
                    <AlertTitle className="flex items-center space-x-2">
                        <span>Status Appointment</span>
                        {appointmentContext.mode === "show_next" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border">
                                {appointmentContext.can_edit ? (
                                    <>
                                        <Edit className="h-3 w-3 mr-1" />
                                        Dapat Diedit
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-3 w-3 mr-1" />
                                        Hanya Lihat
                                    </>
                                )}
                            </span>
                        )}
                    </AlertTitle>
                    <AlertDescription>
                        {appointmentContext.message}
                    </AlertDescription>
                </Alert>
            )}

            {/* Enhanced History Summary */}
            {appointmentHistory && appointmentHistory.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium text-gray-700">
                                Total {appointmentHistory.length} appointment
                                untuk pasien ini
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            Lihat detail di tab Appointment
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ExaminationPanel({
    appointment,
    patient,
    medicalHistory,
    bloodTypes,
    existingMedicalRecord,
    odontogram,
    diagnoses = [],
    treatments = [],
    appointmentContext = null, // Enhanced appointment context
    appointmentHistory = [], // Complete appointment history
    canEdit = true,
}) {
    const { auth, flash = {} } = usePage().props;
    const [activeTab, setActiveTab] = useState("patient-info");
    const [formState, setFormState] = useState({
        // Medical history form state
        medicalHistoryData: {
            blood_type: medicalHistory?.blood_type || "",
            blood_pressure: medicalHistory?.blood_pressure || "",
            blood_pressure_status:
                medicalHistory?.blood_pressure_status || "normal",
            has_heart_disease: medicalHistory?.has_heart_disease || false,
            heart_disease_note: medicalHistory?.heart_disease_note || "",
            has_diabetes: medicalHistory?.has_diabetes || false,
            diabetes_note: medicalHistory?.diabetes_note || "",
            has_hemophilia: medicalHistory?.has_hemophilia || false,
            hemophilia_note: medicalHistory?.hemophilia_note || "",
            has_hepatitis: medicalHistory?.has_hepatitis || false,
            hepatitis_note: medicalHistory?.hepatitis_note || "",
            has_gastritis: medicalHistory?.has_gastritis || false,
            gastritis_note: medicalHistory?.gastritis_note || "",
            has_other_disease: medicalHistory?.has_other_disease || false,
            other_disease_note: medicalHistory?.other_disease_note || "",
            has_drug_allergy: medicalHistory?.has_drug_allergy || false,
            drug_allergy_note: medicalHistory?.drug_allergy_note || "",
            has_food_allergy: medicalHistory?.has_food_allergy || false,
            food_allergy_note: medicalHistory?.food_allergy_note || "",
        },
        notes: existingMedicalRecord?.notes || "",
    });

    // Effect to update formState when medicalHistory changes
    useEffect(() => {
        if (medicalHistory) {
            setFormState((prev) => ({
                ...prev,
                medicalHistoryData: {
                    blood_type: medicalHistory.blood_type || "",
                    blood_pressure: medicalHistory.blood_pressure || "",
                    blood_pressure_status:
                        medicalHistory.blood_pressure_status || "normal",
                    has_heart_disease: Boolean(
                        medicalHistory.has_heart_disease
                    ),
                    heart_disease_note: medicalHistory.heart_disease_note || "",
                    has_diabetes: Boolean(medicalHistory.has_diabetes),
                    diabetes_note: medicalHistory.diabetes_note || "",
                    has_hemophilia: Boolean(medicalHistory.has_hemophilia),
                    hemophilia_note: medicalHistory.hemophilia_note || "",
                    has_hepatitis: Boolean(medicalHistory.has_hepatitis),
                    hepatitis_note: medicalHistory.hepatitis_note || "",
                    has_gastritis: Boolean(medicalHistory.has_gastritis),
                    gastritis_note: medicalHistory.gastritis_note || "",
                    has_other_disease: Boolean(
                        medicalHistory.has_other_disease
                    ),
                    other_disease_note: medicalHistory.other_disease_note || "",
                    has_drug_allergy: Boolean(medicalHistory.has_drug_allergy),
                    drug_allergy_note: medicalHistory.drug_allergy_note || "",
                    has_food_allergy: Boolean(medicalHistory.has_food_allergy),
                    food_allergy_note: medicalHistory.food_allergy_note || "",
                },
            }));
        }
    }, [medicalHistory]);

    // Handlers for medical history form
    const handleMedicalHistoryChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState((prev) => ({
            ...prev,
            medicalHistoryData: {
                ...prev.medicalHistoryData,
                [name]: type === "checkbox" ? checked : value,
            },
        }));
    };

    // Handle submitting the medical history
    const handleMedicalHistorySubmit = (e) => {
        e.preventDefault();
        console.log(
            "Submitting medical history data:",
            formState.medicalHistoryData
        );

        // Format data before sending
        const formattedData = {
            ...formState.medicalHistoryData,
            // Force conversion to boolean
            has_heart_disease: Boolean(
                formState.medicalHistoryData.has_heart_disease
            ),
            has_diabetes: Boolean(formState.medicalHistoryData.has_diabetes),
            has_hemophilia: Boolean(
                formState.medicalHistoryData.has_hemophilia
            ),
            has_hepatitis: Boolean(formState.medicalHistoryData.has_hepatitis),
            has_gastritis: Boolean(formState.medicalHistoryData.has_gastritis),
            has_other_disease: Boolean(
                formState.medicalHistoryData.has_other_disease
            ),
            has_drug_allergy: Boolean(
                formState.medicalHistoryData.has_drug_allergy
            ),
            has_food_allergy: Boolean(
                formState.medicalHistoryData.has_food_allergy
            ),
        };

        // Use the existing API endpoint for saving/updating medical history
        return router.post(
            route("medical-history.saveOrUpdate", patient.id),
            formattedData,
            {
                onSuccess: () => {
                    console.log("Medical history saved successfully");
                    // Move to next tab after successful save
                    setActiveTab("odontogram");
                },
                onError: (errors) => {
                    console.error("Form submission errors:", errors);
                    alert("Error saving medical history. Please try again.");
                },
            }
        );
    };

    // Handle status change
    const handleStatusChange = (newStatus) => {
        router.put(
            route("doctor.appointments.update-status", appointment.id),
            { status: newStatus },
            {
                onSuccess: () => {
                    // Refresh the page to get updated data
                    router.reload();
                },
                onError: (errors) => {
                    console.error("Error updating status:", errors);
                    alert(
                        "Error updating appointment status. Please try again."
                    );
                },
            }
        );
    };

    // Format date helper
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <AuthorizeLayout>
            <Head title="Pemeriksaan Pasien" />

            {/* Full-width container like Appointment Show */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                {/* Enhanced Header Section with Appointment Context & History */}
                <ExaminationHeader
                    patient={patient}
                    appointment={appointment}
                    appointmentContext={appointmentContext}
                    appointmentHistory={appointmentHistory}
                    formatDate={formatDate}
                    onStatusChange={handleStatusChange}
                />

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert variant="success" className="mb-6">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Main Tabs Section - Removed Card wrapper for full-width */}
                <div className="space-y-6">
                    <div className="border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 pb-2">
                            Detail Pemeriksaan
                        </h3>
                        <p className="text-sm text-gray-600 pb-4">
                            Status: {appointment.status} | Jadwal:{" "}
                            {formatDate(appointment.appointment_date)}
                        </p>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid grid-cols-3 mb-8 w-full">
                            <TabsTrigger
                                value="patient-info"
                                className="flex items-center justify-center"
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span className="hidden md:inline">
                                    Informasi Pasien
                                </span>
                                <span className="inline md:hidden">Pasien</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="medical-history"
                                className="flex items-center justify-center"
                            >
                                <Activity className="mr-2 h-4 w-4" />
                                <span className="hidden md:inline">
                                    Riwayat Medis
                                </span>
                                <span className="inline md:hidden">
                                    Riwayat
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="odontogram"
                                className="flex items-center justify-center"
                            >
                                <ToothIcon className="mr-2 h-4 w-4" />
                                <span className="hidden md:inline">
                                    Odontogram
                                </span>
                                <span className="inline md:hidden">Gigi</span>
                            </TabsTrigger>
                            {/* <TabsTrigger
                                value="appointment"
                                className="flex items-center justify-center"
                            >
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                <span className="hidden md:inline">
                                    Appointment
                                </span>
                                <span className="inline md:hidden">Jadwal</span>
                            </TabsTrigger> */}
                        </TabsList>

                        {/* Patient Info Tab */}
                        <TabsContent value="patient-info" className="mt-6">
                            <PatientInfoSection
                                patient={patient}
                                appointment={appointment}
                                onNext={() => setActiveTab("medical-history")}
                            />
                        </TabsContent>

                        {/* Medical History Tab */}
                        <TabsContent value="medical-history" className="mt-6">
                            <MedicalHistorySection
                                formData={formState.medicalHistoryData}
                                bloodTypes={bloodTypes}
                                onChange={handleMedicalHistoryChange}
                                onSubmit={handleMedicalHistorySubmit}
                                onBack={() => setActiveTab("patient-info")}
                                medicalHistory={medicalHistory}
                                canEdit={canEdit}
                            />
                        </TabsContent>

                        {/* Odontogram Tab */}
                        <TabsContent value="odontogram" className="mt-6">
                            <OdontogramSection
                                odontogram={odontogram}
                                appointment={appointment}
                                patient={patient}
                                diagnoses={diagnoses}
                                treatments={treatments}
                                canEdit={canEdit}
                                onBack={() => setActiveTab("medical-history")}
                                onNext={() => setActiveTab("appointment")}
                            />
                        </TabsContent>

                        {/* Enhanced Appointment Tab */}
                        {/* <TabsContent value="appointment" className="mt-6">
                            <AppointmentSection
                                patient={patient}
                                appointment={appointment}
                                appointmentContext={appointmentContext} // Enhanced appointment context
                                appointmentHistory={appointmentHistory} // Complete appointment history
                                canEdit={canEdit}
                                onBack={() => setActiveTab("odontogram")}
                            />
                        </TabsContent> */}
                    </Tabs>
                </div>
            </div>
        </AuthorizeLayout>
    );
}
