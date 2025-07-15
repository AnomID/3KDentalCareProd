import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import FlashMessage from "@/Components/FlashMessage";

export default function Show({ schedule, flash }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState(flash?.success || "");
    const [errorMessage, setErrorMessage] = useState(flash?.error || "");

    const dayNames = {
        0: "Minggu",
        1: "Senin",
        2: "Selasa",
        3: "Rabu",
        4: "Kamis",
        5: "Jumat",
        6: "Sabtu",
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        return timeString.substring(0, 5); // Format HH:MM
    };

    const handleDelete = () => {
        router.delete(route("schedules.destroy", schedule.id), {
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
            <Head
                title={`Schedule Details: ${dayNames[schedule.day_of_week]}`}
            />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Schedule Details
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route("schedules.edit", schedule.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Edit Schedule
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
                                Schedule Information
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Day</p>
                                <p className="font-medium">
                                    {dayNames[schedule.day_of_week]}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium">
                                    {formatTime(schedule.start_time)} -{" "}
                                    {formatTime(schedule.end_time)}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            schedule.status
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {schedule.status
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Notes</p>
                                <p className="font-medium">
                                    {schedule.notes || "-"}
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
                                    {schedule.doctor.name}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Specialization
                                </p>
                                <p className="font-medium">
                                    {schedule.doctor.specialization}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Patient Quota
                                </p>
                                <p className="font-medium">
                                    {schedule.schedule_quota?.quota ??
                                        schedule.scheduleQuota?.quota ??
                                        "Belum diset"}{" "}
                                    Pasien
                                </p>
                            </div>

                            <div className="mb-4">
                                <Link
                                    href={route(
                                        "doctors.show",
                                        schedule.doctor.id
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
                        href={route("schedules.index")}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Back to Schedules
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
                            Are you sure you want to delete this schedule? This
                            action cannot be undone.
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
