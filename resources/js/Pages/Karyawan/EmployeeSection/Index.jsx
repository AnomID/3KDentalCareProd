// File: resources/js/Pages/Karyawan/EmployeeSection/Index.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import EmployeeStatistics from "@/Components/EmployeeStatistics";
import {
    User,
    UserPlus,
    Phone,
    Mail,
    Briefcase,
    Hash,
    MapPin,
    Search,
    Eye,
    Edit,
    UserCheck,
    UserX,
    CheckCircle,
    XCircle,
    Calendar,
} from "lucide-react";

export default function Index({
    employees,
    statistics,
    filterOptions,
    filters,
    sorting,
}) {
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        filter_position: filters?.filter_position || "all",
        filter_user_status: filters?.filter_user_status || "all",
        period: filters?.period || "",
        per_page: filters?.per_page || 10,
    });

    const [isSearching, setIsSearching] = useState(false);

    // Handle search functionality
    const handleSearch = () => {
        setIsSearching(true);
        router.get(route("employees.index"), searchParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // Handle reset filters
    const handleReset = () => {
        const resetParams = {
            search: "",
            filter_position: "all",
            filter_user_status: "all",
            period: "",
            per_page: 10,
        };
        setSearchParams(resetParams);
        setIsSearching(true);
        router.get(route("employees.index"), resetParams, {
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
            route("employees.index"),
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getUserStatusBadge = (employee) => {
        if (!employee.has_user_account) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-800 border border-red-200">
                    <UserX className="h-4 w-4 mr-1" />
                    No Account
                </span>
            );
        }

        if (employee.user_verified) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-800 border border-orange-200">
                <UserCheck className="h-4 w-4 mr-1" />
                Unverified
            </span>
        );
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
                    placeholder="Search by name, code, or position..."
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

        // Position Filter
        <div key="position">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
            </label>
            <select
                value={searchParams.filter_position}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_position: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.positions?.map((position) => (
                    <option key={position.value} value={position.value}>
                        {position.label}
                    </option>
                ))}
            </select>
        </div>,

        // User Status Filter
        <div key="user_status">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                User Account Status
            </label>
            <select
                value={searchParams.filter_user_status}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_user_status: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.user_status?.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
        </div>,

        // Period Filter
        <div key="period">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Period
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
        { label: "Code", field: "code", sortable: true },
        { label: "Employee", field: "name", sortable: true },
        { label: "Position", field: "position", sortable: true },
        { label: "User Status", field: "user_status", sortable: false },
        { label: "Contact", field: "contact", sortable: false },
        { label: "Joined", field: "created_at", sortable: true },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer
    const renderRow = (employee, index) => (
        <tr
            key={employee.id}
            className="hover:bg-gray-50 transition-colors duration-150"
        >
            {/* Number */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{index}</div>
            </td>

            {/* Code */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
                    <Hash className="h-4 w-4 mr-1" />
                    {employee.code}
                </span>
            </td>

            {/* Employee Info */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            ID: {employee.id}
                        </div>
                        {employee.email && (
                            <div className="text-xs text-blue-600 truncate max-w-xs">
                                {employee.email}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* Position */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-800 border border-purple-200">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {employee.position}
                </span>
            </td>

            {/* User Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                {getUserStatusBadge(employee)}
            </td>

            {/* Contact */}
            <td className="px-6 py-4">
                <div className="space-y-2">
                    {employee.phone && (
                        <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-900">
                                {employee.phone}
                            </span>
                        </div>
                    )}
                    {employee.address && (
                        <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-600 truncate max-w-xs">
                                {employee.address}
                            </span>
                        </div>
                    )}
                    {!employee.phone && !employee.address && (
                        <span className="text-sm text-gray-500 italic">
                            No contact data
                        </span>
                    )}
                </div>
            </td>

            {/* Joined Date */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                        <div className="text-sm text-gray-900">
                            {formatDate(employee.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                            {formatTime(employee.created_at)}
                        </div>
                    </div>
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <a
                        href={route("employees.show", employee.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <Eye size={14} className="mr-1" />
                        View
                    </a>
                    <a
                        href={route("employees.edit", employee.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <Edit size={14} className="mr-1" />
                        Edit
                    </a>
                </div>
            </td>
        </tr>
    );

    return (
        <UnifiedIndexTemplate
            title="Employee Management"
            createRoute={route("employee.create")}
            createLabel="Add New Employee"
            createIcon={UserPlus}
            data={employees}
            filters={filterComponents}
            filterTitle="Filter Employees"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={User}
            emptyStateTitle="No Employees Found"
            emptyStateDescription="No employees match your current filter criteria. Try adjusting your search terms or reset the filters."
            onSearch={handleSearch}
            onReset={handleReset}
            onSort={handleSort}
            sortField={sorting?.field}
            sortDirection={sorting?.direction}
            isSearching={isSearching}
            statistics={null}
            statisticsPosition="top"
            customStatisticsComponent={
                <EmployeeStatistics statistics={statistics} />
            }
        />
    );
}
