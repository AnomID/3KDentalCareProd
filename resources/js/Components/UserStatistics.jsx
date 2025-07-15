// File: resources/js/Components/UserStatistics.jsx
import React from "react";
import {
    Users,
    UserCheck,
    UserX,
    Shield,
    Stethoscope,
    Briefcase,
    User,
    TrendingUp,
    Activity,
    CheckCircle,
    AlertCircle,
    Calendar,
    BarChart3,
} from "lucide-react";

const UserStatistics = ({ statistics }) => {
    if (!statistics) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="text-center text-gray-500">
                    No statistics available
                </div>
            </div>
        );
    }

    // Main Statistics Cards
    const mainStats = [
        {
            title: "Total Users",
            value: statistics.total || 0,
            subValue: `${statistics.today?.total || 0} today`,
            icon: Users,
            color: "blue",
            description: "All registered users",
        },
        {
            title: "Email Verified",
            value: statistics.verified || 0,
            subValue: `${statistics.verification_rate || 0}% rate`,
            icon: UserCheck,
            color: "green",
            description: "Users with verified emails",
        },
        {
            title: "Unverified",
            value: statistics.unverified || 0,
            subValue: `${
                statistics.today?.total - statistics.today?.verified || 0
            } today`,
            icon: UserX,
            color: "yellow",
            description: "Users pending verification",
        },
        {
            title: "Avg Daily Growth",
            value: `${statistics.avg_new_per_day || 0}`,
            subValue: "users/day",
            icon: TrendingUp,
            color: "purple",
            description: "Average new users per day",
        },
    ];

    // Role Distribution
    const roleStats = [
        {
            role: "Admin",
            count: statistics.roles?.admin || 0,
            icon: Shield,
            color: "red",
        },
        {
            role: "Doctor",
            count: statistics.roles?.doctor || 0,
            icon: Stethoscope,
            color: "blue",
        },
        {
            role: "Employee",
            count: statistics.roles?.employee || 0,
            icon: Briefcase,
            color: "green",
        },
        {
            role: "Patient",
            count: statistics.roles?.patient || 0,
            icon: User,
            color: "purple",
        },
    ];

    // Time-based statistics
    const timeStats = [
        {
            period: "Today",
            total: statistics.today?.total || 0,
            verified: statistics.today?.verified || 0,
            icon: Calendar,
        },
        {
            period: "This Week",
            total: statistics.this_week?.total || 0,
            verified: statistics.this_week?.verified || 0,
            icon: BarChart3,
        },
        {
            period: "This Month",
            total: statistics.this_month?.total || 0,
            verified: statistics.this_month?.verified || 0,
            icon: Activity,
        },
    ];

    const getColorClasses = (color, type = "bg") => {
        const colors = {
            blue: {
                bg: "bg-blue-50 border-blue-200",
                text: "text-blue-700",
                icon: "text-blue-600 bg-blue-100",
            },
            green: {
                bg: "bg-green-50 border-green-200",
                text: "text-green-700",
                icon: "text-green-600 bg-green-100",
            },
            yellow: {
                bg: "bg-yellow-50 border-yellow-200",
                text: "text-yellow-700",
                icon: "text-yellow-600 bg-yellow-100",
            },
            purple: {
                bg: "bg-purple-50 border-purple-200",
                text: "text-purple-700",
                icon: "text-purple-600 bg-purple-100",
            },
            red: {
                bg: "bg-red-50 border-red-200",
                text: "text-red-700",
                icon: "text-red-600 bg-red-100",
            },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-6 mb-6">
            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainStats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    const colorClasses = getColorClasses(stat.color);

                    return (
                        <div
                            key={index}
                            className={`p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${colorClasses.bg}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-medium opacity-75 ${colorClasses.text}`}
                                    >
                                        {stat.title}
                                    </p>
                                    <p
                                        className={`text-3xl font-bold mt-1 ${colorClasses.text}`}
                                    >
                                        {stat.value}
                                    </p>
                                    <p
                                        className={`text-sm opacity-60 mt-2 ${colorClasses.text}`}
                                    >
                                        {stat.subValue}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stat.description}
                                    </p>
                                </div>
                                <div
                                    className={`p-3 rounded-lg ${colorClasses.icon}`}
                                >
                                    <IconComponent size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                        <Shield className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                            Role Distribution
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {roleStats.map((role, index) => {
                            const IconComponent = role.icon;
                            const colorClasses = getColorClasses(role.color);
                            const percentage =
                                statistics.total > 0
                                    ? (
                                          (role.count / statistics.total) *
                                          100
                                      ).toFixed(1)
                                    : 0;

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <div
                                            className={`p-2 rounded-lg mr-3 ${colorClasses.icon}`}
                                        >
                                            <IconComponent size={16} />
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900">
                                                {role.role}
                                            </span>
                                            <div className="text-xs text-gray-500">
                                                {percentage}% of total
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`font-bold ${colorClasses.text}`}
                                    >
                                        {role.count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Profile Completion */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                        <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                            Profile Status
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {/* Complete Profiles */}
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3 bg-green-100 text-green-600">
                                    <CheckCircle size={16} />
                                </div>
                                <div>
                                    <span className="font-medium text-green-900">
                                        Complete Profile
                                    </span>
                                    <div className="text-xs text-green-600">
                                        Ready to use
                                    </div>
                                </div>
                            </div>
                            <div className="font-bold text-green-700">
                                {statistics.profile_completion?.complete || 0}
                            </div>
                        </div>

                        {/* Incomplete Profiles */}
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center">
                                <div className="p-2 rounded-lg mr-3 bg-yellow-100 text-yellow-600">
                                    <AlertCircle size={16} />
                                </div>
                                <div>
                                    <span className="font-medium text-yellow-900">
                                        Incomplete Profile
                                    </span>
                                    <div className="text-xs text-yellow-600">
                                        Needs attention
                                    </div>
                                </div>
                            </div>
                            <div className="font-bold text-yellow-700">
                                {statistics.profile_completion?.incomplete || 0}
                            </div>
                        </div>

                        {/* Profile Completion Rate */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Completion Rate</span>
                                <span>
                                    {statistics.total > 0
                                        ? Math.round(
                                              ((statistics.profile_completion
                                                  ?.complete || 0) /
                                                  statistics.total) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${
                                            statistics.total > 0
                                                ? Math.round(
                                                      ((statistics
                                                          .profile_completion
                                                          ?.complete || 0) /
                                                          statistics.total) *
                                                          100
                                                  )
                                                : 0
                                        }%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                        <Activity className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                            Recent Activity
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {timeStats.map((timeStat, index) => {
                            const IconComponent = timeStat.icon;
                            const verificationRate =
                                timeStat.total > 0
                                    ? (
                                          (timeStat.verified / timeStat.total) *
                                          100
                                      ).toFixed(1)
                                    : 0;

                            return (
                                <div
                                    key={index}
                                    className="p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <IconComponent className="h-4 w-4 text-gray-500 mr-2" />
                                            <span className="font-medium text-gray-900">
                                                {timeStat.period}
                                            </span>
                                        </div>
                                        <span className="font-bold text-blue-600">
                                            {timeStat.total}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>
                                            Verified: {timeStat.verified}
                                        </span>
                                        <span>{verificationRate}% rate</span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Growth Indicator */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                                    <span className="font-medium text-blue-900">
                                        Growth Trend
                                    </span>
                                </div>
                                <span className="text-sm text-blue-600">
                                    {statistics.avg_new_per_day || 0} users/day
                                </span>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                {statistics.recent_registrations || 0} new users
                                this week
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatistics;
