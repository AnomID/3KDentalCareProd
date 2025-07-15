import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import Select from "react-select";
import axios from "axios";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

const CreateUser = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "patient",
        position: "",
        phone: "",
        address: "",
        specialization: "",
        license_number: "",
        license_start_date: "",
        license_expiry_date: "",

        // Patient
        birth_place: "",
        birth_date: "",
        identity_type: "",
        no_identity: "",
        citizenship: "Indonesia",
        gender: "Male",
        occupation: "",
        blood_type: "A",

        // Guardian
        guardian_id: "",
        guardian_name: "",
        guardian_relationship: "",
        guardian_identity_type: "",
        guardian_identity_number: "",
        guardian_phone_number: "",
        guardian_address: "",
        guardian_patient_id: null,
    });

    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showIdentityFields, setShowIdentityFields] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [guardianOptions, setGuardianOptions] = useState([]);
    const [selectedGuardian, setSelectedGuardian] = useState(null);

    useEffect(() => {
        const fetchGuardians = async () => {
            try {
                const response = await axios.get(route("api.guardians"));
                const guardians = response.data;

                const options = guardians.map((guardian) => ({
                    value: guardian.id,
                    label: `${guardian.name} (${
                        guardian.phone_number || "No Phone"
                    })`,
                }));

                setGuardianOptions(options);
            } catch (error) {
                console.error("Failed to fetch guardians:", error);
            }
        };

        fetchGuardians();
    }, []);

    useEffect(() => {
        axios
            .get("api/patients")
            .then((response) => {
                const formattedPatients = response.data.map((patient) => ({
                    value: patient.id,
                    label: `${patient.no_rm} - ${patient.name}`,
                    ...patient,
                }));
                setPatientOptions(formattedPatients);
            })
            .catch((error) => {
                console.error("Error fetching patients:", error);
                setErrorMessage(
                    "Failed to load patient data. Please try again."
                );
            });
    }, []);

    useEffect(() => {
        setShowIdentityFields(
            formData.identity_type === "KTP" ||
                formData.identity_type === "PASSPORT"
        );
    }, [formData.identity_type]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        if (
            name === "identity_type" &&
            (value === "" || value === "GUARDIAN")
        ) {
            setFormData((prev) => ({
                ...prev,
                no_identity: "",
            }));
        }
    };

    const handlePhoneChange = (value) => {
        setFormData({
            ...formData,
            phone: value,
        });
    };

    const handlePhoneChangeGuardian = (value) => {
        setFormData({
            ...formData,
            guardian_phone_number: value,
        });
    };

    const handlePatientChange = (selectedOption) => {
        const patient = patientOptions.find(
            (option) => option.value === selectedOption.value
        );

        setSelectedPatient(patient ? patient : null);

        setFormData({
            ...formData,
            guardian_patient_id: selectedOption ? selectedOption.value : null,
        });
    };

    const handleGuardianChange = (selectedOption) => {
        // console.log("Selected guardian option:", selectedOption);

        if (!selectedOption) {
            setSelectedGuardian(null);
            setFormData({
                ...formData,
                guardian_id: null,
            });
            return;
        }

        axios
            .get(route("api.guardians.show", selectedOption.value))
            .then((response) => {
                const guardian = response.data;
                setSelectedGuardian(guardian);
                setFormData({
                    ...formData,
                    guardian_id: parseInt(selectedOption.value, 10),
                    guardian_relationship: formData.guardian_relationship || "",
                });
            })
            .catch((error) => {
                console.error("Failed to fetch guardian details:", error);
                setFormData({
                    ...formData,
                    guardian_id: parseInt(selectedOption.value, 10),
                });
            });
    };

    const validateForm = () => {
        let formErrors = {};
        if (formData.identity_type === "KTP") {
            if (formData.no_identity.length !== 16) {
                formErrors.no_identity =
                    "KTP number must be exactly 16 digits.";
            }
        } else if (formData.identity_type === "PASSPORT") {
            if (
                formData.no_identity.length < 8 ||
                formData.no_identity.length > 9
            ) {
                formErrors.no_identity =
                    "Passport number must be between 8 and 9 digits.";
            } else if (!/^[A-Z0-9]+$/.test(formData.no_identity)) {
                formErrors.no_identity =
                    "Passport number must contain only uppercase letters and numbers.";
            }
        }

        return formErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setErrorMessage("Please fix the errors in the form.");
            return;
        }

        // Clear previous errors before submission
        setErrors({});
        setErrorMessage("");

        router.post("/karyawan/create-user", formData, {
            onSuccess: () => {
                setSuccessMessage(
                    "User created successfully, you will go to dashboard in "
                );
                setCountdown(5);
                const countdownInterval = setInterval(() => {
                    setCountdown((prevCount) => {
                        if (prevCount <= 1) {
                            clearInterval(countdownInterval);
                            router.visit("/karyawan/dashboard");
                            return 0;
                        }
                        return prevCount - 1;
                    });
                }, 1000);
            },
            onError: (errors) => {
                setErrors(errors);
                setErrorMessage(
                    "Failed to create user. Please check the form."
                );
                // Scroll to the top to show error message
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
        });
    };
    return (
        <AuthorizeLayout>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Create New User
                    </h2>
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
                                    {countdown > 0 && (
                                        <span className="ml-1 font-medium">
                                            Redirecting in {countdown}{" "}
                                            seconds...
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                className="ml-auto pl-3"
                                onClick={() => {
                                    setSuccessMessage("");
                                    setCountdown(0);
                                }}
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
                                {/* Add this to display a list of all errors */}
                                {Object.keys(errors).length > 0 && (
                                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                        {Object.entries(errors).map(
                                            ([field, messages]) => (
                                                <li key={field}>
                                                    {Array.isArray(messages)
                                                        ? messages[0]
                                                        : messages}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
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
                    {/* Basic User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                User Account Information
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
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-700"
                            >
                                User Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="patient">Patient</option>
                                <option value="employee">Employee</option>
                                <option value="doctor">Doctor</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.role}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Employee Fields */}
                    {formData.role === "employee" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">
                                    Employee Information
                                </h3>
                            </div>

                            {/* Position */}
                            <div>
                                <label
                                    htmlFor="position"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Position
                                </label>
                                <input
                                    type="text"
                                    id="position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.position && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.position}
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
                                <PhoneInput
                                    international
                                    defaultCountry="ID"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
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
                                    value={formData.address}
                                    onChange={handleChange}
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
                    )}

                    {/* Doctor Fields */}
                    {formData.role === "doctor" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">
                                    Doctor Information
                                </h3>
                            </div>

                            {/* Specialization */}
                            <div>
                                <label
                                    htmlFor="specialization"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    id="specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.specialization && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.specialization}
                                    </p>
                                )}
                            </div>

                            {/* License Number */}
                            <div>
                                <label
                                    htmlFor="license_number"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    id="license_number"
                                    name="license_number"
                                    value={formData.license_number}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.license_number && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.license_number}
                                    </p>
                                )}
                            </div>

                            {/* License Start Date */}
                            <div>
                                <label
                                    htmlFor="license_start_date"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    License Start Date
                                </label>
                                <input
                                    type="date"
                                    id="license_start_date"
                                    name="license_start_date"
                                    value={formData.license_start_date}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.license_start_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.license_start_date}
                                    </p>
                                )}
                            </div>

                            {/* License Expiry Date */}
                            <div>
                                <label
                                    htmlFor="license_expiry_date"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    License Expiry Date
                                </label>
                                <input
                                    type="date"
                                    id="license_expiry_date"
                                    name="license_expiry_date"
                                    value={formData.license_expiry_date}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.license_expiry_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.license_expiry_date}
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
                                <PhoneInput
                                    international
                                    defaultCountry="ID"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
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
                                    value={formData.address}
                                    onChange={handleChange}
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
                    )}

                    {/* Patient Fields */}
                    {formData.role === "patient" && (
                        <>
                            {/* Basic Patient Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                                        Patient Basic Information
                                    </h3>
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
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
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
                                        value={formData.blood_type}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
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
                                        value={formData.citizenship}
                                        onChange={handleChange}
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
                                        value={formData.birth_place}
                                        onChange={handleChange}
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
                                        value={formData.birth_date}
                                        onChange={handleChange}
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
                                        value={formData.occupation}
                                        onChange={handleChange}
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
                                    <PhoneInput
                                        international
                                        defaultCountry="ID"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
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
                                        value={formData.address}
                                        onChange={handleChange}
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
                                        value={formData.identity_type}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">None</option>
                                        <option value="KTP">KTP</option>
                                        <option value="PASSPORT">
                                            Passport
                                        </option>
                                        <option value="GUARDIAN">
                                            Guardian
                                        </option>
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
                                            value={formData.no_identity}
                                            onChange={handleChange}
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
                            {formData.identity_type === "GUARDIAN" && (
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
                                            onChange={handleChange}
                                            value={formData.guardian_status}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">None</option>
                                            <option value="Patient">
                                                Patient
                                            </option>
                                            <option value="Non Patient">
                                                Non Patient
                                            </option>
                                            <option value="Available Guardian">
                                                Available Guardian
                                            </option>
                                        </select>
                                        {errors.guardian_status && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.guardian_status}
                                            </p>
                                        )}
                                    </div>

                                    {/* Non Patient Guardian Fields */}
                                    {formData.guardian_status ===
                                        "Non Patient" && (
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
                                                    value={
                                                        formData.guardian_relationship
                                                    }
                                                    onChange={handleChange}
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
                                                    value={
                                                        formData.guardian_name
                                                    }
                                                    onChange={handleChange}
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
                                                    onChange={handleChange}
                                                    value={
                                                        formData.guardian_identity_type
                                                    }
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                >
                                                    <option value="">
                                                        Select Type
                                                    </option>
                                                    <option value="KTP">
                                                        KTP
                                                    </option>
                                                    <option value="PASSPORT">
                                                        Passport
                                                    </option>
                                                </select>
                                                {errors.guardian_identity_type && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.guardian_identity_type
                                                        }
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
                                                        formData.guardian_identity_number
                                                    }
                                                    onChange={handleChange}
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
                                                <PhoneInput
                                                    international
                                                    defaultCountry="ID"
                                                    value={
                                                        formData.guardian_phone_number
                                                    }
                                                    onChange={
                                                        handlePhoneChangeGuardian
                                                    }
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                                {errors.guardian_phone_number && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.guardian_phone_number
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Guardian Address */}
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="guardian_address"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Guardian Address
                                                </label>
                                                <textarea
                                                    id="guardian_address"
                                                    name="guardian_address"
                                                    value={
                                                        formData.guardian_address
                                                    }
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                ></textarea>
                                                {errors.guardian_address && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.guardian_address
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Patient as Guardian Fields */}
                                    {formData.guardian_status === "Patient" && (
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
                                                            formData.guardian_patient_id
                                                    )}
                                                    onChange={
                                                        handlePatientChange
                                                    }
                                                    options={patientOptions}
                                                    placeholder="Select a patient"
                                                    isClearable
                                                    isSearchable
                                                    className="mt-1 block w-full"
                                                />
                                                {errors.guardian_patient_id && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.guardian_patient_id
                                                        }
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
                                                                {
                                                                    selectedPatient.name
                                                                }
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
                                                            Relationship with
                                                            Guardian
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="guardian_relationship"
                                                            name="guardian_relationship"
                                                            value={
                                                                formData.guardian_relationship
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
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
                                    {formData.guardian_status ===
                                        "Available Guardian" && (
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
                                                            parseInt(
                                                                formData.guardian_id
                                                            )
                                                    )}
                                                    onChange={
                                                        handleGuardianChange
                                                    }
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
                                                        Selected Guardian
                                                        Details
                                                    </h4>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500">
                                                                Name
                                                            </label>
                                                            <div className="mt-1 text-sm text-gray-800">
                                                                {
                                                                    selectedGuardian.name
                                                                }
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
                                                            Relationship with
                                                            Guardian
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="guardian_relationship"
                                                            name="guardian_relationship"
                                                            value={
                                                                formData.guardian_relationship
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
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
                        </>
                    )}

                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end">
                        <a
                            href="/karyawan/dashboard"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </AuthorizeLayout>
    );
};

export default CreateUser;
