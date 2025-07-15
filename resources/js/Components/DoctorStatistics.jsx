// File: resources/js/Components/DoctorStatistics.jsx
import React from "react";
import {
    Users,
    UserCheck,
    UserX,
    Stethoscope,
    Award,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Calendar,
    TrendingUp,
    Clock,
    Activity,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, subtext, trend }) => {
    const getColorClasses = (color) => {
        const colors = {
            blue: "bg-blue-50 border-blue-200 text-blue-700",
            green: "bg-green-50 border-green-200 text-green-700",
            yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
            red: "bg-red-50 border-red-200 text-red-700",
            purple: "bg-purple-50 border-purple-200 text-purple-700",
            orange: "bg-orange-50 border-orange-200 text-orange-700",
        };
        return colors[color] || colors.blue;
    };

    const getIconColorClasses = (color) => {
        const colors = {
            blue: "text-blue-600 bg-blue-100",
            green: "text-green-600 bg-green-100",
            yellow: "text-yellow-600 bg-yellow-100",
            red: "text-red-600 bg-red-100",
            purple: "text-purple-600 bg-purple-100",
            orange: "text-orange-600 bg-orange-100",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div
            className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${getColorClasses(
                color
            )}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-75">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    {subtext && (
                        <p className="text-sm opacity-60 mt-2">{subtext}</p>
                    )}
                    {trend && (
                        <div className="flex items-center mt-2">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${getIconColorClasses(color)}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

const SpecializationChart = ({ specializations }) => {
    if (!specializations || Object.keys(specializations).length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Specializations Distribution
                </h3>
                <p className="text-gray-500 text-center py-8">
                    No specialization data available
                </p>
            </div>
        );
    }

    const total = Object.values(specializations).reduce(
        (sum, count) => sum + count,
        0
    );
    const colors = [
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-yellow-500",
        "bg-red-500",
        "bg-indigo-500",
        "bg-pink-500",
        "bg-orange-500",
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-purple-600" />
                Specializations Distribution
            </h3>
            <div className="space-y-3">
                {Object.entries(specializations).map(
                    ([specialization, count], index) => {
                        const percentage =
                            total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return (
                            <div
                                key={specialization}
                                className="flex items-center"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 truncate">
                                            {specialization}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                colors[index % colors.length]
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
};

const LicenseStatusOverview = ({ licenseStatus }) => {
    if (!licenseStatus) return null;

    const { active = 0, expired = 0, expiring_soon = 0 } = licenseStatus;
    const total = active + expired + expiring_soon;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                License Status Overview
            </h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {active}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                    <div className="text-xs text-gray-500">
                        {total > 0 ? ((active / total) * 100).toFixed(1) : 0}%
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {expiring_soon}
                    </div>
                    <div className="text-sm text-gray-600">Expiring Soon</div>
                    <div className="text-xs text-gray-500">
                        {total > 0
                            ? ((expiring_soon / total) * 100).toFixed(1)
                            : 0}
                        %
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {expired}
                    </div>
                    <div className="text-sm text-gray-600">Expired</div>
                    <div className="text-xs text-gray-500">
                        {total > 0 ? ((expired / total) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>
            {expiring_soon > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="text-sm text-orange-800">
                            {expiring_soon} license(s) expiring within 30 days
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const DoctorStatistics = ({ statistics }) => {
    if (!statistics) {
        return (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-gray-500 text-center">
                    No statistics data available
                </p>
            </div>
        );
    }

    const mainStats = [
        {
            title: "Total Doctors",
            value: statistics.total || 0,
            icon: Stethoscope,
            color: "blue",
            subtext: `${statistics.today?.total || 0} registered today`,
        },
        {
            title: "With User Account",
            value: statistics.with_users || 0,
            icon: UserCheck,
            color: "green",
            subtext: `${statistics.user_account_rate || 0}% have accounts`,
        },
        {
            title: "Active Licenses",
            value: statistics.license_status?.active || 0,
            icon: CheckCircle,
            color: "green",
            subtext: "Valid licenses",
        },
        {
            title: "Licenses Expiring",
            value: statistics.license_status?.expiring_soon || 0,
            icon: AlertTriangle,
            color: "orange",
            subtext: "Within 30 days",
        },
    ];

    const timeBasedStats = [
        {
            title: "This Week",
            value: statistics.this_week?.total || 0,
            icon: Calendar,
            color: "purple",
            subtext: `${statistics.this_week?.with_users || 0} with accounts`,
        },
        {
            title: "This Month",
            value: statistics.this_month?.total || 0,
            icon: Calendar,
            color: "blue",
            subtext: `${statistics.this_month?.with_users || 0} with accounts`,
        },
        {
            title: "Average/Day",
            value: statistics.avg_new_per_day || 0,
            icon: TrendingUp,
            color: "green",
            subtext: "Last 30 days",
        },
        {
            title: "Recent Activity",
            value: statistics.recent_registrations || 0,
            icon: Activity,
            color: "yellow",
            subtext: "Last 7 days",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Statistics */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Stethoscope className="h-6 w-6 mr-2 text-blue-600" />
                    Doctor Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mainStats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            {/* Time-based Statistics */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    Registration Trends
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {timeBasedStats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpecializationChart
                    specializations={statistics.specializations}
                />
                <LicenseStatusOverview
                    licenseStatus={statistics.license_status}
                />
            </div>

            {/* Alerts Section */}
            {(statistics.license_status?.expired > 0 ||
                statistics.licenses_expiring_30_days > 0) && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                        License Alerts
                    </h3>
                    <div className="space-y-3">
                        {statistics.license_status?.expired > 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                                    <span className="text-sm text-red-800">
                                        <strong>
                                            {statistics.license_status.expired}
                                        </strong>{" "}
                                        doctor(s) have expired licenses
                                    </span>
                                </div>
                            </div>
                        )}
                        {statistics.licenses_expiring_30_days > 0 && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                                    <span className="text-sm text-orange-800">
                                        <strong>
                                            {
                                                statistics.licenses_expiring_30_days
                                            }
                                        </strong>{" "}
                                        license(s) expiring in the next 30 days
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorStatistics;
