// File: resources/js/Pages/Karyawan/DoctorSection/Schedule/Index.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import {
    Calendar,
    Clock,
    Stethoscope,
    Users,
    CheckCircle,
    AlertTriangle,
    PlusCircle,
    FileText,
} from "lucide-react";

export default function Index({ schedules }) {
    const [searchParams, setSearchParams] = useState({
        search: "",
        day_filter: "all",
        status_filter: "all",
    });

    const [isSearching, setIsSearching] = useState(false);

    const dayNames = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
        all: "All Days",
    };

    const statusColors = {
        1: "bg-green-50 text-green-700 border-green-200", // Active
        0: "bg-red-50 text-red-700 border-red-200", // Inactive
    };

    const statusLabels = {
        1: "Active",
        0: "Inactive",
    };

    const handleSearch = () => {
        setIsSearching(true);
        // Since this is a simple filter, we can filter client-side
        setTimeout(() => setIsSearching(false), 500);
    };

    const handleReset = () => {
        setSearchParams({
            search: "",
            day_filter: "all",
            status_filter: "all",
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        return timeString.substring(0, 5);
    };

    // Filter schedules based on search params
    const filteredSchedules = schedules.filter((schedule) => {
        const matchesSearch =
            !searchParams.search ||
            schedule.doctor.name
                .toLowerCase()
                .includes(searchParams.search.toLowerCase()) ||
            schedule.doctor.specialization
                .toLowerCase()
                .includes(searchParams.search.toLowerCase());

        const matchesDay =
            searchParams.day_filter === "all" ||
            schedule.day_of_week.toString() === searchParams.day_filter;

        const matchesStatus =
            searchParams.status_filter === "all" ||
            (searchParams.status_filter === "active" && schedule.status) ||
            (searchParams.status_filter === "inactive" && !schedule.status);

        return matchesSearch && matchesDay && matchesStatus;
    });

    // Convert filtered schedules to paginated format for UnifiedIndexTemplate
    const paginatedSchedules = {
        data: filteredSchedules,
        current_page: 1,
        per_page: filteredSchedules.length,
        total: filteredSchedules.length,
        from: 1,
        to: filteredSchedules.length,
        links: [],
    };

    // Filter Components
    const filterComponents = [
        // Search Input
        <div key="search">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
            </label>
            <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchParams.search}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        search: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
        </div>,

        // Day Filter
        <div key="day">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
            </label>
            <select
                value={searchParams.day_filter}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        day_filter: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                <option value="all">All Days</option>
                {Object.entries(dayNames).map(([key, value]) => {
                    if (key !== "all") {
                        return (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        );
                    }
                    return null;
                })}
            </select>
        </div>,

        // Status Filter
        <div key="status">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
            </label>
            <select
                value={searchParams.status_filter}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        status_filter: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>,
    ];

    // Table Headers
    const headers = [
        { label: "No.", field: "number", sortable: false },
        { label: "Doctor", field: "doctor", sortable: false },
        { label: "Day", field: "day", sortable: false },
        { label: "Time", field: "time", sortable: false },
        { label: "Quota", field: "quota", sortable: false },
        { label: "Status", field: "status", sortable: false },
        { label: "Notes", field: "notes", sortable: false },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer
    const renderRow = (schedule, index) => (
        <tr
            key={schedule.id}
            className="hover:bg-gray-50 transition-colors duration-150"
        >
            {/* Number */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{index}</div>
            </td>

            {/* Doctor */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            dr. {schedule.doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {schedule.doctor.specialization}
                        </div>
                    </div>
                </div>
            </td>

            {/* Day */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
                    <Calendar className="h-4 w-4 mr-1" />
                    {dayNames[schedule.day_of_week]}
                </span>
            </td>

            {/* Time */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <Clock className="h-4 w-4 text-green-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                        {formatTime(schedule.start_time)} -{" "}
                        {formatTime(schedule.end_time)}
                    </div>
                </div>
            </td>

            {/* Quota */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <Users className="h-4 w-4 text-purple-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                        {schedule.schedule_quota?.quota ||
                            schedule.scheduleQuota?.quota ||
                            "Not set"}{" "}
                        patients
                    </div>
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        statusColors[schedule.status ? 1 : 0]
                    }`}
                >
                    {schedule.status ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 mr-1" />
                    )}
                    {statusLabels[schedule.status ? 1 : 0]}
                </span>
            </td>

            {/* Notes */}
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                    {schedule.notes ? (
                        <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            {schedule.notes}
                        </div>
                    ) : (
                        <span className="text-gray-500 italic">No notes</span>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <a
                        href={route("schedules.show", schedule.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        View
                    </a>
                    <a
                        href={route("schedules.edit", schedule.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Edit
                    </a>
                </div>
            </td>
        </tr>
    );

    return (
        <UnifiedIndexTemplate
            title="Schedule Management"
            createRoute={route("schedules.create")}
            createLabel="Add New Schedule"
            createIcon={PlusCircle}
            data={paginatedSchedules}
            filters={filterComponents}
            filterTitle="Filter Schedules"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={Calendar}
            emptyStateTitle="No Schedules Found"
            emptyStateDescription="No schedules match your current filter criteria. Try adjusting your search terms or reset the filters."
            onSearch={handleSearch}
            onReset={handleReset}
            sortField={null}
            sortDirection={null}
            isSearching={isSearching}
        />
    );
}
