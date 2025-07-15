import React, { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

export default function Edit({ guardian }) {
    const isEditing = !!guardian;
    const { data, setData, post, put, errors, processing } = useForm({
        name: guardian ? guardian.name : "",
        relationship: guardian ? guardian.relationship : "",
        identity_type: guardian ? guardian.identity_type : "",
        identity_number: guardian ? guardian.identity_number : "",
        phone_number: guardian ? guardian.phone_number : "",
        address: guardian ? guardian.address : "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route("guardians.update", guardian.id), {
                onSuccess: () => {
                    setSuccessMessage("Guardian updated successfully!");
                    setTimeout(() => setSuccessMessage(""), 5000);
                },
                onError: () => {
                    setErrorMessage(
                        "Error updating guardian. Please check the form."
                    );
                    setTimeout(() => setErrorMessage(""), 5000);
                },
            });
        } else {
            post(route("guardians.store"), {
                onSuccess: () => {
                    setSuccessMessage("Guardian created successfully!");
                    setTimeout(() => setSuccessMessage(""), 5000);
                },
                onError: () => {
                    setErrorMessage(
                        "Error creating guardian. Please check the form."
                    );
                    setTimeout(() => setErrorMessage(""), 5000);
                },
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <AuthorizeLayout>
            <Head
                title={
                    isEditing
                        ? `Edit Guardian: ${guardian.name}`
                        : "Create Guardian"
                }
            />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isEditing
                            ? "Edit Guardian Information"
                            : "Create New Guardian"}
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
                                Guardian Information
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

                        {/* Relationship */}
                        <div>
                            <label
                                htmlFor="relationship"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Relationship
                            </label>
                            <input
                                type="text"
                                id="relationship"
                                name="relationship"
                                value={data.relationship}
                                onChange={handleInputChange}
                                placeholder="e.g. Parent, Spouse, Child"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.relationship && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.relationship}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone_number"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Phone Number
                            </label>
                            <input
                                type="text"
                                id="phone_number"
                                name="phone_number"
                                value={data.phone_number}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.phone_number && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone_number}
                                </p>
                            )}
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
                            </select>
                            {errors.identity_type && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.identity_type}
                                </p>
                            )}
                        </div>

                        {/* Identity Number */}
                        <div>
                            <label
                                htmlFor="identity_number"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Identity Number
                            </label>
                            <input
                                type="text"
                                id="identity_number"
                                name="identity_number"
                                value={data.identity_number}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.identity_number && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.identity_number}
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
                            ></textarea>
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end">
                        <Link
                            href={
                                isEditing
                                    ? route("guardians.show", guardian.id)
                                    : route("guardians.index")
                            }
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {processing
                                ? isEditing
                                    ? "Saving..."
                                    : "Creating..."
                                : isEditing
                                ? "Save Changes"
                                : "Create Guardian"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthorizeLayout>
    );
}
