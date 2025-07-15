// File: resources/js/Pages/Karyawan/GuardianSection/Index.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import {
    Shield,
    UserPlus,
    Phone,
    MapPin,
    FileText,
    Users,
    Hash,
    User,
} from "lucide-react";

export default function Index({ guardians, filters }) {
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        filter_patient: filters?.filter_patient || "all",
        sort_field: filters?.sort_field || "id",
        sort_direction: filters?.sort_direction || "asc",
    });

    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = () => {
        setIsSearching(true);
        router.get(route("guardians.index"), searchParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleReset = () => {
        const resetParams = {
            search: "",
            filter_patient: "all",
            sort_field: "id",
            sort_direction: "asc",
        };
        setSearchParams(resetParams);
        setIsSearching(true);
        router.get(route("guardians.index"), resetParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    };

    const handleSort = (field) => {
        const newDirection =
            field === searchParams.sort_field &&
            searchParams.sort_direction === "asc"
                ? "desc"
                : "asc";

        const sortParams = {
            ...searchParams,
            sort_field: field,
            sort_direction: newDirection,
        };

        setSearchParams(sortParams);
        setIsSearching(true);
        router.get(route("guardians.index"), sortParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
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
                placeholder="Search by name, phone, or identity number..."
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

        // Patient Filter
        <div key="patient">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Status
            </label>
            <select
                value={searchParams.filter_patient}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_patient: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                <option value="all">All Guardians</option>
                <option value="yes">With Patients</option>
                <option value="no">Without Patients</option>
            </select>
        </div>,
    ];

    // Table Headers
    const headers = [
        { label: "No.", field: "number", sortable: false },
        { label: "Guardian", field: "name", sortable: true },
        { label: "Identity", field: "identity", sortable: false },
        { label: "Contact", field: "contact", sortable: false },
        { label: "Relationship", field: "relationship", sortable: false },
        { label: "Patients", field: "patients", sortable: false },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer
    const renderRow = (guardian, index) => (
        <tr
            key={guardian.id}
            className="hover:bg-gray-50 transition-colors duration-150"
        >
            {/* Number */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{index}</div>
            </td>

            {/* Guardian Info */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {guardian.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            ID: {guardian.id}
                        </div>
                    </div>
                </div>
            </td>

            {/* Identity */}
            <td className="px-6 py-4 whitespace-nowrap">
                {guardian.identity_type && guardian.identity_number ? (
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="font-medium text-gray-900">
                                {guardian.identity_type}
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Hash className="h-4 w-4 mr-2" />
                            {guardian.identity_number}
                        </div>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500 italic">
                        No identity data
                    </span>
                )}
            </td>

            {/* Contact */}
            <td className="px-6 py-4">
                <div className="space-y-2">
                    {guardian.phone_number && (
                        <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-900">
                                {guardian.phone_number}
                            </span>
                        </div>
                    )}
                    {guardian.address && (
                        <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-600 truncate max-w-xs">
                                {guardian.address}
                            </span>
                        </div>
                    )}
                    {!guardian.phone_number && !guardian.address && (
                        <span className="text-sm text-gray-500 italic">
                            No contact data
                        </span>
                    )}
                </div>
            </td>

            {/* Relationship */}
            <td className="px-6 py-4 whitespace-nowrap">
                {guardian.relationship ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-800 border border-purple-200">
                        <User className="h-4 w-4 mr-1" />
                        {guardian.relationship}
                    </span>
                ) : (
                    <span className="text-sm text-gray-500 italic">
                        Not specified
                    </span>
                )}
            </td>

            {/* Patient Count */}
            <td className="px-6 py-4 whitespace-nowrap">
                {guardian.patient_count > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                        <Users className="h-4 w-4 mr-1" />
                        {guardian.patient_count} Patient
                        {guardian.patient_count > 1 ? "s" : ""}
                    </span>
                ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
                        <Users className="h-4 w-4 mr-1" />
                        No Patients
                    </span>
                )}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <a
                        href={route("guardians.show", guardian.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        View
                    </a>
                    <a
                        href={route("guardians.edit", guardian.id)}
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
            title="Guardian Management"
            createRoute={route("guardians.create")}
            createLabel="Add New Guardian"
            createIcon={UserPlus}
            data={guardians}
            filters={filterComponents}
            filterTitle="Filter Guardians"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={Shield}
            emptyStateTitle="No Guardians Found"
            emptyStateDescription="No guardians match your current filter criteria. Try adjusting your search terms or reset the filters."
            onSearch={handleSearch}
            onReset={handleReset}
            onSort={handleSort}
            sortField={searchParams.sort_field}
            sortDirection={searchParams.sort_direction}
            isSearching={isSearching}
        />
    );
}
