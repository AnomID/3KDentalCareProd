import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import FlashMessage from "@/Components/FlashMessage";

export default function Create({ doctors }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        doctor_id: "",
        exception_date_start: "",
        exception_date_end: "",
        is_full_day: true,
        start_time: "",
        end_time: "",
        reason: "",
        notes: "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("schedule-exceptions.store"), {
            onSuccess: () => {
                reset();
                setSuccessMessage("Schedule exception created successfully");
            },
            onError: (errors) => {
                if (errors.overlap) {
                    setErrorMessage(errors.overlap);
                } else if (errors.error) {
                    setErrorMessage(errors.error);
                }
            },
        });
    };

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    return (
        <AuthorizeLayout>
            <Head title="Create Schedule Exception" />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Create New Schedule Exception
                    </h2>
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

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Doctor */}
                        <div>
                            <label
                                htmlFor="doctor_id"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Doctor
                            </label>
                            <select
                                id="doctor_id"
                                value={data.doctor_id}
                                onChange={(e) =>
                                    setData("doctor_id", e.target.value)
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name} - {doctor.specialization}
                                    </option>
                                ))}
                            </select>
                            {errors.doctor_id && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.doctor_id}
                                </div>
                            )}
                        </div>

                        {/* Exception Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Exception Type
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="is_full_day"
                                        checked={data.is_full_day}
                                        onChange={() =>
                                            setData("is_full_day", true)
                                        }
                                        className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2">Full Day</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="is_full_day"
                                        checked={!data.is_full_day}
                                        onChange={() =>
                                            setData("is_full_day", false)
                                        }
                                        className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2">Specific Hours</span>
                                </label>
                            </div>
                            {errors.is_full_day && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.is_full_day}
                                </div>
                            )}
                        </div>

                        {/* Start Date */}
                        <div>
                            <label
                                htmlFor="exception_date_start"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="exception_date_start"
                                min={today}
                                value={data.exception_date_start}
                                onChange={(e) =>
                                    setData(
                                        "exception_date_start",
                                        e.target.value
                                    )
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                            {errors.exception_date_start && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.exception_date_start}
                                </div>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <label
                                htmlFor="exception_date_end"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                End Date
                            </label>
                            <input
                                type="date"
                                id="exception_date_end"
                                min={data.exception_date_start || today}
                                value={data.exception_date_end}
                                onChange={(e) =>
                                    setData(
                                        "exception_date_end",
                                        e.target.value
                                    )
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                            {errors.exception_date_end && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.exception_date_end}
                                </div>
                            )}
                        </div>

                        {/* Time Range - Only show if not full day */}
                        {!data.is_full_day && (
                            <>
                                <div>
                                    <label
                                        htmlFor="start_time"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        id="start_time"
                                        value={data.start_time}
                                        onChange={(e) =>
                                            setData(
                                                "start_time",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required={!data.is_full_day}
                                    />
                                    {errors.start_time && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.start_time}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="end_time"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        id="end_time"
                                        value={data.end_time}
                                        onChange={(e) =>
                                            setData("end_time", e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required={!data.is_full_day}
                                    />
                                    {errors.end_time && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.end_time}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Reason */}
                        <div>
                            <label
                                htmlFor="reason"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Reason
                            </label>
                            <input
                                type="text"
                                id="reason"
                                value={data.reason}
                                onChange={(e) =>
                                    setData("reason", e.target.value)
                                }
                                placeholder="E.g., Cuti, Dinas Luar, etc."
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                maxLength={100}
                            />
                            {errors.reason && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.reason}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label
                            htmlFor="notes"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows="3"
                            placeholder="Additional information about this exception"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                        {errors.notes && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.notes}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? "Saving..." : "Save Exception"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthorizeLayout>
    );
}
