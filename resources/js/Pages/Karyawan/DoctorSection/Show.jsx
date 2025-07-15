import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

export default function Show({ doctor }) {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Calculate days until license expiry
    const calculateDaysUntilExpiry = () => {
        if (!doctor.license_expiry_date) return null;

        const today = new Date();
        const expiryDate = new Date(doctor.license_expiry_date);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const daysUntilExpiry = calculateDaysUntilExpiry();
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90;
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

    return (
        <AuthorizeLayout>
            <Head title={`${doctor.name} - Doctor Details`} />

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Doctor Details
                        </h2>
                        <div className="flex space-x-2">
                            <Link
                                href={route("doctors.edit", doctor.id)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Edit Doctor
                            </Link>
                            <Link
                                href={route("doctors.index")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Back to Doctors
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doctor Information */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                                Personal Information
                            </h3>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Doctor Code
                                    </div>
                                    <div className="font-medium">
                                        {doctor.code}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Name</div>
                                    <div className="font-medium">
                                        {doctor.name}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Specialization
                                    </div>
                                    <div className="font-medium">
                                        {doctor.specialization}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        License Number
                                    </div>
                                    <div className="font-medium">
                                        {doctor.license_number}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        License Start Date
                                    </div>
                                    <div className="font-medium">
                                        {formatDate(doctor.license_start_date)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        License Expiry Date
                                    </div>
                                    <div className="font-medium">
                                        <span
                                            className={
                                                isExpired
                                                    ? "text-red-600"
                                                    : isExpiringSoon
                                                    ? "text-yellow-600"
                                                    : ""
                                            }
                                        >
                                            {formatDate(
                                                doctor.license_expiry_date
                                            )}
                                        </span>
                                        {daysUntilExpiry !== null && (
                                            <span
                                                className={`ml-2 text-xs rounded-full px-2 py-1 ${
                                                    isExpired
                                                        ? "bg-red-100 text-red-800"
                                                        : isExpiringSoon
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-green-100 text-green-800"
                                                }`}
                                            >
                                                {isExpired
                                                    ? "Expired"
                                                    : isExpiringSoon
                                                    ? `Expires in ${daysUntilExpiry} days`
                                                    : `Valid for ${daysUntilExpiry} days`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                                Contact Information
                            </h3>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Phone</div>
                                    <div className="font-medium">
                                        {doctor.phone || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Address</div>
                                    <div className="font-medium">
                                        {doctor.address || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Email</div>
                                    <div className="font-medium">
                                        {doctor.user && doctor.user.email
                                            ? doctor.user.email
                                            : "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Registered On
                                    </div>
                                    <div className="font-medium">
                                        {formatDate(doctor.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Practice Information */}
                    <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                            Practice Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-md">
                                <div className="text-lg font-medium text-gray-800 mb-2">
                                    Appointments
                                </div>
                                <div className="flex items-center">
                                    <div className="text-3xl font-bold text-indigo-600">
                                        {doctor.appointment_count || 0}
                                    </div>
                                    <div className="ml-3 text-gray-600">
                                        Total appointments handled by this
                                        doctor
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-md">
                                <div className="text-lg font-medium text-gray-800 mb-2">
                                    License Status
                                </div>
                                <div className="flex items-start">
                                    <div
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            isExpired
                                                ? "bg-red-100 text-red-800"
                                                : isExpiringSoon
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {isExpired
                                            ? "Expired"
                                            : isExpiringSoon
                                            ? "Expiring Soon"
                                            : "Active"}
                                    </div>
                                    <div className="ml-3 text-gray-600">
                                        {isExpired
                                            ? "License has expired and needs renewal"
                                            : isExpiringSoon
                                            ? `License will expire in ${daysUntilExpiry} days`
                                            : `License is active and valid until ${formatDate(
                                                  doctor.license_expiry_date
                                              )}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                            Account Information
                        </h3>

                        <div className="p-4 rounded-md bg-gray-50">
                            <p className="text-sm text-gray-700">
                                This doctor has an associated user account with
                                the email:
                                <span className="font-medium ml-2">
                                    {doctor.user && doctor.user.email
                                        ? doctor.user.email
                                        : "No associated user account"}
                                </span>
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                Account created on:
                                <span className="font-medium ml-2">
                                    {doctor.user && doctor.user.created_at
                                        ? formatDate(doctor.user.created_at)
                                        : "N/A"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthorizeLayout>
    );
}
