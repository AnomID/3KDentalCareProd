// Enhanced Appointment Index Page
// File: resources/js/Pages/Employee/Appointments/Index.jsx

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    CheckCircle,
    UserPlus,
    XCircle,
    AlertTriangle,
    Search,
    Eye,
    CalendarDays,
    Timer,
} from "lucide-react";

export default function Appointments({
    appointments,
    statistics,
    filterOptions,
    filters,
    sorting,
}) {
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        date_from: filters?.date_from || "",
        date_to: filters?.date_to || "",
        status: filters?.status || "all",
        doctor_id: filters?.doctor_id || "all",
        period: filters?.period || "",
        per_page: filters?.per_page || 10,
    });

    const [isSearching, setIsSearching] = useState(false);

    // Status configurations
    const statusColors = {
        scheduled: "bg-blue-50 text-blue-700 border-blue-200",
        confirmed: "bg-green-50 text-green-700 border-green-200",
        completed: "bg-purple-50 text-purple-700 border-purple-200",
        canceled: "bg-red-50 text-red-700 border-red-200",
        no_show: "bg-gray-50 text-gray-700 border-gray-200",
    };

    const statusLabels = {
        scheduled: "Scheduled",
        confirmed: "Confirmed",
        completed: "Completed",
        canceled: "Canceled",
        no_show: "No Show",
        all: "All Status",
    };

    const statusIcons = {
        scheduled: Clock,
        confirmed: CheckCircle,
        completed: CheckCircle,
        canceled: XCircle,
        no_show: AlertTriangle,
    };

    // Handle search functionality
    const handleSearch = () => {
        setIsSearching(true);
        router.get(route("employee.appointments.index"), searchParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // Handle reset filters
    const handleReset = () => {
        const resetParams = {
            search: "",
            date_from: "",
            date_to: "",
            status: "all",
            doctor_id: "all",
            period: "",
            per_page: 10,
        };
        setSearchParams(resetParams);
        setIsSearching(true);
        router.get(route("employee.appointments.index"), resetParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // Handle sorting
    const handleSort = (field) => {
        const newDirection =
            sorting.field === field && sorting.direction === "asc"
                ? "desc"
                : "asc";

        router.get(
            route("employee.appointments.index"),
            {
                ...searchParams,
                sort: field,
                direction: newDirection,
            },
            {
                preserveState: true,
            }
        );
    };

    // Handle status change
    const handleStatusChange = (appointment, newStatus) => {
        const statusMessages = {
            confirmed: "confirm this appointment?",
            completed: "mark this appointment as completed?",
            canceled: "cancel this appointment?",
            no_show: "mark patient as no show?",
        };

        if (confirm(`Are you sure you want to ${statusMessages[newStatus]}`)) {
            router.put(
                route("employee.appointments.update-status", appointment.id),
                { status: newStatus },
                {
                    preserveState: true,
                }
            );
        }
    };

    // Filter Components
    const filterComponents = [
        // Search Filter
        <div key="search">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
            </label>
            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                />
                <input
                    type="text"
                    placeholder="Search by patient, doctor, or appointment number..."
                    value={searchParams.search}
                    onChange={(e) =>
                        setSearchParams({
                            ...searchParams,
                            search: e.target.value,
                        })
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
            </div>
        </div>,

        // Date From Filter
        <div key="date_from">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
            </label>
            <input
                type="date"
                value={searchParams.date_from}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        date_from: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
        </div>,

        // Date To Filter
        <div key="date_to">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
            </label>
            <input
                type="date"
                value={searchParams.date_to}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        date_to: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
        </div>,

        // Status Filter
        <div key="status">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
            </label>
            <select
                value={searchParams.status}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        status: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.statuses?.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
        </div>,

        // Doctor Filter (if available)
        ...(filterOptions?.doctors
            ? [
                  <div key="doctor_id">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doctor
                      </label>
                      <select
                          value={searchParams.doctor_id}
                          onChange={(e) =>
                              setSearchParams({
                                  ...searchParams,
                                  doctor_id: e.target.value,
                              })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      >
                          {filterOptions.doctors.map((doctor) => (
                              <option key={doctor.value} value={doctor.value}>
                                  {doctor.label}
                              </option>
                          ))}
                      </select>
                  </div>,
              ]
            : []),

        // Period Filter
        <div key="period">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
            </label>
            <select
                value={searchParams.period}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        period: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.periods?.map((period) => (
                    <option key={period.value} value={period.value}>
                        {period.label}
                    </option>
                ))}
            </select>
        </div>,

        // Per Page Filter
        <div key="per_page">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Per Page
            </label>
            <select
                value={searchParams.per_page}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        per_page: parseInt(e.target.value),
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.per_page_options?.map((option) => (
                    <option key={option} value={option}>
                        {option} items
                    </option>
                ))}
            </select>
        </div>,
    ];

    // Table Headers
    const headers = [
        { label: "No.", field: "number", sortable: false },
        { label: "Patient", field: "patient_name", sortable: true },
        { label: "Doctor", field: "doctor_name", sortable: true },
        { label: "Date & Time", field: "appointment_date", sortable: true },
        { label: "Queue", field: "queue", sortable: false },
        { label: "Status", field: "status", sortable: true },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer
    const renderRow = (appointment, index) => {
        const StatusIcon = statusIcons[appointment.status] || Clock;

        return (
            <tr
                key={appointment.id}
                className="hover:bg-gray-50 transition-colors duration-150"
            >
                {/* Number */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                        {index}
                    </div>
                </td>

                {/* Patient */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {appointment.patient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                RM: {appointment.patient.no_rm || "Not set"}
                            </div>
                            {appointment.patient.phone && (
                                <div className="text-xs text-gray-400">
                                    {appointment.patient.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </td>

                {/* Doctor */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                                dr. {appointment.doctor.name}
                            </div>
                            {appointment.doctor.specialization && (
                                <div className="text-sm text-gray-500">
                                    {appointment.doctor.specialization}
                                </div>
                            )}
                        </div>
                    </div>
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4">
                    <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                {new Date(
                                    appointment.appointment_date
                                ).toLocaleDateString("id-ID", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Timer className="h-4 w-4 mr-1" />
                                {appointment.appointment_time?.substring(
                                    0,
                                    5
                                )}{" "}
                                WIB
                            </div>
                        </div>
                    </div>
                </td>

                {/* Queue */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {appointment.queue
                                ? appointment.queue.formatted_queue_number ||
                                  (appointment.queue.queue_number
                                      ? "A" +
                                        String(
                                            appointment.queue.queue_number
                                        ).padStart(3, "0")
                                      : "-")
                                : "-"}
                        </span>
                    </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                            statusColors[appointment.status]
                        }`}
                    >
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusLabels[appointment.status]}
                    </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                        <a
                            href={route(
                                "employee.appointments.show",
                                appointment.id
                            )}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Eye size={14} className="mr-1" />
                            View
                        </a>

                        {appointment.status === "scheduled" && (
                            <button
                                onClick={() =>
                                    handleStatusChange(appointment, "confirmed")
                                }
                                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <CheckCircle size={14} className="mr-1" />
                                Confirm
                            </button>
                        )}

                        {["scheduled", "confirmed"].includes(
                            appointment.status
                        ) && (
                            <button
                                onClick={() =>
                                    handleStatusChange(appointment, "completed")
                                }
                                className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Complete
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <UnifiedIndexTemplate
            title="Appointment Management"
            createRoute={route("employee.appointments.create-for-patient")}
            createLabel="Create New Appointment"
            createIcon={UserPlus}
            data={appointments}
            filters={filterComponents}
            filterTitle="Filter Appointments"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={Calendar}
            emptyStateTitle="No Appointments Found"
            emptyStateDescription="No appointments match your current filter criteria. Try adjusting your search terms or reset the filters to see all appointments."
            onSearch={handleSearch}
            onReset={handleReset}
            onSort={handleSort}
            sortField={sorting?.field}
            sortDirection={sorting?.direction}
            isSearching={isSearching}
            statistics={statistics}
        />
    );
}
