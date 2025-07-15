// File: resources/js/Pages/Karyawan/DoctorSection/Index.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import DoctorStatistics from "@/Components/DoctorStatistics";
import {
    UserPlus,
    Stethoscope,
    Mail,
    Phone,
    FileText,
    Calendar,
    Award,
    Search,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Hash,
} from "lucide-react";

export default function Index({
    doctors,
    statistics,
    filterOptions,
    filters,
    sorting,
}) {
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        filter_specialization: filters?.filter_specialization || "all",
        filter_license_status: filters?.filter_license_status || "all",
        period: filters?.period || "",
        per_page: filters?.per_page || 10,
    });

    const [isSearching, setIsSearching] = useState(false);

    // Handle search functionality
    const handleSearch = () => {
        setIsSearching(true);
        router.get(route("doctors.index"), searchParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    // Handle reset filters
    const handleReset = () => {
        const resetParams = {
            search: "",
            filter_specialization: "all",
            filter_license_status: "all",
            period: "",
            per_page: 10,
        };
        setSearchParams(resetParams);
        setIsSearching(true);
        router.get(route("doctors.index"), resetParams, {
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
            route("doctors.index"),
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
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const formattedDate = date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        if (diffDays < 0) {
            return (
                <span className="text-red-600 font-medium text-sm">
                    {formattedDate} (Expired)
                </span>
            );
        } else if (diffDays <= 30) {
            return (
                <span className="text-orange-600 font-medium text-sm">
                    {formattedDate} (Expiring Soon)
                </span>
            );
        }

        return <span className="text-green-600 text-sm">{formattedDate}</span>;
    };

    const getLicenseStatusBadge = (licenseStatus) => {
        switch (licenseStatus) {
            case "active":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                    </span>
                );
            case "expired":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-800 border border-red-200">
                        <XCircle className="h-4 w-4 mr-1" />
                        Expired
                    </span>
                );
            case "expiring_soon":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-800 border border-orange-200">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Expiring Soon
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-800 border border-gray-200">
                        Unknown
                    </span>
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
                    placeholder="Search by name, code, or license number..."
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

        // Specialization Filter
        <div key="specialization">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
            </label>
            <select
                value={searchParams.filter_specialization}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_specialization: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.specializations?.map((specialization) => (
                    <option
                        key={specialization.value}
                        value={specialization.value}
                    >
                        {specialization.label}
                    </option>
                ))}
            </select>
        </div>,

        // License Status Filter
        <div key="license_status">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                License Status
            </label>
            <select
                value={searchParams.filter_license_status}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_license_status: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {filterOptions?.license_status?.map((status) => (
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
        { label: "Doctor", field: "name", sortable: true },
        { label: "Specialization", field: "specialization", sortable: true },
        { label: "License Info", field: "license", sortable: false },
        { label: "License Status", field: "license_status", sortable: false },
        { label: "Contact", field: "contact", sortable: false },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer
    const renderRow = (doctor, index) => (
        <tr
            key={doctor.id}
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
                    {doctor.code}
                </span>
            </td>

            {/* Doctor Info */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            dr. {doctor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            ID: {doctor.id}
                        </div>
                        {doctor.appointment_count > 0 && (
                            <div className="text-xs text-blue-600">
                                {doctor.appointment_count} appointments
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* Specialization */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-800 border border-purple-200">
                    <Award className="h-4 w-4 mr-1" />
                    {doctor.specialization}
                </span>
            </td>

            {/* License Info */}
            <td className="px-6 py-4">
                <div className="space-y-2">
                    <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate max-w-xs">
                            {doctor.license_number || "No data"}
                        </span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        {formatDate(doctor.license_expiry_date)}
                    </div>
                </div>
            </td>

            {/* License Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                {getLicenseStatusBadge(doctor.license_status)}
            </td>

            {/* Contact */}
            <td className="px-6 py-4">
                <div className="space-y-2">
                    {doctor.phone && (
                        <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-900">
                                {doctor.phone}
                            </span>
                        </div>
                    )}
                    {doctor.email && (
                        <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-900 truncate max-w-xs">
                                {doctor.email}
                            </span>
                        </div>
                    )}
                    {!doctor.phone && !doctor.email && (
                        <span className="text-sm text-gray-500 italic">
                            No contact data
                        </span>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <a
                        href={route("doctors.show", doctor.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <Eye size={14} className="mr-1" />
                        View
                    </a>
                    <a
                        href={route("doctors.edit", doctor.id)}
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
            title="Doctor Management"
            createRoute={route("employee.create")}
            createLabel="Add New Doctor"
            createIcon={UserPlus}
            data={doctors}
            filters={filterComponents}
            filterTitle="Filter Doctors"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={Stethoscope}
            emptyStateTitle="No Doctors Found"
            emptyStateDescription="No doctors match your current filter criteria. Try adjusting your search terms or reset the filters."
            onSearch={handleSearch}
            onReset={handleReset}
            onSort={handleSort}
            sortField={sorting?.field}
            sortDirection={sorting?.direction}
            isSearching={isSearching}
            statistics={null}
            statisticsPosition="top"
            customStatisticsComponent={
                <DoctorStatistics statistics={statistics} />
            }
        />
    );
}
