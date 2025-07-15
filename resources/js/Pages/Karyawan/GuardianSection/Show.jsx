import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

export default function Show({ guardian }) {
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
            <Head title={`${guardian.name} - Guardian Details`} />

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Guardian Details
                        </h2>
                        <div className="flex space-x-2">
                            <Link
                                href={route("guardians.edit", guardian.id)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Edit Guardian
                            </Link>
                            <Link
                                href={route("guardians.index")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Back to Guardians
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Guardian Information */}
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                                Personal Information
                            </h3>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Name</div>
                                    <div className="font-medium">
                                        {guardian.name}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Relationship
                                    </div>
                                    <div className="font-medium">
                                        {guardian.relationship || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Identity Type
                                    </div>
                                    <div className="font-medium">
                                        {guardian.identity_type || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Identity Number
                                    </div>
                                    <div className="font-medium">
                                        {guardian.identity_number || "N/A"}
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
                                        {guardian.phone_number || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">Address</div>
                                    <div className="font-medium">
                                        {guardian.address || "N/A"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="text-gray-600">
                                        Registered On
                                    </div>
                                    <div className="font-medium">
                                        {formatDate(guardian.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Associated Patients */}
                    {guardian.patients && guardian.patients.length > 0 && (
                        <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                                Associated Patients ({guardian.patients.length})
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="py-2 px-4 text-left font-medium text-gray-700">
                                                RM Number
                                            </th>
                                            <th className="py-2 px-4 text-left font-medium text-gray-700">
                                                Name
                                            </th>
                                            <th className="py-2 px-4 text-left font-medium text-gray-700">
                                                Gender
                                            </th>
                                            <th className="py-2 px-4 text-left font-medium text-gray-700">
                                                Age
                                            </th>
                                            <th className="py-2 px-4 text-left font-medium text-gray-700">
                                                Phone
                                            </th>
                                            <th className="py-2 px-4 text-left font-medium text-gray-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {guardian.patients.map((patient) => (
                                            <tr
                                                key={patient.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="py-2 px-4 text-gray-800">
                                                    {patient.no_rm || "N/A"}
                                                </td>
                                                <td className="py-2 px-4 text-gray-800">
                                                    {patient.name}
                                                </td>
                                                <td className="py-2 px-4 text-gray-800">
                                                    {patient.gender}
                                                </td>
                                                <td className="py-2 px-4 text-gray-800">
                                                    {patient.age || "N/A"}
                                                </td>
                                                <td className="py-2 px-4 text-gray-800">
                                                    {patient.phone}
                                                </td>
                                                <td className="py-2 px-4">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route(
                                                                "patients.show",
                                                                patient.id
                                                            )}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {guardian.patients && guardian.patients.length === 0 && (
                        <div className="mt-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="text-center py-4 text-gray-500">
                                <p>This guardian has no associated patients</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthorizeLayout>
    );
}
