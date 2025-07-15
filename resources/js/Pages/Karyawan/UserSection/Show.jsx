// File: resources/js/Pages/Karyawan/UserSection/Show.jsx
import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";
import {
    User,
    Mail,
    Calendar,
    Shield,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Settings,
    Crown,
    Stethoscope,
    Briefcase,
    Users,
    Phone,
    MapPin,
    FileText,
    Edit,
    Clock,
    Activity,
} from "lucide-react";

export default function Show({ user, has_complete_profile, profile_data }) {
    const [showPasswordModal, setShowPasswordModal] = useState(false);

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

    const RoleIcon = roleIcons[user.role] || User;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatSimpleDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <AuthorizeLayout>
            <Head title={`User Details - ${user.name}`} />

            <div className="bg-white shadow-lg rounded-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route("users.index")}
                                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
                            >
                                <ArrowLeft size={20} className="mr-2" />
                                Back to Users
                            </Link>

                            <div className="flex items-center">
                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <User className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {user.name}
                                    </h1>
                                    <p className="text-gray-600">
                                        User ID: {user.id}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                                                roleColors[user.role] ||
                                                "bg-gray-50 text-gray-700 border-gray-200"
                                            }`}
                                        >
                                            <RoleIcon className="h-4 w-4 mr-1" />
                                            {roleLabels[user.role] ||
                                                user.role
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    user.role.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Account Information */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-gray-600" />
                                    Account Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="flex items-center p-3 bg-white rounded-lg border">
                                            <User className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-900">
                                                {user.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="flex items-center p-3 bg-white rounded-lg border">
                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-900">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            User Role
                                        </label>
                                        <div className="flex items-center p-3 bg-white rounded-lg border">
                                            <RoleIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-900">
                                                {roleLabels[user.role] ||
                                                    user.role
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        user.role.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Member Since
                                        </label>
                                        <div className="flex items-center p-3 bg-white rounded-lg border">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-900">
                                                {formatSimpleDate(
                                                    user.created_at
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                                    Profile Information
                                </h2>

                                {has_complete_profile ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                                            <div>
                                                <div className="font-medium text-green-900">
                                                    Profile Complete
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    User has completed their
                                                    profile setup
                                                </div>
                                            </div>
                                        </div>

                                        {profile_data && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {profile_data.name && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Profile Name
                                                        </label>
                                                        <div className="p-3 bg-white rounded-lg border">
                                                            {profile_data.name}
                                                        </div>
                                                    </div>
                                                )}

                                                {profile_data.phone && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Phone Number
                                                        </label>
                                                        <div className="p-3 bg-white rounded-lg border">
                                                            {profile_data.phone}
                                                        </div>
                                                    </div>
                                                )}

                                                {profile_data.no_rm && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            RM Number
                                                        </label>
                                                        <div className="p-3 bg-white rounded-lg border">
                                                            {profile_data.no_rm}
                                                        </div>
                                                    </div>
                                                )}

                                                {profile_data.specialization && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Specialization
                                                        </label>
                                                        <div className="p-3 bg-white rounded-lg border">
                                                            {
                                                                profile_data.specialization
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                                {profile_data.license_number && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            License Number
                                                        </label>
                                                        <div className="p-3 bg-white rounded-lg border">
                                                            {
                                                                profile_data.license_number
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                                {profile_data.position && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Position
                                                        </label>
                                                        <div className="p-3 bg-white rounded-lg border">
                                                            {
                                                                profile_data.position
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                                {profile_data.employee_id && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Employee ID
                                                        </label>
                                                        <div className="p-3 bg-white rounded-lg border">
                                                            {
                                                                profile_data.employee_id
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : user.role === "admin" ? (
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <Crown className="h-5 w-5 text-blue-600 mr-3" />
                                        <div>
                                            <div className="font-medium text-blue-900">
                                                Admin Account
                                            </div>
                                            <div className="text-sm text-blue-600">
                                                Admin accounts don't require
                                                additional profile setup
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                                        <div>
                                            <div className="font-medium text-yellow-900">
                                                Profile Incomplete
                                            </div>
                                            <div className="text-sm text-yellow-600">
                                                User needs to complete their{" "}
                                                {user.role} profile setup
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="space-y-6">
                            {/* Account Status */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Activity className="h-5 w-5 mr-2 text-gray-600" />
                                    Account Status
                                </h3>

                                <div className="space-y-4">
                                    {/* Email Verification */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-700">
                                                Email Status
                                            </span>
                                        </div>
                                        {user.email_verified_at ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800 border border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Unverified
                                            </span>
                                        )}
                                    </div>

                                    {/* Profile Status */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-700">
                                                Profile Status
                                            </span>
                                        </div>
                                        {has_complete_profile ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800 border border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Complete
                                            </span>
                                        ) : user.role === "admin" ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                                                <Crown className="h-3 w-3 mr-1" />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Incomplete
                                            </span>
                                        )}
                                    </div>

                                    {/* Registration Date */}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Registered
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {formatDate(user.created_at)}
                                        </div>
                                    </div>

                                    {/* Email Verification Date */}
                                    {user.email_verified_at && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Email Verified
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {formatDate(
                                                    user.email_verified_at
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                                    Quick Actions
                                </h3>

                                <div className="space-y-3">
                                    <button
                                        onClick={() =>
                                            setShowPasswordModal(true)
                                        }
                                        className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200"
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Change Password
                                    </button>

                                    <Link
                                        href={route("users.index")}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Back to Users
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Change Modal - You can implement this as a separate component */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            Change Password for {user.name}
                        </h3>
                        {/* Add password change form here */}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthorizeLayout>
    );
}
