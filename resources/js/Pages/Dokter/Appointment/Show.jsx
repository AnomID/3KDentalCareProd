// File: resources/js/Pages/Dokter/Appointment/Show.jsx (Fixed)
import React, { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

// Import existing components
import AppointmentHeader from "./components/AppointmentHeader";
import FlashMessages from "./components/FlashMessages";
import AppointmentStatusBar from "./components/AppointmentStatusBar";
import TabNavigation from "./components/TabNavigation";
import PatientInfoTab from "./components/PatientInfoTab";
import MedicalRecordTab from "./components/MedicalRecordTab";
import MedicalHistoryTab from "./components/MedicalHistoryTab";

// Import new components
import AppointmentTab from "./components/AppointmentTab";
import AppointmentHistoryTab from "./components/AppointmentHistoryTab";

export default function DoctorAppointmentShow({
    appointment,
    patientData,
    canCancel,
    canComplete,
    canMarkNoShow,
    medicalRecord,
    medicalHistory,
    bloodTypes,
    // Enhanced props for appointment management
    examinationContext = null, // Context from examination panel
    appointmentHistory = [], // Complete appointment history
}) {
    const { auth } = usePage().props;
    const flash = usePage().props.flash || {};

    // FIXED: Initialize with 'details' as default, not dependent on conditions
    const [activeTab, setActiveTab] = useState("details");
    const [isInitialized, setIsInitialized] = useState(false);

    const [historyData, setHistoryData] = useState({
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
    });

    // Log untuk debugging
    console.log("[DoctorAppointmentShow] Initial props:", {
        appointment,
        appointmentHistory,
        examinationContext,
        historyCount: appointmentHistory?.length || 0,
    });

    // FIXED: Simplified initialization logic
    useEffect(() => {
        if (!isInitialized) {
            // Check URL params for specific tab
            const urlParams = new URLSearchParams(window.location.search);
            const tabFromUrl = urlParams.get("tab");

            if (
                tabFromUrl &&
                ["details", "treatment", "appointment", "history"].includes(
                    tabFromUrl
                )
            ) {
                setActiveTab(tabFromUrl);
            } else {
                // Set default tab based on appointment status and context
                if (examinationContext) {
                    if (
                        examinationContext.mode === "create_new" ||
                        examinationContext.mode === "show_next"
                    ) {
                        setActiveTab("appointment");
                    } else {
                        setActiveTab("details");
                    }
                } else if (appointment.status === "completed") {
                    // For completed appointments, default to details but allow switching
                    setActiveTab("details");
                } else {
                    setActiveTab("details");
                }
            }
            setIsInitialized(true);
        }
    }, [examinationContext, appointment.status, isInitialized]);

    // Update historyData when medicalHistory changes
    useEffect(() => {
        console.log(
            "[DoctorAppointmentShow] medicalHistory changed:",
            medicalHistory
        );
        if (medicalHistory) {
            setHistoryData({
                blood_type: medicalHistory.blood_type || "",
                blood_pressure: medicalHistory.blood_pressure || "",
                blood_pressure_status:
                    medicalHistory.blood_pressure_status || "normal",
                has_heart_disease: Boolean(medicalHistory.has_heart_disease),
                heart_disease_note: medicalHistory.heart_disease_note || "",
                has_diabetes: Boolean(medicalHistory.has_diabetes),
                diabetes_note: medicalHistory.diabetes_note || "",
                has_hemophilia: Boolean(medicalHistory.has_hemophilia),
                hemophilia_note: medicalHistory.hemophilia_note || "",
                has_hepatitis: Boolean(medicalHistory.has_hepatitis),
                hepatitis_note: medicalHistory.hepatitis_note || "",
                has_gastritis: Boolean(medicalHistory.has_gastritis),
                gastritis_note: medicalHistory.gastritis_note || "",
                has_other_disease: Boolean(medicalHistory.has_other_disease),
                other_disease_note: medicalHistory.other_disease_note || "",
                has_drug_allergy: Boolean(medicalHistory.has_drug_allergy),
                drug_allergy_note: medicalHistory.drug_allergy_note || "",
                has_food_allergy: Boolean(medicalHistory.has_food_allergy),
                food_allergy_note: medicalHistory.food_allergy_note || "",
            });
        }
    }, [medicalHistory]);

    // FIXED: Tab change handler with URL update
    const handleTabChange = (newTab) => {
        console.log("[DoctorAppointmentShow] Changing tab to:", newTab);
        setActiveTab(newTab);

        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set("tab", newTab);
        window.history.replaceState({}, "", url);
    };

    // Event handlers untuk form riwayat medis
    const handleHistoryChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHistoryData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handler historySubmit
    const handleHistorySubmit = (e) => {
        e.preventDefault();
        console.log(
            "[DoctorAppointmentShow] handleHistorySubmit called with data:",
            historyData
        );

        // Ensure all boolean fields are explicitly converted to true/false
        const formattedData = {
            ...historyData,
            // Force conversion to boolean
            has_heart_disease: Boolean(historyData.has_heart_disease),
            has_diabetes: Boolean(historyData.has_diabetes),
            has_hemophilia: Boolean(historyData.has_hemophilia),
            has_hepatitis: Boolean(historyData.has_hepatitis),
            has_gastritis: Boolean(historyData.has_gastritis),
            has_other_disease: Boolean(historyData.has_other_disease),
            has_drug_allergy: Boolean(historyData.has_drug_allergy),
            has_food_allergy: Boolean(historyData.has_food_allergy),
        };

        // Gunakan route yang benar untuk menyimpan/memperbarui riwayat medis
        return router.post(
            route("medical-history.saveOrUpdate", appointment.patient_id),
            formattedData,
            {
                onSuccess: (response) => {
                    console.log("Riwayat medis berhasil disimpan/diperbarui");
                },
                onError: (errors) => {
                    console.error("Form submission errors:", errors);
                    alert("Error saving data. Please try again.");
                },
            }
        );
    };

    // Event handlers untuk appointment actions
    const handleCancelAppointment = () => {
        if (confirm("Apakah Anda yakin ingin membatalkan janji temu ini?")) {
            router.put(
                route("doctor.appointments.update-status", {
                    appointment: appointment.id,
                    status: "canceled",
                })
            );
        }
    };

    const handleMarkNoShow = () => {
        if (confirm("Tandai pasien tidak hadir?")) {
            router.put(
                route("doctor.appointments.update-status", {
                    appointment: appointment.id,
                    status: "no_show",
                })
            );
        }
    };

    const handlePrintAppointment = () => {
        window.print();
    };

    // FIXED: Render content berdasarkan tab yang aktif dengan better error handling
    const renderActiveTabContent = () => {
        console.log(
            "[DoctorAppointmentShow] Rendering tab content for:",
            activeTab
        );

        try {
            switch (activeTab) {
                case "details":
                    return (
                        <PatientInfoTab
                            appointment={appointment}
                            patientData={patientData}
                            canComplete={canComplete}
                        />
                    );
                case "record":
                    return (
                        <MedicalRecordTab
                            appointment={appointment}
                            medicalRecord={medicalRecord}
                        />
                    );
                case "treatment":
                    return (
                        <MedicalHistoryTab
                            appointment={appointment}
                            medicalHistory={medicalHistory}
                            bloodTypes={bloodTypes}
                            historyData={historyData}
                            handleHistoryChange={handleHistoryChange}
                            handleHistorySubmit={handleHistorySubmit}
                            setActiveTab={handleTabChange}
                        />
                    );
                case "appointment":
                    return (
                        <AppointmentTab
                            appointment={appointment}
                            patientData={patientData}
                            examinationContext={examinationContext}
                            className="mt-6"
                        />
                    );
                case "history":
                    return (
                        <AppointmentHistoryTab
                            appointmentHistory={appointmentHistory || []}
                            currentAppointmentId={appointment.id}
                            patientData={patientData}
                            currentAppointment={appointment}
                            className="mt-6"
                            maxDisplayItems={15}
                        />
                    );
                default:
                    console.warn(
                        "[DoctorAppointmentShow] Unknown tab:",
                        activeTab
                    );
                    return (
                        <PatientInfoTab
                            appointment={appointment}
                            patientData={patientData}
                        />
                    );
            }
        } catch (error) {
            console.error(
                "[DoctorAppointmentShow] Error rendering tab content:",
                error
            );
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">
                        Terjadi kesalahan saat memuat konten tab.
                    </p>
                    <button
                        onClick={() => handleTabChange("details")}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Kembali ke Informasi Pasien
                    </button>
                </div>
            );
        }
    };

    return (
        <AuthorizeLayout>
            <Head title="Detail Janji Temu" />

            <div className="bg-white shadow-lg rounded-lg p-6">
                {/* Header Section */}
                <AppointmentHeader
                    appointment={appointment}
                    canComplete={canComplete}
                    canCancel={canCancel}
                    canMarkNoShow={canMarkNoShow}
                    handleCancelAppointment={handleCancelAppointment}
                    handleMarkNoShow={handleMarkNoShow}
                    handlePrintAppointment={handlePrintAppointment}
                />

                {/* Flash Messages */}
                <FlashMessages flash={flash} />

                {/* Appointment Status */}
                <AppointmentStatusBar appointment={appointment} />

                {/* Tabs Navigation - FIXED: Pass handleTabChange */}
                <TabNavigation
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    appointment={appointment}
                    appointmentHistory={appointmentHistory || []}
                    examinationContext={examinationContext}
                />

                {/* Content based on active tab */}
                {renderActiveTabContent()}
            </div>
        </AuthorizeLayout>
    );
}
