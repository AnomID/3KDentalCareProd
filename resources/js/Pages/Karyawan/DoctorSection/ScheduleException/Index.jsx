// File: resources/js/Pages/Karyawan/DoctorSection/ScheduleException/Index.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import {
    Ban,
    Calendar,
    Clock,
    Stethoscope,
    AlertTriangle,
    CheckCircle,
    PlusCircle,
    FileText,
    User,
} from "lucide-react";

export default function Index({ exceptions, filters }) {
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        reason_filter: filters?.reason_filter || "all",
        date_filter: filters?.date_filter || "all",
    });

    const [isSearching, setIsSearching] = useState(false);

    const reasonColors = {
        Cuti: "bg-blue-50 text-blue-700 border-blue-200",
        Sakit: "bg-red-50 text-red-700 border-red-200",
        "Dinas Luar": "bg-yellow-50 text-yellow-700 border-yellow-200",
        Libur: "bg-green-50 text-green-700 border-green-200",
        Lainnya: "bg-gray-50 text-gray-700 border-gray-200",
    };

    const reasonIcons = {
        Cuti: Calendar,
        Sakit: AlertTriangle,
        "Dinas Luar": User,
        Libur: CheckCircle,
        Lainnya: FileText,
    };

    const handleSearch = () => {
        setIsSearching(true);
        router.get(route("schedule-exceptions.index"), searchParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleReset = () => {
        const resetParams = {
            search: "",
            reason_filter: "all",
            date_filter: "all",
        };
        setSearchParams(resetParams);
        setIsSearching(true);
        router.get(route("schedule-exceptions.index"), resetParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTimeRange = (exception) => {
        if (exception.is_full_day) {
            return "Full Day";
        }
        return `${exception.start_time?.substring(0, 5) || ""} - ${
            exception.end_time?.substring(0, 5) || ""
        }`;
    };

    const getDateRangeText = (exception) => {
        const startDate = formatDate(exception.exception_date_start);
        const endDate = formatDate(exception.exception_date_end);

        if (startDate === endDate) {
            return startDate;
        }
        return `${startDate} - ${endDate}`;
    };

    const isUpcoming = (exception) => {
        const startDate = new Date(exception.exception_date_start);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return startDate >= today;
    };

    const isPast = (exception) => {
        const endDate = new Date(exception.exception_date_end);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return endDate < today;
    };

    const getReasonIcon = (reason) => {
        const IconComponent = reasonIcons[reason] || FileText;
        return <IconComponent className="h-4 w-4 mr-1" />;
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
                placeholder="Search by doctor name..."
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

        // Reason Filter
        <div key="reason">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
            </label>
            <select
                value={searchParams.reason_filter}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        reason_filter: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                <option value="all">All Reasons</option>
                <option value="Cuti">Leave</option>
                <option value="Sakit">Sick</option>
                <option value="Dinas Luar">Official Duty</option>
                <option value="Libur">Holiday</option>
                <option value="Lainnya">Others</option>
            </select>
        </div>,

        // Date Filter
        <div key="date">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
            </label>
            <select
                value={searchParams.date_filter}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        date_filter: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                <option value="all">All Periods</option>
                <option value="upcoming">Upcoming</option>
                <option value="current">Current</option>
                <option value="past">Past</option>
            </select>
        </div>,
    ];

    // Table Headers
    const headers = [
        { label: "No.", field: "number", sortable: false },
        { label: "Doctor", field: "doctor", sortable: false },
        { label: "Period", field: "period", sortable: false },
        { label: "Time", field: "time", sortable: false },
        { label: "Reason", field: "reason", sortable: false },
        { label: "Status", field: "status", sortable: false },
        { label: "Notes", field: "notes", sortable: false },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer
    const renderRow = (exception, index) => (
        <tr
            key={exception.id}
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
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            dr. {exception.doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {exception.doctor.specialization}
                        </div>
                    </div>
                </div>
            </td>

            {/* Period */}
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <div className="text-sm text-gray-900">
                        {getDateRangeText(exception)}
                    </div>
                </div>
            </td>

            {/* Time */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <Clock className="h-4 w-4 text-green-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                        {formatTimeRange(exception)}
                    </div>
                </div>
            </td>

            {/* Reason */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        reasonColors[exception.reason] ||
                        "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                >
                    {getReasonIcon(exception.reason)}
                    {exception.reason}
                </span>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isPast(exception) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                    </span>
                ) : isUpcoming(exception) ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Clock className="h-4 w-4 mr-1" />
                        Upcoming
                    </span>
                ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        <Ban className="h-4 w-4 mr-1" />
                        Active
                    </span>
                )}
            </td>

            {/* Notes */}
            <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                    {exception.notes ? (
                        <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            {exception.notes}
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
                        href={route("schedule-exceptions.show", exception.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        View
                    </a>
                    {isUpcoming(exception) && (
                        <a
                            href={route(
                                "schedule-exceptions.edit",
                                exception.id
                            )}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Edit
                        </a>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <UnifiedIndexTemplate
            title="Schedule Exception Management"
            createRoute={route("schedule-exceptions.create")}
            createLabel="Add New Exception"
            createIcon={PlusCircle}
            data={exceptions}
            filters={filterComponents}
            filterTitle="Filter Schedule Exceptions"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={Ban}
            emptyStateTitle="No Schedule Exceptions Found"
            emptyStateDescription="No schedule exceptions match your current filter criteria. Try adjusting your search terms or reset the filters."
            onSearch={handleSearch}
            onReset={handleReset}
            sortField={null}
            sortDirection={null}
            isSearching={isSearching}
        />
    );
}
