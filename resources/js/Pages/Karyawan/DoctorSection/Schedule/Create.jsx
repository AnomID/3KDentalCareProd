import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import FlashMessage from "@/Components/FlashMessage";

export default function Create({ doctors, days }) {
    // Helper function to convert time to 24-hour format
    const convertTo24Hour = (time12h) => {
        if (!time12h) return "";

        // If already in 24-hour format, return as is
        if (!/AM|PM/i.test(time12h)) {
            return time12h.substring(0, 5);
        }

        const [time, period] = time12h.split(" ");
        let [hours, minutes] = time.split(":");

        if (period?.toUpperCase() === "PM" && hours !== "12") {
            hours = parseInt(hours, 10) + 12;
        }
        if (period?.toUpperCase() === "AM" && hours === "12") {
            hours = "00";
        }

        return `${hours.toString().padStart(2, "0")}:${minutes}`;
    };

    // Helper function to convert 24-hour to 12-hour format for display
    const convertTo12Hour = (time24h) => {
        if (!time24h) return "";

        const [hours, minutes] = time24h.split(":");
        const hour12 = parseInt(hours, 10);
        const period = hour12 >= 12 ? "PM" : "AM";
        const displayHour =
            hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;

        return `${displayHour}:${minutes} ${period}`;
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        doctor_id: "",
        day_of_week: "",
        start_time: "",
        end_time: "",
        status: true,
        quota: 10,
        notes: "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure times are in 24-hour format before sending
        const submitData = {
            ...data,
            start_time: convertTo24Hour(data.start_time),
            end_time: convertTo24Hour(data.end_time),
        };

        post(route("schedules.store"), {
            data: submitData,
            onSuccess: () => {
                reset();
                setSuccessMessage("Schedule created successfully");
            },
            onError: (errors) => {
                if (errors.overlap) {
                    setErrorMessage(errors.overlap);
                } else if (errors.error) {
                    setErrorMessage(errors.error);
                } else if (errors.start_time) {
                    setErrorMessage(errors.start_time);
                } else if (errors.end_time) {
                    setErrorMessage(errors.end_time);
                }
            },
        });
    };

    const handleTimeChange = (field, value) => {
        // Convert the time value to ensure consistency
        const convertedTime = convertTo24Hour(value);
        setData(field, convertedTime);
    };

    return (
        <AuthorizeLayout>
            <Head title="Create Schedule" />

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Create New Schedule
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

                        {/* Day of Week */}
                        <div>
                            <label
                                htmlFor="day_of_week"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Day
                            </label>
                            <select
                                id="day_of_week"
                                value={data.day_of_week}
                                onChange={(e) =>
                                    setData("day_of_week", e.target.value)
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="">Select Day</option>
                                {Object.entries(days).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            {errors.day_of_week && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.day_of_week}
                                </div>
                            )}
                        </div>

                        {/* Start Time */}
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
                                    handleTimeChange(
                                        "start_time",
                                        e.target.value
                                    )
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                            {errors.start_time && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.start_time}
                                </div>
                            )}
                            {data.start_time && (
                                <div className="text-sm text-gray-500 mt-1">
                                    Display: {convertTo12Hour(data.start_time)}
                                </div>
                            )}
                        </div>

                        {/* End Time */}
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
                                    handleTimeChange("end_time", e.target.value)
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                            {errors.end_time && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.end_time}
                                </div>
                            )}
                            {data.end_time && (
                                <div className="text-sm text-gray-500 mt-1">
                                    Display: {convertTo12Hour(data.end_time)}
                                </div>
                            )}
                        </div>

                        {/* Quota */}
                        <div>
                            <label
                                htmlFor="quota"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Patient Quota
                            </label>
                            <input
                                type="number"
                                id="quota"
                                min="1"
                                value={data.quota}
                                onChange={(e) =>
                                    setData("quota", e.target.value)
                                }
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                            {errors.quota && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.quota}
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={data.status}
                                        onChange={() => setData("status", true)}
                                        className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2">Active</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={!data.status}
                                        onChange={() =>
                                            setData("status", false)
                                        }
                                        className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2">Inactive</span>
                                </label>
                            </div>
                            {errors.status && (
                                <div className="text-red-500 text-sm mt-1">
                                    {errors.status}
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
                            {processing ? "Saving..." : "Save Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthorizeLayout>
    );
}
