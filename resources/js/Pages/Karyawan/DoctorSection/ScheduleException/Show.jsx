import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import FlashMessage from "@/Components/FlashMessage";

export default function Show({ exception, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState(flash?.success || "");
    const [errorMessage, setErrorMessage] = useState(flash?.error || "");

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTimeRange = (exception) => {
        if (exception.is_full_day) {
            return "Seharian";
        }
        return `${exception.start_time?.substring(0, 5) || ""} - ${
            exception.end_time?.substring(0, 5) || ""
        }`;
    };

    const handleDelete = () => {
        router.delete(route("schedule-exceptions.destroy", exception.id), {
            onSuccess: () => {
                // Redirect happens automatically on success
            },
            onError: (errors) => {
                setShowDeleteModal(false);
                if (errors.error) {
                    setErrorMessage(errors.error);
                }
            },
        });
    };

    return (
        <AuthorizeLayout>
            <Head title="Schedule Exception Details" />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Schedule Exception Details
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route(
                                "schedule-exceptions.edit",
                                exception.id
                            )}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Edit Exception
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Flash Messages */}
                {successMessage && (
                    <div className="mb-4">
                        <FlashMessage
                            type="success"
                            message={successMessage}
                            onClose={() => setSuccessMessage("")}
                        />
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4">
                        <FlashMessage
                            type="error"
                            message={errorMessage}
                            onClose={() => setErrorMessage("")}
                        />
                    </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Exception Information
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Date Range
                                </p>
                                <p className="font-medium">
                                    {formatDate(
                                        exception.exception_date_start
                                    ) ===
                                    formatDate(exception.exception_date_end)
                                        ? formatDate(
                                              exception.exception_date_start
                                          )
                                        : `${formatDate(
                                              exception.exception_date_start
                                          )} - ${formatDate(
                                              exception.exception_date_end
                                          )}`}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium">
                                    {formatTimeRange(exception)}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Reason</p>
                                <p className="font-medium">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                        {exception.reason}
                                    </span>
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Notes</p>
                                <p className="font-medium">
                                    {exception.notes || "-"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Doctor Information
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">
                                    {exception.doctor.name}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Specialization
                                </p>
                                <p className="font-medium">
                                    {exception.doctor.specialization}
                                </p>
                            </div>

                            <div className="mb-4">
                                <Link
                                    href={route(
                                        "doctors.show",
                                        exception.doctor.id
                                    )}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    View Doctor Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <Link
                        href={route("schedule-exceptions.index")}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Back to Exceptions
                    </Link>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete this schedule
                            exception? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthorizeLayout>
    );
}
