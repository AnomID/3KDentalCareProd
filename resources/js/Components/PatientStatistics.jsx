// Enhanced Patient Statistics Component - PostgreSQL Compatible
// File: resources/js/Components/PatientStatistics.jsx

import React from "react";
import {
    Users,
    UserPlus,
    UserCheck,
    Shield,
    Calendar,
    TrendingUp,
    Heart,
    FileText,
    Activity,
    Clock,
    Baby,
    UserX,
    BarChart3,
    Target,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    subtitle = null,
    trend = null,
    percentage = null,
}) => {
    const getColorClasses = () => {
        const colors = {
            blue: "bg-blue-50 border-blue-200 text-blue-700",
            green: "bg-green-50 border-green-200 text-green-700",
            yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
            purple: "bg-purple-50 border-purple-200 text-purple-700",
            red: "bg-red-50 border-red-200 text-red-700",
            gray: "bg-gray-50 border-gray-200 text-gray-700",
            indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
            pink: "bg-pink-50 border-pink-200 text-pink-700",
        };
        return colors[color] || colors.blue;
    };

    const getIconColorClasses = () => {
        const colors = {
            blue: "text-blue-600 bg-blue-100",
            green: "text-green-600 bg-green-100",
            yellow: "text-yellow-600 bg-yellow-100",
            purple: "text-purple-600 bg-purple-100",
            red: "text-red-600 bg-red-100",
            gray: "text-gray-600 bg-gray-100",
            indigo: "text-indigo-600 bg-indigo-100",
            pink: "text-pink-600 bg-pink-100",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div
            className={`p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${getColorClasses()}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium opacity-75 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className="text-2xl font-bold mt-1 mb-1">
                        {value}
                        {percentage && (
                            <span className="text-sm font-normal opacity-75 ml-1">
                                ({percentage}%)
                            </span>
                        )}
                    </p>
                    {subtitle && (
                        <p className="text-xs opacity-60">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="flex items-center mt-1">
                            <TrendingUp size={12} className="mr-1" />
                            <span className="text-xs opacity-75">{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`p-2 rounded-lg ${getIconColorClasses()}`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ children, icon: Icon }) => (
    <div className="flex items-center mb-4">
        {Icon && <Icon className="h-5 w-5 text-gray-600 mr-2" />}
        <h3 className="text-lg font-semibold text-gray-800">{children}</h3>
    </div>
);

const BloodTypeChart = ({ bloodTypes }) => {
    console.log(
        "BloodTypeChart received:",
        bloodTypes,
        "Type:",
        typeof bloodTypes
    );

    // Handle different data types and empty states
    if (!bloodTypes) {
        return (
            <div className="text-center text-gray-500 text-sm py-4">
                <div>No blood type data available</div>
                <div className="text-xs mt-2 text-gray-400">
                    Received: null/undefined
                </div>
            </div>
        );
    }

    // Handle empty array
    if (Array.isArray(bloodTypes) && bloodTypes.length === 0) {
        return (
            <div className="text-center text-gray-500 text-sm py-4">
                <div>No blood type data available</div>
                <div className="text-xs mt-2 text-gray-400">
                    Received: Empty array
                </div>
            </div>
        );
    }

    // Handle empty object
    if (typeof bloodTypes === "object" && !Array.isArray(bloodTypes)) {
        const keys = Object.keys(bloodTypes);
        if (keys.length === 0) {
            return (
                <div className="text-center text-gray-500 text-sm py-4">
                    <div>No blood type data available</div>
                    <div className="text-xs mt-2 text-gray-400">
                        Received: Empty object
                    </div>
                </div>
            );
        }

        // Process object data
        const total = Object.values(bloodTypes).reduce(
            (sum, count) => sum + (count || 0),
            0
        );

        if (total === 0) {
            return (
                <div className="text-center text-gray-500 text-sm py-4">
                    <div>No blood type data available</div>
                    <div className="text-xs mt-2 text-gray-400">
                        Total count: {total}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {Object.entries(bloodTypes)
                    .filter(([type, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([type, count]) => {
                        const percentage =
                            total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                            <div
                                key={type}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <Heart
                                        size={14}
                                        className="text-red-500 mr-2"
                                    />
                                    <span className="text-sm font-medium">
                                        {type}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 w-8">
                                        {count}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    }

    // Fallback for unexpected data types
    return (
        <div className="text-center text-gray-500 text-sm py-4">
            <div>Unexpected blood type data format</div>
            <div className="text-xs mt-2 text-gray-400">
                Type: {typeof bloodTypes}, Array:{" "}
                {Array.isArray(bloodTypes).toString()}
            </div>
        </div>
    );
};

const AgeGroupChart = ({ ageGroups }) => {
    console.log(
        "AgeGroupChart received:",
        ageGroups,
        "Type:",
        typeof ageGroups
    );

    if (!ageGroups || typeof ageGroups !== "object") {
        return (
            <div className="text-center text-gray-500 text-sm py-4">
                <div>No age group data available</div>
                <div className="text-xs mt-2 text-gray-400">
                    Type: {typeof ageGroups}
                </div>
            </div>
        );
    }

    const total = Object.values(ageGroups).reduce(
        (sum, count) => sum + (count || 0),
        0
    );

    if (total === 0) {
        return (
            <div className="text-center text-gray-500 text-sm py-4">
                <div>No age group data available</div>
                <div className="text-xs mt-2 text-gray-400">Total: {total}</div>
            </div>
        );
    }

    const groups = [
        {
            key: "child",
            label: "Children",
            icon: Baby,
            color: "text-blue-500",
            bgColor: "bg-blue-500",
        },
        {
            key: "adult",
            label: "Adults",
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-500",
        },
        {
            key: "senior",
            label: "Seniors",
            icon: UserCheck,
            color: "text-purple-500",
            bgColor: "bg-purple-500",
        },
    ];

    return (
        <div className="space-y-3">
            {groups.map(({ key, label, icon: Icon, color, bgColor }) => {
                const count = ageGroups[key] || 0;
                const percentage =
                    total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                    <div
                        key={key}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            <Icon size={16} className={`${color} mr-2`} />
                            <span className="text-sm font-medium">{label}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-20 bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`${bgColor} h-2.5 rounded-full transition-all duration-300`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-8">
                                {count}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function PatientStatistics({ statistics }) {
    console.log("PatientStatistics received:", statistics);

    // Handle no statistics provided
    if (!statistics) {
        console.log("No statistics provided");
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center text-gray-500">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <div>No statistics data available</div>
                </div>
            </div>
        );
    }

    // Enhanced debugging for PostgreSQL issues
    console.log("Statistics detailed breakdown:", {
        total: statistics.total,
        totalType: typeof statistics.total,
        genders: statistics.genders,
        gendersType: typeof statistics.genders,
        gendersIsArray: Array.isArray(statistics.genders),
        gendersKeys: statistics.genders
            ? Object.keys(statistics.genders)
            : "none",
        bloodTypes: statistics.blood_types,
        bloodTypesType: typeof statistics.blood_types,
        bloodTypesIsArray: Array.isArray(statistics.blood_types),
        bloodTypesKeys: statistics.blood_types
            ? Object.keys(statistics.blood_types)
            : "none",
        ageGroups: statistics.age_groups,
        ageGroupsType: typeof statistics.age_groups,
        hasError: statistics._error,
        errorMessage: statistics._error,
    });

    // Handle backend error
    if (statistics._error) {
        console.error("Backend statistics error:", statistics._error);
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
                <div className="text-center text-red-600">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-medium">Error loading statistics</p>
                    <p className="text-sm mt-1 max-w-md mx-auto">
                        {statistics._error}
                    </p>
                    <div className="mt-4 text-xs bg-red-100 p-3 rounded">
                        <strong>Technical Details:</strong>
                        <br />
                        This appears to be a PostgreSQL compatibility issue.
                        Please check the Laravel logs for more details.
                    </div>
                </div>
            </div>
        );
    }

    // Check if we have meaningful data
    const hasData = statistics.total && statistics.total > 0;

    if (!hasData) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                <div className="text-center text-yellow-700">
                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-medium">No patient data found</p>
                    <p className="text-sm mt-1">
                        {statistics.total === 0
                            ? "There are currently no patients in the database."
                            : "Statistics could not be calculated properly."}
                    </p>
                    <details className="mt-4 text-xs">
                        <summary className="cursor-pointer font-medium">
                            Debug Information
                        </summary>
                        <div className="mt-2 p-3 bg-yellow-100 rounded text-left">
                            <div>
                                <strong>Total:</strong> {statistics.total}
                            </div>
                            <div>
                                <strong>With Guardians:</strong>{" "}
                                {statistics.with_guardians}
                            </div>
                            <div>
                                <strong>Genders:</strong>{" "}
                                {JSON.stringify(statistics.genders)}
                            </div>
                            <div>
                                <strong>Blood Types:</strong>{" "}
                                {JSON.stringify(statistics.blood_types)}
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Development Debug Panel
            {process.env.NODE_ENV === "development" && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm">
                    <div className="font-medium mb-2">
                        🔧 Development Debug Panel
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                            <strong>Total Patients:</strong> {statistics.total}{" "}
                            ({typeof statistics.total})
                        </div>
                        <div>
                            <strong>Genders:</strong>{" "}
                            {Array.isArray(statistics.genders)
                                ? "Array"
                                : "Object"}
                            ({Object.keys(statistics.genders || {}).length}{" "}
                            items)
                        </div>
                        <div>
                            <strong>Blood Types:</strong>{" "}
                            {Array.isArray(statistics.blood_types)
                                ? "Array"
                                : "Object"}
                            ({Object.keys(statistics.blood_types || {}).length}{" "}
                            items)
                        </div>
                    </div>
                    <details className="mt-3">
                        <summary className="cursor-pointer font-medium">
                            Full Raw Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(statistics, null, 2)}
                        </pre>
                    </details>
                </div>
            )} */}

            {/* Main Statistics Cards */}
            <div>
                <SectionTitle icon={BarChart3}>Patient Overview</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Patients"
                        value={statistics.total || 0}
                        icon={Users}
                        color="blue"
                        subtitle={`${
                            statistics.today?.total || 0
                        } registered today`}
                        trend={`${statistics.avg_new_per_day || 0}/day average`}
                    />

                    <StatCard
                        title="With Guardians"
                        value={statistics.with_guardians || 0}
                        icon={Shield}
                        color="green"
                        percentage={statistics.guardian_rate}
                        subtitle={`${
                            statistics.today?.with_guardians || 0
                        } today`}
                    />

                    <StatCard
                        title="With Appointments"
                        value={statistics.with_appointments || 0}
                        icon={Calendar}
                        color="purple"
                        percentage={statistics.appointment_rate}
                        subtitle={`${
                            statistics.without_appointments || 0
                        } without`}
                    />

                    <StatCard
                        title="RM Completion"
                        value={`${statistics.rm_completion_rate || 0}%`}
                        icon={FileText}
                        color="yellow"
                        subtitle={`${
                            statistics.rm_status?.with_rm || 0
                        } have RM numbers`}
                    />
                </div>
            </div>

            {/* Time-based Statistics */}
            <div>
                <SectionTitle icon={Clock}>Registration Trends</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="This Week"
                        value={statistics.this_week?.total || 0}
                        icon={UserPlus}
                        color="indigo"
                        subtitle={`${
                            statistics.this_week?.with_guardians || 0
                        } with guardians`}
                    />

                    <StatCard
                        title="This Month"
                        value={statistics.this_month?.total || 0}
                        icon={TrendingUp}
                        color="green"
                        subtitle={`${
                            statistics.this_month?.with_guardians || 0
                        } with guardians`}
                    />

                    <StatCard
                        title="Recent Activity"
                        value={statistics.recent_registrations || 0}
                        icon={Activity}
                        color="pink"
                        subtitle="Last 7 days"
                    />
                </div>
            </div>

            {/* Demographics and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gender Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <SectionTitle icon={Users}>
                        Gender Distribution
                    </SectionTitle>
                    <div className="space-y-3">
                        {statistics.genders &&
                        Object.keys(statistics.genders).length > 0 ? (
                            Object.entries(statistics.genders).map(
                                ([gender, count]) => {
                                    const total = Object.values(
                                        statistics.genders
                                    ).reduce((sum, c) => sum + c, 0);
                                    const percentage =
                                        total > 0
                                            ? Math.round((count / total) * 100)
                                            : 0;
                                    const color =
                                        gender === "Male"
                                            ? "text-blue-500 bg-blue-500"
                                            : "text-pink-500 bg-pink-500";

                                    return (
                                        <div
                                            key={gender}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-3 h-3 rounded-full mr-3 ${
                                                        color.split(" ")[1]
                                                    }`}
                                                ></div>
                                                <span className="text-sm font-medium">
                                                    {gender}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            color.split(" ")[1]
                                                        }`}
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 w-8">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        ) : (
                            <div className="text-center text-gray-500 text-sm py-4">
                                <div>No gender data available</div>
                                <details className="text-xs mt-2">
                                    <summary className="cursor-pointer">
                                        Debug Info
                                    </summary>
                                    <div className="mt-1 p-2 bg-gray-50 rounded text-left">
                                        <div>
                                            <strong>Type:</strong>{" "}
                                            {typeof statistics.genders}
                                        </div>
                                        <div>
                                            <strong>Is Array:</strong>{" "}
                                            {Array.isArray(
                                                statistics.genders
                                            ).toString()}
                                        </div>
                                        <div>
                                            <strong>Keys:</strong>{" "}
                                            {statistics.genders
                                                ? Object.keys(
                                                      statistics.genders
                                                  ).join(", ")
                                                : "none"}
                                        </div>
                                        <div>
                                            <strong>Raw:</strong>{" "}
                                            {JSON.stringify(statistics.genders)}
                                        </div>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Age Groups */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <SectionTitle icon={Baby}>Age Groups</SectionTitle>
                    <AgeGroupChart ageGroups={statistics.age_groups} />
                </div>

                {/* Blood Types */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <SectionTitle icon={Heart}>Blood Types</SectionTitle>
                    <BloodTypeChart bloodTypes={statistics.blood_types} />
                </div>
            </div>

            {/* Additional Statistics */}
            <div>
                <SectionTitle icon={Target}>Key Metrics</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Guardian Rate"
                        value={`${statistics.guardian_rate || 0}%`}
                        icon={Shield}
                        color="green"
                        subtitle="Patients with guardians"
                    />

                    <StatCard
                        title="Appointment Rate"
                        value={`${statistics.appointment_rate || 0}%`}
                        icon={Calendar}
                        color="blue"
                        subtitle="Patients with appointments"
                    />

                    <StatCard
                        title="Without RM"
                        value={statistics.rm_status?.without_rm || 0}
                        icon={FileText}
                        color="red"
                        subtitle="Need RM number assignment"
                    />

                    <StatCard
                        title="Without Guardian"
                        value={statistics.without_guardians || 0}
                        icon={UserX}
                        color="gray"
                        subtitle="May need guardian assignment"
                    />
                </div>
            </div>

            {/* Success indicator */}
            {statistics.total > 0 && !statistics._error && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center text-green-700">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">
                            Statistics loaded successfully for{" "}
                            {statistics.total} patients
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
