import React, { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

export default function Edit({ doctor }) {
    const { data, setData, put, errors, processing } = useForm({
        name: doctor.name || "",
        specialization: doctor.specialization || "",
        license_number: doctor.license_number || "",
        license_start_date: doctor.license_start_date
            ? doctor.license_start_date.split("T")[0]
            : "",
        license_expiry_date: doctor.license_expiry_date
            ? doctor.license_expiry_date.split("T")[0]
            : "",
        phone: doctor.phone || "",
        address: doctor.address || "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route("doctors.update", doctor.id), {
            onSuccess: () => {
                setSuccessMessage("Doctor updated successfully!");
                setTimeout(() => setSuccessMessage(""), 5000);
            },
            onError: () => {
                setErrorMessage(
                    "Error updating doctor. Please check the form."
                );
                setTimeout(() => setErrorMessage(""), 5000);
            },
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <AuthorizeLayout>
            <Head title={`Edit Doctor: ${doctor.name}`} />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Edit Doctor Information
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Doctor Code: {doctor.code}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Basic Information
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
                                value={data.specialization}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.specialization && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.specialization}
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

                    {/* License Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                License Information
                            </h3>
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
                                value={data.license_number}
                                onChange={handleInputChange}
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
                                value={data.license_start_date}
                                onChange={handleInputChange}
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
                                value={data.license_expiry_date}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.license_expiry_date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.license_expiry_date}
                                </p>
                            )}
                        </div>

                        {/* Help text */}
                        <div className="md:col-span-2">
                            <div className="p-4 bg-blue-50 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-blue-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            Please ensure that the license
                                            expiry date is after the license
                                            start date. The license number must
                                            be unique in the system.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end">
                        <Link
                            href={route("doctors.show", doctor.id)}
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
