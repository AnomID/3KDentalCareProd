import React, { useState, useEffect } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import Select from "react-select";

export default function Edit({ patient, patients }) {
    const { data, setData, put, errors, processing } = useForm({
        name: patient.name || "",
        birth_place: patient.birth_place || "",
        birth_date: patient.birth_date || "",
        citizenship: patient.citizenship || "",
        gender: patient.gender || "",
        occupation: patient.occupation || "",
        address: patient.address || "",
        phone: patient.phone || "",
        blood_type: patient.blood_type || "",
        identity_type: patient.identity_type || "",
        no_identity: patient.identity_type ? patient.no_identity || "" : "",
        guardian_status: patient.guardian
            ? patient.guardian.patient_id
                ? "Patient"
                : "Non Patient"
            : "None",
        guardian_name: patient.guardian ? patient.guardian.name : "",
        guardian_relationship: patient.guardian
            ? patient.guardian.relationship
            : "",
        guardian_phone_number: patient.guardian
            ? patient.guardian.phone_number
            : "",
        guardian_address: patient.guardian ? patient.guardian.address : "",
        guardian_identity_type: patient.guardian
            ? patient.guardian.identity_type
            : "KTP",
        guardian_identity_number: patient.guardian
            ? patient.guardian.identity_number
            : "",
        guardian_patient_id:
            patient.guardian && patient.guardian.patient_id
                ? patient.guardian.patient_id
                : "",
        guardian_id: patient.guardian_id || "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showIdentityFields, setShowIdentityFields] = useState(
        !!patient.identity_type && patient.identity_type !== "GUARDIAN"
    );
    const [selectedPatient, setSelectedPatient] = useState(
        patient.guardian && patient.guardian.patient_id
            ? patients.find((p) => p.id === patient.guardian.patient_id)
            : null
    );
    const [availableGuardians, setAvailableGuardians] = useState([]);
    const [selectedGuardian, setSelectedGuardian] = useState(null);

    useEffect(() => {
        if (data.guardian_status === "Available Guardian") {
            setAvailableGuardians([]);
            setSelectedGuardian(null);

            setIsLoadingGuardians(true);

            axios
                .get("/api/guardians")
                .then((response) => {
                    if (Array.isArray(response.data)) {
                        setAvailableGuardians(response.data);
                    } else if (
                        response.data.data &&
                        Array.isArray(response.data.data)
                    ) {
                        setAvailableGuardians(response.data.data);
                    } else {
                        console.error(
                            "Unexpected response format:",
                            response.data
                        );
                        setAvailableGuardians([]);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching guardians:", error);
                    setAvailableGuardians([]);
                })
                .finally(() => {});
        }
    }, [data.guardian_status]);

    useEffect(() => {
        setShowIdentityFields(
            data.identity_type === "KTP" || data.identity_type === "PASSPORT"
        );

        if (data.identity_type === "" || data.identity_type === "GUARDIAN") {
            setData("no_identity", "");
        }
    }, [data.identity_type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("patients.update", patient.id), {
            onSuccess: () => {
                setSuccessMessage("Patient updated successfully!");
                setTimeout(() => setSuccessMessage(""), 5000);
            },
            onError: (errors) => {
                setErrorMessage(
                    "Error updating patient. Please check the form."
                );
                setTimeout(() => setErrorMessage(""), 5000);
                console.error(errors);
            },
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handlePatientChange = (selectedOption) => {
        const selectedPatientData = patients.find(
            (p) => p.id === selectedOption.value
        );

        setSelectedPatient(selectedPatientData);
        setData({
            ...data,
            guardian_patient_id: selectedOption.value,
        });
    };

    // Format patients for select dropdown
    const patientOptions = patients.map((p) => ({
        value: p.id,
        label: `${p.no_rm || "No RM"} - ${p.name}`,
    }));

    // TODO Backup
    // const handleGuardianChange = (selectedOption) => {
    //     const guardian = availableGuardians.find(
    //         (g) => g.id === selectedOption.value
    //     );
    //     setSelectedGuardian(guardian);
    //     setData("guardian_id", selectedOption.value);
    // };

    // Format guardians for select dropdown
    const guardianOptions = availableGuardians.map((g) => ({
        value: g.id,
        label: `${g.name || "Unknown"} - ${g.phone_number || "No Phone"}`,
    }));

    const handleGuardianChange = (selectedOption) => {
        // console.log("Selected guardian option:", selectedOption);

        if (!selectedOption) {
            setSelectedGuardian(null);
            setData("guardian_id", null);
            return;
        }

        const guardian = availableGuardians.find(
            (g) => g.id === selectedOption.value
        );
        // console.log("Found guardian:", guardian);

        if (guardian) {
            setSelectedGuardian(guardian);
            setData("guardian_id", parseInt(selectedOption.value, 10));

            if (!data.guardian_relationship) {
                setData("guardian_relationship", "");
            }
        }
    };

    return (
        <AuthorizeLayout>
            <Head title={`Edit Patient: ${patient.name}`} />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Edit Patient Information
                    </h2>
                    <p className="text-gray-600 mt-1">
                        RM Number:{" "}
                        {patient.no_rm || "Will be generated automatically"}
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-green-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    {successMessage}
                                </p>
                            </div>
                            <button
                                className="ml-auto pl-3"
                                onClick={() => setSuccessMessage("")}
                            >
                                <svg
                                    className="h-5 w-5 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {errorMessage}
                                </p>
                            </div>
                            <button
                                className="ml-auto pl-3"
                                onClick={() => setErrorMessage("")}
                            >
                                <svg
                                    className="h-5 w-5 text-red-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Basic Patient Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Patient Basic Information
                            </h3>
                        </div>

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Gender */}
                        <div>
                            <label
                                htmlFor="gender"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={data.gender}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.gender}
                                </p>
                            )}
                        </div>

                        {/* Blood Type */}
                        <div>
                            <label
                                htmlFor="blood_type"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Blood Type
                            </label>
                            <select
                                id="blood_type"
                                name="blood_type"
                                value={data.blood_type}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Select Blood Type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                            {errors.blood_type && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.blood_type}
                                </p>
                            )}
                        </div>

                        {/* Citizenship */}
                        <div>
                            <label
                                htmlFor="citizenship"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Citizenship
                            </label>
                            <input
                                type="text"
                                id="citizenship"
                                name="citizenship"
                                value={data.citizenship}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.citizenship && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.citizenship}
                                </p>
                            )}
                        </div>

                        {/* Birth Place */}
                        <div>
                            <label
                                htmlFor="birth_place"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Birth Place
                            </label>
                            <input
                                type="text"
                                id="birth_place"
                                name="birth_place"
                                value={data.birth_place}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.birth_place && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.birth_place}
                                </p>
                            )}
                        </div>

                        {/* Birth Date */}
                        <div>
                            <label
                                htmlFor="birth_date"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Birth Date
                            </label>
                            <input
                                type="date"
                                id="birth_date"
                                name="birth_date"
                                value={data.birth_date}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.birth_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.birth_date}
                                </p>
                            )}
                        </div>

                        {/* Occupation */}
                        <div>
                            <label
                                htmlFor="occupation"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Occupation
                            </label>
                            <input
                                type="text"
                                id="occupation"
                                name="occupation"
                                value={data.occupation}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.occupation && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.occupation}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Phone Number
                            </label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={data.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={data.address}
                                onChange={handleInputChange}
                                rows="3"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            ></textarea>
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Identity Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Identity Information
                            </h3>
                        </div>

                        {/* Identity Type */}
                        <div>
                            <label
                                htmlFor="identity_type"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Identity Type
                            </label>
                            <select
                                id="identity_type"
                                name="identity_type"
                                value={data.identity_type}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">None</option>
                                <option value="KTP">KTP</option>
                                <option value="PASSPORT">Passport</option>
                                <option value="GUARDIAN">Guardian</option>
                            </select>
                            {errors.identity_type && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.identity_type}
                                </p>
                            )}
                        </div>

                        {/* Identity Number - only shown if Identity Type is KTP or PASSPORT */}
                        {showIdentityFields && (
                            <div>
                                <label
                                    htmlFor="no_identity"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Identity Number
                                </label>
                                <input
                                    type="text"
                                    id="no_identity"
                                    name="no_identity"
                                    value={data.no_identity}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.no_identity && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.no_identity}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Guardian Section - only shown when identity_type is GUARDIAN */}
                    {data.identity_type === "GUARDIAN" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">
                                    Guardian Information
                                </h3>
                            </div>

                            {/* Guardian Status */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="guardian_status"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Guardian Status
                                </label>
                                <select
                                    id="guardian_status"
                                    name="guardian_status"
                                    onChange={handleInputChange}
                                    value={data.guardian_status}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="None">No Guardian</option>
                                    <option value="Patient">
                                        Patient as Guardian
                                    </option>
                                    <option value="Non Patient">
                                        Non-Patient as Guardian
                                    </option>
                                    <option value="Available Guardian">
                                        Use Available Guardian
                                    </option>
                                </select>
                                {errors.guardian_status && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guardian_status}
                                    </p>
                                )}
                            </div>

                            {/* Non Patient Guardian Fields */}
                            {data.guardian_status === "Non Patient" && (
                                <div className="md:col-span-2 p-4 border rounded-md bg-gray-50">
                                    {/* Relationship */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="guardian_relationship"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Guardian Relationship
                                        </label>
                                        <input
                                            type="text"
                                            id="guardian_relationship"
                                            name="guardian_relationship"
                                            value={data.guardian_relationship}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="e.g. Parent, Spouse, Child"
                                            required
                                        />
                                        {errors.guardian_relationship && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_relationship}
                                            </p>
                                        )}
                                    </div>

                                    {/* Guardian Name */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="guardian_name"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Guardian Name
                                        </label>
                                        <input
                                            type="text"
                                            id="guardian_name"
                                            name="guardian_name"
                                            value={data.guardian_name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.guardian_name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Guardian Identity Type */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="guardian_identity_type"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Guardian Identity Type
                                        </label>
                                        <select
                                            id="guardian_identity_type"
                                            name="guardian_identity_type"
                                            onChange={handleInputChange}
                                            value={data.guardian_identity_type}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">
                                                Select Type
                                            </option>
                                            <option value="KTP">KTP</option>
                                            <option value="PASSPORT">
                                                Passport
                                            </option>
                                        </select>
                                        {errors.guardian_identity_type && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_identity_type}
                                            </p>
                                        )}
                                    </div>

                                    {/* Guardian Identity Number */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="guardian_identity_number"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Guardian Identity Number
                                        </label>
                                        <input
                                            type="text"
                                            id="guardian_identity_number"
                                            name="guardian_identity_number"
                                            value={
                                                data.guardian_identity_number
                                            }
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.guardian_identity_number && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {
                                                    errors.guardian_identity_number
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Guardian Phone Number */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="guardian_phone_number"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Guardian Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            id="guardian_phone_number"
                                            name="guardian_phone_number"
                                            value={data.guardian_phone_number}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.guardian_phone_number && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_phone_number}
                                            </p>
                                        )}
                                    </div>

                                    {/* Guardian Address */}
                                    <div>
                                        <label
                                            htmlFor="guardian_address"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Guardian Address
                                        </label>
                                        <textarea
                                            id="guardian_address"
                                            name="guardian_address"
                                            value={data.guardian_address}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        ></textarea>
                                        {errors.guardian_address && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Patient as Guardian Fields */}
                            {data.guardian_status === "Patient" && (
                                <div className="md:col-span-2 p-4 border rounded-md bg-gray-50">
                                    {/* Select Patient */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="guardian_patient_id"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Select Guardian Patient
                                        </label>
                                        <Select
                                            id="guardian_patient_id"
                                            name="guardian_patient_id"
                                            value={patientOptions.find(
                                                (option) =>
                                                    option.value ===
                                                    parseInt(
                                                        data.guardian_patient_id
                                                    )
                                            )}
                                            onChange={handlePatientChange}
                                            options={patientOptions}
                                            placeholder="Select a patient"
                                            isClearable
                                            isSearchable
                                            className="mt-1 block w-full"
                                        />
                                        {errors.guardian_patient_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_patient_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Display Selected Patient Details */}
                                    {selectedPatient && (
                                        <div className="mt-4 bg-white p-4 border border-gray-200 rounded-md">
                                            <h4 className="text-md font-medium text-gray-700 mb-2">
                                                Selected Patient Details
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        RM Number
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedPatient.no_rm ||
                                                            "N/A"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Name
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedPatient.name}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Identity Type
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedPatient.identity_type ||
                                                            "N/A"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Identity Number
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedPatient.no_identity ||
                                                            "N/A"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Phone
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedPatient.phone ||
                                                            "N/A"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Address
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedPatient.address ||
                                                            "N/A"}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Relationship Field */}
                                            <div className="mt-4">
                                                <label
                                                    htmlFor="guardian_relationship"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Relationship with Guardian
                                                </label>
                                                <input
                                                    type="text"
                                                    id="guardian_relationship"
                                                    name="guardian_relationship"
                                                    value={
                                                        data.guardian_relationship
                                                    }
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="e.g. Parent, Spouse, Child"
                                                    required
                                                />
                                                {errors.guardian_relationship && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.guardian_relationship
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {data.guardian_status === "Available Guardian" && (
                                <div className="md:col-span-2 p-4 border rounded-md bg-gray-50">
                                    {/* Select Guardian */}
                                    <div className="mb-4">
                                        <label
                                            htmlFor="guardian_id"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Select Available Guardian
                                        </label>
                                        <Select
                                            id="guardian_id"
                                            name="guardian_id"
                                            value={guardianOptions.find(
                                                (option) =>
                                                    option.value ===
                                                    parseInt(data.guardian_id)
                                            )}
                                            onChange={handleGuardianChange}
                                            options={guardianOptions}
                                            placeholder="Select a guardian"
                                            isClearable
                                            isSearchable
                                            className="mt-1 block w-full"
                                        />
                                        {errors.guardian_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Display Selected Guardian Details */}
                                    {selectedGuardian && (
                                        <div className="mt-4 bg-white p-4 border border-gray-200 rounded-md">
                                            <h4 className="text-md font-medium text-gray-700 mb-2">
                                                Selected Guardian Details
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Name
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedGuardian.name}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Phone
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedGuardian.phone_number ||
                                                            "N/A"}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">
                                                        Address
                                                    </label>
                                                    <div className="mt-1 text-sm text-gray-800">
                                                        {selectedGuardian.address ||
                                                            "N/A"}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Relationship Field */}
                                            <div className="mt-4">
                                                <label
                                                    htmlFor="guardian_relationship"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Relationship with Guardian
                                                </label>
                                                <input
                                                    type="text"
                                                    id="guardian_relationship"
                                                    name="guardian_relationship"
                                                    value={
                                                        data.guardian_relationship
                                                    }
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="e.g. Parent, Spouse, Child"
                                                    required
                                                />
                                                {errors.guardian_relationship && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.guardian_relationship
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end">
                        <Link
                            href={route("patients.show", patient.id)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthorizeLayout>
    );
}
