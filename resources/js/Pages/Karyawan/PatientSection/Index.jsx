// Enhanced Patient Index Page for Employee
// File: resources/js/Pages/Karyawan/PatientSection/Index.jsx
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import UnifiedIndexTemplate from "@/Components/UnifiedIndex/UnifiedIndexTemplate";
import PatientStatistics from "@/Components/PatientStatistics";
import {
    User,
    UserPlus,
    Phone,
    MapPin,
    Calendar,
    Heart,
    Shield,
    FileText,
    Baby,
    Users,
    UserCheck,
    Activity,
    TrendingUp,
    Search,
    Eye,
    Edit,
    Stethoscope,
    Clock,
    AlertCircle,
    CheckCircle,
    UserX,
    Mail,
} from "lucide-react";

export default function Index({
    patients,
    statistics,
    filterOptions,
    filters,
    sorting,
    error,
    debug,
}) {
    console.log("Index component received:", {
        patients: patients?.data?.length,
        statistics,
        filterOptions,
        filters,
        sorting,
        error,
        debug,
    }); // Debug log
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || "",
        filter_gender: filters?.filter_gender || "all",
        filter_age: filters?.filter_age || "all",
        filter_blood_type: filters?.filter_blood_type || "all",
        filter_guardian: filters?.filter_guardian || "all",
        filter_rm: filters?.filter_rm || "all",
        filter_appointment: filters?.filter_appointment || "all",
        period: filters?.period || "",
        per_page: filters?.per_page || 15,
    });

    const [isSearching, setIsSearching] = useState(false);

    // Update search params when filters prop changes
    useEffect(() => {
        if (filters) {
            setSearchParams({
                search: filters.search || "",
                filter_gender: filters.filter_gender || "all",
                filter_age: filters.filter_age || "all",
                filter_blood_type: filters.filter_blood_type || "all",
                filter_guardian: filters.filter_guardian || "all",
                filter_rm: filters.filter_rm || "all",
                filter_appointment: filters.filter_appointment || "all",
                period: filters.period || "",
                per_page: filters.per_page || 15,
            });
        }
    }, [filters]);

    // Handle search functionality
    const handleSearch = () => {
        setIsSearching(true);
        router.get(route("patients.index"), searchParams, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsSearching(false),
            onError: () => setIsSearching(false),
        });
    };

    // Handle reset filters
    const handleReset = () => {
        const resetParams = {
            search: "",
            filter_gender: "all",
            filter_age: "all",
            filter_blood_type: "all",
            filter_guardian: "all",
            filter_rm: "all",
            filter_appointment: "all",
            period: "",
            per_page: 15,
        };
        setSearchParams(resetParams);
        setIsSearching(true);
        router.get(route("patients.index"), resetParams, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsSearching(false),
            onError: () => setIsSearching(false),
        });
    };

    // Handle sorting
    const handleSort = (field) => {
        const newDirection =
            sorting?.field === field && sorting?.direction === "asc"
                ? "desc"
                : "asc";

        router.get(
            route("patients.index"),
            {
                ...searchParams,
                sort: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Calculate age helper function
    const calculateAge = (birthDate) => {
        if (!birthDate) return "N/A";
        try {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birth.getDate())
            ) {
                age--;
            }
            return age >= 0 ? age : "N/A";
        } catch {
            return "N/A";
        }
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "-";
        }
    };

    // Format time helper
    const formatTime = (dateString) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "-";
        }
    };

    // Safe filter options rendering
    const safeFilterOptions = filterOptions || {
        genders: [],
        age_groups: [],
        blood_types: [],
        guardians: [],
        rm_status: [],
        appointments: [],
        periods: [],
        per_page_options: [10, 15, 25, 50, 100],
    };

    // Filter Components
    const filterComponents = [
        // Search Filter
        <div key="search">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patients
            </label>
            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                />
                <input
                    type="text"
                    placeholder="Search by name, phone, RM number, address, email..."
                    value={searchParams.search}
                    onChange={(e) =>
                        setSearchParams({
                            ...searchParams,
                            search: e.target.value,
                        })
                    }
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
            </div>
        </div>,

        // Gender Filter
        <div key="gender">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
            </label>
            <select
                value={searchParams.filter_gender}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_gender: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {safeFilterOptions.genders.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                        {gender.label}
                    </option>
                ))}
            </select>
        </div>,

        // Age Group Filter
        <div key="age">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group
            </label>
            <select
                value={searchParams.filter_age}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_age: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {safeFilterOptions.age_groups.map((age) => (
                    <option key={age.value} value={age.value}>
                        {age.label}
                    </option>
                ))}
            </select>
        </div>,

        // Blood Type Filter
        <div key="blood_type">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
            </label>
            <select
                value={searchParams.filter_blood_type}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_blood_type: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {safeFilterOptions.blood_types.map((bloodType) => (
                    <option key={bloodType.value} value={bloodType.value}>
                        {bloodType.label}
                    </option>
                ))}
            </select>
        </div>,

        // Guardian Filter
        <div key="guardian">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Guardian Status
            </label>
            <select
                value={searchParams.filter_guardian}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_guardian: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {safeFilterOptions.guardians.map((guardian) => (
                    <option key={guardian.value} value={guardian.value}>
                        {guardian.label}
                    </option>
                ))}
            </select>
        </div>,

        // RM Number Filter
        <div key="rm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                RM Number Status
            </label>
            <select
                value={searchParams.filter_rm}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_rm: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {safeFilterOptions.rm_status.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
        </div>,

        // Appointment Filter
        <div key="appointment">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Status
            </label>
            <select
                value={searchParams.filter_appointment}
                onChange={(e) =>
                    setSearchParams({
                        ...searchParams,
                        filter_appointment: e.target.value,
                    })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
                {safeFilterOptions.appointments.map((appointment) => (
                    <option key={appointment.value} value={appointment.value}>
                        {appointment.label}
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
                {safeFilterOptions.periods.map((period) => (
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
                {safeFilterOptions.per_page_options.map((option) => (
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
        { label: "RM Number", field: "no_rm", sortable: true },
        { label: "Patient", field: "name", sortable: true },
        { label: "Gender & Age", field: "gender", sortable: false },
        { label: "Contact", field: "contact", sortable: false },
        { label: "Guardian", field: "guardian", sortable: false },
        { label: "Blood Type", field: "blood_type", sortable: true },
        { label: "Appointments", field: "appointments", sortable: false },
        { label: "Registration", field: "created_at", sortable: true },
        { label: "Actions", field: "actions", sortable: false },
    ];

    // Row Renderer with improved error handling
    const renderRow = (patient, index) => {
        if (!patient) return null;

        return (
            <tr
                key={patient.id}
                className="hover:bg-gray-50 transition-colors duration-150"
            >
                {/* Number */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                        {index}
                    </div>
                </td>

                {/* RM Number */}
                <td className="px-6 py-4 whitespace-nowrap">
                    {patient.no_rm ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
                            <FileText className="h-4 w-4 mr-1" />
                            {patient.no_rm}
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            No RM
                        </span>
                    )}
                </td>

                {/* Patient Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {patient.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                                ID: {patient.id}
                            </div>
                            {patient.user?.email && (
                                <div className="flex items-center text-xs text-gray-400">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {patient.user.email}
                                </div>
                            )}
                        </div>
                    </div>
                </td>

                {/* Gender & Age */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            {patient.gender === "Male" ? (
                                <div className="flex items-center text-blue-600">
                                    <svg
                                        className="h-4 w-4 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    </svg>
                                    Male
                                </div>
                            ) : patient.gender === "Female" ? (
                                <div className="flex items-center text-pink-600">
                                    <svg
                                        className="h-4 w-4 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                                    </svg>
                                    Female
                                </div>
                            ) : (
                                <div className="flex items-center text-gray-500">
                                    <UserX className="h-4 w-4 mr-1" />
                                    Not Set
                                </div>
                            )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {patient.age !== null && patient.age !== undefined
                                ? `${patient.age} years old`
                                : calculateAge(patient.birth_date) !== "N/A"
                                ? `${calculateAge(
                                      patient.birth_date
                                  )} years old`
                                : "Age unknown"}
                        </div>
                    </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4">
                    <div className="space-y-2">
                        {patient.phone ? (
                            <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-gray-900">
                                    {patient.phone}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center text-sm text-gray-400">
                                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>No phone</span>
                            </div>
                        )}
                        {patient.address ? (
                            <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span
                                    className="text-gray-600 truncate max-w-xs"
                                    title={patient.address}
                                >
                                    {patient.address}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center text-sm text-gray-400">
                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>No address</span>
                            </div>
                        )}
                    </div>
                </td>

                {/* Guardian */}
                <td className="px-6 py-4 whitespace-nowrap">
                    {patient.guardian_id ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                            <Shield className="h-4 w-4 mr-1" />
                            Has Guardian
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
                            <UserX className="h-4 w-4 mr-1" />
                            No Guardian
                        </span>
                    )}
                </td>

                {/* Blood Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                    {patient.blood_type ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                            <Heart className="h-4 w-4 mr-1" />
                            {patient.blood_type}
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-500 border border-gray-200">
                            <Heart className="h-4 w-4 mr-1" />
                            Not Set
                        </span>
                    )}
                </td>

                {/* Appointments */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <Stethoscope className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="font-medium text-gray-900">
                                {patient.appointment_stats?.total || 0} total
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center">
                                <Activity className="h-3 w-3 mr-1" />
                                {patient.appointment_stats?.active || 0} active
                            </span>
                            <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {patient.appointment_stats?.completed || 0} done
                            </span>
                        </div>
                        {(patient.appointment_stats?.total_doctors || 0) >
                            0 && (
                            <div className="flex items-center text-xs text-gray-500">
                                <Users className="h-3 w-3 mr-1" />
                                {patient.appointment_stats.total_doctors}{" "}
                                doctor(s)
                            </div>
                        )}
                        {patient.latest_appointment && (
                            <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Last:{" "}
                                {formatDate(
                                    patient.latest_appointment.appointment_date
                                )}
                            </div>
                        )}
                    </div>
                </td>

                {/* Registration Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                        {formatDate(patient.created_at)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {formatTime(patient.created_at)}
                    </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                        <a
                            href={route("patients.show", patient.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Eye size={14} className="mr-1" />
                            View
                        </a>
                        <a
                            href={route("patients.edit", patient.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Edit size={14} className="mr-1" />
                            Edit
                        </a>
                    </div>
                </td>
            </tr>
        );
    };

    // Handle case when there's an error
    if (error) {
        return (
            <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error Loading Patients
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <UnifiedIndexTemplate
            title="Patient Management"
            createRoute={null}
            data={patients}
            filters={filterComponents}
            filterTitle="Filter Patients"
            headers={headers}
            renderRow={renderRow}
            emptyStateIcon={User}
            emptyStateTitle="No Patients Found"
            emptyStateDescription="No patients match your current filter criteria. Try adjusting your filters or search terms."
            onSearch={handleSearch}
            onReset={handleReset}
            onSort={handleSort}
            sortField={sorting?.field}
            sortDirection={sorting?.direction}
            isSearching={isSearching}
            statistics={null}
            statisticsPosition="top"
            customStatisticsComponent={
                <PatientStatistics statistics={statistics} />
            }
        />
    );
}
