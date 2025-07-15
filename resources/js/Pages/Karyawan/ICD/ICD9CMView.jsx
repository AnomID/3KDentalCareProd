import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

export default function ICD9CMView({ auth, codes, search }) {
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [showImportModal, setShowImportModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("icd.icd9cm"),
            { search: searchTerm },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleImport = (e) => {
        e.preventDefault();
        post(route("icd.icd9cm.import"), {
            onSuccess: () => {
                setShowImportModal(false);
                reset();
            },
        });
    };

    return (
        <AuthorizeLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    ICD 9CM Codes
                </h2>
            }
        >
            <Head title="ICD 9CM Codes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Header Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-medium">
                                        ICD 9CM Procedure Codes
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Manage ICD 9CM procedure codes
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Import Excel
                                </button>
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder="Search by code or description..."
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {codes.data.map((code) => (
                                            <tr key={code.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {code.code}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {code.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            code.is_active
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {code.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {codes.links && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex space-x-1">
                                        {codes.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    router.get(link.url)
                                                }
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded ${
                                                    link.active
                                                        ? "bg-blue-500 text-white"
                                                        : link.url
                                                        ? "bg-white text-gray-700 hover:bg-gray-50 border"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Import ICD 9CM Codes
                            </h3>
                            <form onSubmit={handleImport}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Excel File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) =>
                                            setData("file", e.target.files[0])
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                    {errors.file && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.file}
                                        </p>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 mb-4">
                                    <p>
                                        <strong>Format:</strong>
                                    </p>
                                    <p>Column A: Code</p>
                                    <p>Column B: Description</p>
                                    <p>
                                        Column C: Active (optional, default:
                                        true)
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowImportModal(false)
                                        }
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    >
                                        {processing ? "Importing..." : "Import"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthorizeLayout>
    );
}
