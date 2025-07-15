import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import FlashMessage from "@/Components/FlashMessage";

export default function Create({ patient, doctors }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        schedule_id: "",
        appointment_date: "",
        notes: "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [availableDates, setAvailableDates] = useState([]);
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [calendarView, setCalendarView] = useState(true);

    // Format date to be at least tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    // Calculate end date (30 days from today)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const maxDate = endDate.toISOString().split("T")[0];

    useEffect(() => {
        if (selectedDoctor) {
            fetchAvailableDates();
        } else {
            setAvailableDates([]);
        }
    }, [selectedDoctor]);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSchedules();
        } else {
            setAvailableSchedules([]);
        }
    }, [selectedDate]);

    const fetchAvailableDates = async () => {
        setLoadingDates(true);
        try {
            const response = await fetch(
                route("api.available-dates") +
                    `?doctor_id=${selectedDoctor}&start_date=${minDate}&end_date=${maxDate}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                    body: JSON.stringify({
                        doctor_id: selectedDoctor,
                        start_date: minDate,
                        end_date: maxDate,
                    }),
                }
            );
            const result = await response.json();

            if (result.available_dates) {
                setAvailableDates(result.available_dates);
            } else {
                setAvailableDates([]);
            }
        } catch (error) {
            console.error("Error fetching available dates:", error);
            setAvailableDates([]);
        } finally {
            setLoadingDates(false);
        }
    };

    const fetchAvailableSchedules = async () => {
        setLoadingSchedules(true);
        try {
            const response = await fetch(
                route("api.available-schedules") + `?date=${selectedDate}`
            );
            const result = await response.json();

            if (result.schedules) {
                // Filter schedules by selected doctor
                const doctorSchedules = result.schedules.filter(
                    (schedule) =>
                        schedule.doctor_id.toString() === selectedDoctor
                );
                setAvailableSchedules(doctorSchedules);
                setData("appointment_date", selectedDate);
            } else {
                setAvailableSchedules([]);
            }
        } catch (error) {
            console.error("Error fetching schedules:", error);
            setAvailableSchedules([]);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("appointments.store"), {
            onSuccess: () => {
                reset();
                setSuccessMessage("Appointment booked successfully");
                setSelectedDoctor("");
                setSelectedDate("");
                setAvailableDates([]);
                setAvailableSchedules([]);
            },
            onError: (errors) => {
                if (errors.date_mismatch) {
                    setErrorMessage(errors.date_mismatch);
                } else if (errors.exception) {
                    setErrorMessage(errors.exception);
                } else if (errors.quota) {
                    setErrorMessage(errors.quota);
                } else if (errors.duplicate) {
                    setErrorMessage(errors.duplicate);
                } else if (errors.error) {
                    setErrorMessage(errors.error);
                }
            },
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        return timeString.substring(0, 5); // Format HH:MM
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Generate calendar view
    const generateCalendar = () => {
        const today = new Date();
        const calendar = [];
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1); // Start from tomorrow

        // Create a map of available dates for quick lookup
        const availableDatesMap = {};
        availableDates.forEach((dateObj) => {
            availableDatesMap[dateObj.date] = true;
        });

        // Generate days for next 30 days
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateString = currentDate.toISOString().split("T")[0];

            calendar.push({
                date: dateString,
                dayName: currentDate.toLocaleDateString("id-ID", {
                    weekday: "short",
                }),
                dayNumber: currentDate.getDate(),
                month: currentDate.toLocaleDateString("id-ID", {
                    month: "short",
                }),
                isAvailable: availableDatesMap[dateString] || false,
            });
        }

        return calendar;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Book Appointment" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Book an Appointment
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Please select a doctor and an available date
                                    to book your appointment.
                                </p>
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

                            {/* Patient Information */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-md font-medium text-blue-800 mb-2">
                                    Patient Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-blue-600">
                                            Name
                                        </p>
                                        <p className="font-medium">
                                            {patient.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600">
                                            Medical Record Number
                                        </p>
                                        <p className="font-medium">
                                            {patient.no_rm || "Not assigned"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Steps */}
                            <div className="mb-6">
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex">
                                        <button
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                !selectedDoctor
                                                    ? "border-indigo-500 text-indigo-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                            disabled={!selectedDoctor}
                                        >
                                            1. Select Doctor
                                        </button>
                                        <span className="py-4 px-1 text-gray-400 mx-2">
                                            {">"}
                                        </span>
                                        <button
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                selectedDoctor && !selectedDate
                                                    ? "border-indigo-500 text-indigo-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                            disabled={
                                                !selectedDoctor || selectedDate
                                            }
                                        >
                                            2. Select Date
                                        </button>
                                        <span className="py-4 px-1 text-gray-400 mx-2">
                                            {">"}
                                        </span>
                                        <button
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                selectedDate &&
                                                !data.schedule_id
                                                    ? "border-indigo-500 text-indigo-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                            disabled={
                                                !selectedDate ||
                                                data.schedule_id
                                            }
                                        >
                                            3. Select Time
                                        </button>
                                        <span className="py-4 px-1 text-gray-400 mx-2">
                                            {">"}
                                        </span>
                                        <button
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                data.schedule_id
                                                    ? "border-indigo-500 text-indigo-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                            disabled={!data.schedule_id}
                                        >
                                            4. Confirm
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Step 1: Select Doctor */}
                            {!selectedDoctor && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Select a Doctor
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {doctors.map((doctor) => (
                                            <div
                                                key={doctor.id}
                                                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                                                onClick={() =>
                                                    setSelectedDoctor(
                                                        doctor.id.toString()
                                                    )
                                                }
                                            >
                                                <div className="font-medium text-lg mb-1">
                                                    {doctor.name}
                                                </div>
                                                <div className="text-indigo-600 mb-2">
                                                    {doctor.specialization}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedDoctor(
                                                            doctor.id.toString()
                                                        );
                                                    }}
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Date */}
                            {selectedDoctor && !selectedDate && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Select a Date
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                className={`px-3 py-1.5 border rounded-md text-sm font-medium ${
                                                    calendarView
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }`}
                                                onClick={() =>
                                                    setCalendarView(true)
                                                }
                                            >
                                                Calendar View
                                            </button>
                                            <button
                                                type="button"
                                                className={`px-3 py-1.5 border rounded-md text-sm font-medium ${
                                                    !calendarView
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }`}
                                                onClick={() =>
                                                    setCalendarView(false)
                                                }
                                            >
                                                List View
                                            </button>
                                        </div>
                                    </div>

                                    {loadingDates ? (
                                        <div className="flex justify-center items-center py-12">
                                            <svg
                                                className="animate-spin h-8 w-8 text-indigo-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span className="ml-2 text-indigo-600">
                                                Loading available dates...
                                            </span>
                                        </div>
                                    ) : availableDates.length === 0 ? (
                                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md mb-4">
                                            No available dates for this doctor
                                            in the next 30 days. Please select
                                            another doctor.
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedDoctor("")
                                                }
                                                className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-yellow-600 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                            >
                                                Back to Doctor Selection
                                            </button>
                                        </div>
                                    ) : calendarView ? (
                                        <div className="grid grid-cols-7 gap-2">
                                            {/* Calendar header */}
                                            {[
                                                "Min",
                                                "Sen",
                                                "Sel",
                                                "Rab",
                                                "Kam",
                                                "Jum",
                                                "Sab",
                                            ].map((day) => (
                                                <div
                                                    key={day}
                                                    className="text-center font-medium text-gray-700 p-2"
                                                >
                                                    {day}
                                                </div>
                                            ))}

                                            {/* Calendar days */}
                                            {generateCalendar().map(
                                                (day, index) => (
                                                    <div
                                                        key={index}
                                                        className={`border rounded-md p-2 text-center ${
                                                            day.isAvailable
                                                                ? "cursor-pointer hover:border-indigo-300 hover:shadow-sm"
                                                                : "opacity-50 bg-gray-50"
                                                        }`}
                                                        onClick={() =>
                                                            day.isAvailable &&
                                                            setSelectedDate(
                                                                day.date
                                                            )
                                                        }
                                                    >
                                                        <div className="text-xs text-gray-500">
                                                            {day.dayName}
                                                        </div>
                                                        <div
                                                            className={`text-lg font-medium ${
                                                                day.isAvailable
                                                                    ? "text-indigo-600"
                                                                    : "text-gray-400"
                                                            }`}
                                                        >
                                                            {day.dayNumber}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {day.month}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {availableDates.map(
                                                (dateObj, index) => (
                                                    <div
                                                        key={index}
                                                        className="border rounded-md p-4 cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                                                        onClick={() =>
                                                            setSelectedDate(
                                                                dateObj.date
                                                            )
                                                        }
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-medium">
                                                                    {formatDate(
                                                                        dateObj.date
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {dateObj.has_available_quota
                                                                        ? "Slots available"
                                                                        : "Limited availability"}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            >
                                                                Select
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedDoctor("")
                                            }
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Select Time Slot */}
                            {selectedDate && !data.schedule_id && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Select a Time Slot for{" "}
                                        {formatDate(selectedDate)}
                                    </h3>

                                    {loadingSchedules ? (
                                        <div className="flex justify-center items-center py-12">
                                            <svg
                                                className="animate-spin h-8 w-8 text-indigo-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span className="ml-2 text-indigo-600">
                                                Loading available time slots...
                                            </span>
                                        </div>
                                    ) : availableSchedules.length === 0 ? (
                                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md mb-4">
                                            No available time slots for this
                                            date. Please select another date.
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedDate("")
                                                }
                                                className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-yellow-600 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                            >
                                                Back to Date Selection
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {availableSchedules.map(
                                                (schedule) => (
                                                    <div
                                                        key={schedule.id}
                                                        className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                            schedule.is_available
                                                                ? "hover:border-indigo-300"
                                                                : "opacity-50 cursor-not-allowed"
                                                        }`}
                                                        onClick={() =>
                                                            schedule.is_available &&
                                                            setData(
                                                                "schedule_id",
                                                                schedule.id.toString()
                                                            )
                                                        }
                                                    >
                                                        <div className="font-medium mb-1">
                                                            {formatTime(
                                                                schedule.start_time
                                                            )}{" "}
                                                            -{" "}
                                                            {formatTime(
                                                                schedule.end_time
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mb-2">
                                                            {schedule.is_available
                                                                ? `${schedule.remaining_quota} slots available`
                                                                : "No slots available"}
                                                        </div>
                                                        {schedule.notes && (
                                                            <div className="text-xs text-gray-500 mb-2">
                                                                Note:{" "}
                                                                {schedule.notes}
                                                            </div>
                                                        )}
                                                        {schedule.is_available && (
                                                            <button
                                                                type="button"
                                                                className="mt-2 inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setData(
                                                                        "schedule_id",
                                                                        schedule.id.toString()
                                                                    );
                                                                }}
                                                            >
                                                                Select
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedDate("")}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirm Booking */}
                            {data.schedule_id && (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Confirm Your Appointment
                                        </h3>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Doctor
                                                    </p>
                                                    <p className="font-medium">
                                                        {
                                                            doctors.find(
                                                                (d) =>
                                                                    d.id.toString() ===
                                                                    selectedDoctor
                                                            )?.name
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Specialization
                                                    </p>
                                                    <p className="font-medium">
                                                        {
                                                            doctors.find(
                                                                (d) =>
                                                                    d.id.toString() ===
                                                                    selectedDoctor
                                                            )?.specialization
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Date
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatDate(
                                                            selectedDate
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Time
                                                    </p>
                                                    <p className="font-medium">
                                                        {formatTime(
                                                            availableSchedules.find(
                                                                (s) =>
                                                                    s.id.toString() ===
                                                                    data.schedule_id
                                                            )?.start_time
                                                        )}{" "}
                                                        -
                                                        {formatTime(
                                                            availableSchedules.find(
                                                                (s) =>
                                                                    s.id.toString() ===
                                                                    data.schedule_id
                                                            )?.end_time
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label
                                                htmlFor="notes"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Notes (optional)
                                            </label>
                                            <textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        "notes",
                                                        e.target.value
                                                    )
                                                }
                                                rows="3"
                                                placeholder="Add any relevant information for your appointment"
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            ></textarea>
                                            {errors.notes && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {errors.notes}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-start mb-4">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="terms"
                                                    type="checkbox"
                                                    required
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label
                                                    htmlFor="terms"
                                                    className="font-medium text-gray-700"
                                                >
                                                    I agree to the terms and
                                                    conditions
                                                </label>
                                                <p className="text-gray-500">
                                                    I understand that I need to
                                                    arrive 15 minutes before my
                                                    appointment time.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData("schedule_id", "")
                                                }
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            >
                                                {processing
                                                    ? "Booking..."
                                                    : "Confirm Booking"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
