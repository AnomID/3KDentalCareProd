import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

export default function Show({ employee }) {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <AuthorizeLayout>
            <Head title={`${employee.name} - Employee Details`} />

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Employee Details
                        </h2>
                        <div className="flex space-x-2">
                            <Link
                                href={route("employees.edit", employee.id)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Edit Employee
                            </Link>
                            <Link
                                href={route("employees.index")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Back to Employees
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee Information */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                                Personal Information
                            </h3>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Employee Code
                                    </div>
                                    <div className="font-medium">
                                        {employee.code}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Name</div>
                                    <div className="font-medium">
                                        {employee.name}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Position
                                    </div>
                                    <div className="font-medium">
                                        {employee.position}
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
                                        {employee.phone || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Address</div>
                                    <div className="font-medium">
                                        {employee.address || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Email</div>
                                    <div className="font-medium">
                                        {employee.user && employee.user.email
                                            ? employee.user.email
                                            : "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Registered On
                                    </div>
                                    <div className="font-medium">
                                        {formatDate(employee.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                            Account Information
                        </h3>

                        <div className="p-4 rounded-md bg-gray-50">
                            <p className="text-sm text-gray-700">
                                This employee has an associated user account
                                with the email:
                                <span className="font-medium ml-2">
                                    {employee.user && employee.user.email
                                        ? employee.user.email
                                        : "No associated user account"}
                                </span>
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                Account created on:
                                <span className="font-medium ml-2">
                                    {employee.user && employee.user.created_at
                                        ? formatDate(employee.user.created_at)
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
