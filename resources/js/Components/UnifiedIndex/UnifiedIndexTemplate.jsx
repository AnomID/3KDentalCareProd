// Enhanced Universal Professional Index Template
// File: resources/js/Components/UnifiedIndex/UnifiedIndexTemplate.jsx

import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    Filter,
    Search,
    CheckCircle,
    AlertCircle,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    TrendingUp,
    Users,
    Calendar,
    Clock,
    Activity,
    BarChart3,
} from "lucide-react";

// Enhanced Statistics Cards Component
const StatisticsCards = ({ statistics }) => {
    if (!statistics) return null;

    const statCards = [
        {
            title: "Total Appointments",
            value: statistics.total || 0,
            icon: Calendar,
            color: "blue",
            subtext: `${statistics.today?.total || 0} today`,
        },
        {
            title: "Completed",
            value: statistics.completed || 0,
            icon: CheckCircle,
            color: "green",
            subtext: `${statistics.today?.completed || 0} today`,
        },
        {
            title: "Scheduled",
            value: statistics.scheduled || 0,
            icon: Clock,
            color: "yellow",
            subtext: `${statistics.today?.scheduled || 0} today`,
        },
        {
            title: "Completion Rate",
            value: `${statistics.completion_rate || 0}%`,
            icon: TrendingUp,
            color: "purple",
            subtext: `Avg ${statistics.avg_per_day || 0}/day`,
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: "bg-blue-50 border-blue-200 text-blue-700",
            green: "bg-green-50 border-green-200 text-green-700",
            yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
            purple: "bg-purple-50 border-purple-200 text-purple-700",
        };
        return colors[color] || colors.blue;
    };

    const getIconColorClasses = (color) => {
        const colors = {
            blue: "text-blue-600 bg-blue-100",
            green: "text-green-600 bg-green-100",
            yellow: "text-yellow-600 bg-yellow-100",
            purple: "text-purple-600 bg-purple-100",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statCards.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <div
                        key={index}
                        className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${getColorClasses(
                            stat.color
                        )}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-75">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold mt-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm opacity-60 mt-2">
                                    {stat.subtext}
                                </p>
                            </div>
                            <div
                                className={`p-3 rounded-lg ${getIconColorClasses(
                                    stat.color
                                )}`}
                            >
                                <IconComponent size={24} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Enhanced Professional Pagination Component
const ProfessionalPagination = ({
    links,
    from,
    to,
    total,
    currentPage,
    lastPage,
    perPage = 10,
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7;
        const half = Math.floor(maxVisible / 2);

        let start = Math.max(1, currentPage - half);
        let end = Math.min(lastPage, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push("...");
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < lastPage) {
            if (end < lastPage - 1) {
                pages.push("...");
            }
            pages.push(lastPage);
        }

        return pages;
    };

    if (!links || lastPage <= 1) return null;

    const pages = getPageNumbers();
    const prevUrl = links.find((link) => link.label.includes("Previous"))?.url;
    const nextUrl = links.find((link) => link.label.includes("Next"))?.url;

    return (
        <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                    <span className="text-sm text-gray-700">
                        {from || 0} - {to || 0} of {total}
                    </span>
                </div>

                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-semibold text-gray-900">
                                {from || 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-gray-900">
                                {to || 0}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900">
                                {total}
                            </span>{" "}
                            results
                        </p>
                    </div>

                    <div className="flex items-center space-x-1">
                        <Link
                            href={links[1]?.url || "#"}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                                currentPage === 1
                                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft size={16} />
                        </Link>

                        <Link
                            href={prevUrl || "#"}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                                !prevUrl
                                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                            disabled={!prevUrl}
                        >
                            <ChevronLeft size={16} />
                        </Link>

                        <div className="flex items-center space-x-1">
                            {pages.map((page, index) => {
                                if (page === "...") {
                                    return (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="px-3 py-2 text-gray-500"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const pageUrl = links.find(
                                    (link) => link.label === page.toString()
                                )?.url;

                                return (
                                    <Link
                                        key={page}
                                        href={pageUrl || "#"}
                                        className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border transition-all duration-200 font-medium ${
                                            currentPage === page
                                                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                );
                            })}
                        </div>

                        <Link
                            href={nextUrl || "#"}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                                !nextUrl
                                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                            disabled={!nextUrl}
                        >
                            <ChevronRight size={16} />
                        </Link>

                        <Link
                            href={links[links.length - 2]?.url || "#"}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                                currentPage === lastPage
                                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                            disabled={currentPage === lastPage}
                        >
                            <ChevronsRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Flash Messages Component
const FlashMessages = ({ flash }) => {
    if (!flash) return null;

    return (
        <>
            {flash.success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                {flash.success}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {flash.error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">
                                {flash.error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Professional Filter Section Component
const FilterSection = ({
    title,
    filters,
    onSearch,
    onReset,
    isSearching = false,
}) => {
    return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center mb-4">
                <Filter className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filters}

                <div className="flex items-end gap-2">
                    <button
                        onClick={onSearch}
                        disabled={isSearching}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        {isSearching ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Searching...
                            </div>
                        ) : (
                            <>
                                <Search size={18} className="mr-2" />
                                Search
                            </>
                        )}
                    </button>
                    <button
                        onClick={onReset}
                        className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

// Professional Data Table Component
const DataTable = ({
    headers,
    data,
    emptyState,
    onSort,
    sortField,
    sortDirection,
}) => {
    const getSortIcon = (field) => {
        if (sortField !== field) {
            return (
                <svg
                    className="w-4 h-4 ml-1 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                </svg>
            );
        }
        return sortDirection === "asc" ? (
            <svg
                className="w-4 h-4 ml-1 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                />
            </svg>
        ) : (
            <svg
                className="w-4 h-4 ml-1 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                    Data List
                </h3>
                {data.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                        Total: {data.length} items
                    </p>
                )}
            </div>

            {data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {headers.map((header, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                                            header.sortable
                                                ? "cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            header.sortable &&
                                            onSort &&
                                            onSort(header.field)
                                        }
                                    >
                                        <div className="flex items-center">
                                            {header.label}
                                            {header.sortable &&
                                                getSortIcon(header.field)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-12 text-center">{emptyState}</div>
            )}
        </div>
    );
};

// Main Professional Index Template
const UnifiedIndexTemplate = ({
    title,
    createRoute,
    createLabel = "Add New",
    createIcon: CreateIcon = Plus,
    data,
    filters,
    filterTitle,
    headers,
    renderRow,
    emptyStateIcon: EmptyIcon,
    emptyStateTitle,
    emptyStateDescription,
    onSearch,
    onReset,
    onSort,
    sortField,
    sortDirection,
    isSearching = false,
    statistics,
    statisticsPosition = "default", // NEW: Position control for statistics
    customStatisticsComponent, // NEW: Custom statistics component
    children,
}) => {
    const { flash = {} } = usePage().props;

    // Enhanced Empty State
    const emptyState = (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                {EmptyIcon && <EmptyIcon className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {emptyStateTitle}
            </h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
                {emptyStateDescription}
            </p>
            <button
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
                Reset Filters
            </button>
        </div>
    );

    // Generate table rows with proper numbering
    const tableRows = data?.data
        ? data.data.map((item, index) => {
              const globalIndex =
                  ((data.current_page || 1) - 1) * (data.per_page || 10) +
                  index +
                  1;
              return renderRow(item, globalIndex);
          })
        : [];

    return (
        <AuthorizeLayout>
            <Head title={title} />

            <div className="bg-white shadow-lg rounded-xl p-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage and organize your data efficiently
                        </p>
                    </div>

                    {createRoute && (
                        <Link
                            href={createRoute}
                            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <CreateIcon size={18} className="mr-2" />
                            {createLabel}
                        </Link>
                    )}
                </div>

                {/* Flash Messages */}
                <FlashMessages flash={flash} />

                {/* Custom Statistics Component - positioned at TOP */}
                {statisticsPosition === "top" && customStatisticsComponent && (
                    <div className="mb-6">{customStatisticsComponent}</div>
                )}

                {/* Default Statistics Cards - positioned AFTER header and flash messages */}
                {statisticsPosition === "default" && (
                    <StatisticsCards statistics={statistics} />
                )}

                {/* Filter Section */}
                <FilterSection
                    title={filterTitle}
                    filters={filters}
                    onSearch={onSearch}
                    onReset={onReset}
                    isSearching={isSearching}
                />

                {/* Data Table */}
                <DataTable
                    headers={headers}
                    data={tableRows}
                    emptyState={emptyState}
                    onSort={onSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                />

                {/* Pagination */}
                {data?.data?.length > 0 && (
                    <ProfessionalPagination
                        links={data.links}
                        from={data.from}
                        to={data.to}
                        total={data.total}
                        currentPage={data.current_page}
                        lastPage={data.last_page}
                        perPage={data.per_page}
                    />
                )}

                {/* Custom Statistics Component - positioned at BOTTOM */}
                {statisticsPosition === "bottom" &&
                    customStatisticsComponent && (
                        <div className="mt-6">{customStatisticsComponent}</div>
                    )}

                {/* Additional Content - kept at bottom for backward compatibility */}
                {children}
            </div>
        </AuthorizeLayout>
    );
};

export default UnifiedIndexTemplate;
