// File: resources/js/Pages/Karyawan/UserSection/Index.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import UserStatistics from "@/Components/UserStatistics";
import {
    User,
    UserPlus,
    Mail,
    Calendar,
    Shield,
    Settings,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    Crown,
    Stethoscope,
    Briefcase,
    Users,
} from "lucide-react";

export default function Index({
    users,
    statistics,
    filterOptions,
    filters,
    sorting,
}) {
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        filter_role: filters?.filter_role || "all",
        filter_profile: filters?.filter_profile || "all",
        period: filters?.period || "",
        per_page: filters?.per_page || 10,
    });

    const [isSearching, setIsSearching] = useState(false);

    const roleColors = {
        admin: "bg-red-50 text-red-700 border-red-200",
        doctor: "bg-blue-50 text-blue-700 border-blue-200",
        employee: "bg-green-50 text-green-700 border-green-200",
        patient: "bg-purple-50 text-purple-700 border-purple-200",
    };

    const roleLabels = {
        admin: "Admin",
        doctor: "Doctor",
        employee: "Employee",
        patient: "Patient",
    };

    const roleIcons = {
        admin: Crown,
        doctor: Stethoscope,
        employee: Briefcase,
        patient: User,
    };

    // Handle search functionality
    const handleSearch = () => {
        setIsSearching(true);
        router.get(route("users.index"), searchParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // Handle reset filters
    const handleReset = () => {
        const resetParams = {
            search: "",
            filter_role: "all",
            filter_profile: "all",
            period: "",
            per_page: 10,
        };
        setSearchParams(resetParams);
        setIsSearching(true);
        router.get(route("users.index"), resetParams, {
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
            route("users.index"),
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
                    placeholder="Search by name, email, or role..."
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

        // Role Filter
        <div key="role">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
            </label>
            <select
                value={searchParams.filter_role}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_role: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.roles?.map((role) => (
                    <option key={role.value} value={role.value}>
                        {role.label}
                    </option>
                ))}
            </select>
        </div>,

        // Profile Status Filter
        <div key="profile">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Status
            </label>
            <select
                value={searchParams.filter_profile}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_profile: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.profile_status?.map((status) => (
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
        { label: "User", field: "name", sortable: true },
        { label: "Email", field: "email", sortable: true },
        { label: "Role", field: "role", sortable: true },
        { label: "Profile Status", field: "profile", sortable: false },
        { label: "Verification", field: "verification", sortable: false },
        { label: "Joined", field: "created_at", sortable: true },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer
    const renderRow = (user, index) => {
        const RoleIcon = roleIcons[user.role] || User;

        return (
            <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors duration-150"
            >
                {/* Number */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                        {index}
                    </div>
                </td>

                {/* User Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                ID: {user.id}
                            </div>
                            {user.profile_data && (
                                <div className="text-xs text-gray-400">
                                    {user.profile_data.name ||
                                        user.profile_data.position ||
                                        user.profile_data.specialization}
                                </div>
                            )}
                        </div>
                    </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4">
                    <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                            {user.email}
                        </div>
                    </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                            roleColors[user.role] ||
                            "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                    >
                        <RoleIcon className="h-4 w-4 mr-1" />
                        {roleLabels[user.role] ||
                            user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                    </span>
                </td>

                {/* Profile Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                    {user.has_complete_profile ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                        </span>
                    ) : user.role === "admin" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            <Crown className="h-4 w-4 mr-1" />
                            Admin
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Incomplete
                        </span>
                    )}
                </td>

                {/* Email Verification */}
                <td className="px-6 py-4 whitespace-nowrap">
                    {user.email_verified_at ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-800 border border-red-200">
                            <XCircle className="h-4 w-4 mr-1" />
                            Unverified
                        </span>
                    )}
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                            <div className="text-sm text-gray-900">
                                {formatDate(user.created_at)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {formatTime(user.created_at)}
                            </div>
                        </div>
                    </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                        <a
                            href={route("users.show", user.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Eye size={14} className="mr-1" />
                            View
                        </a>
                        <button
                            onClick={() =>
                                window.openChangePasswordModal?.(
                                    user.id,
                                    user.name
                                )
                            }
                            className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Settings className="h-4 w-4 mr-1" />
                            Password
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <UnifiedIndexTemplate
            title="User Management"
            createRoute={route("employee.create")}
            createLabel="Add New User"
            createIcon={UserPlus}
            data={users}
            filters={filterComponents}
            filterTitle="Filter Users"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={Users}
            emptyStateTitle="No Users Found"
            emptyStateDescription="No users match your current filter criteria. Try adjusting your search terms or reset the filters."
            onSearch={handleSearch}
            onReset={handleReset}
            onSort={handleSort}
            sortField={sorting?.field}
            sortDirection={sorting?.direction}
            isSearching={isSearching}
            statistics={null}
            statisticsPosition="top"
            customStatisticsComponent={
                <UserStatistics statistics={statistics} />
            }
        >
            {/* Children kosong karena UserStatistics sudah dipindah ke customStatisticsComponent */}
        </UnifiedIndexTemplate>
    );
}
