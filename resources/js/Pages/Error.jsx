import React from "react";
import { usePage } from "@inertiajs/react";

export default function Error({ status, message }) {
    const { errors } = usePage().props;

    const defaultMessages = {
        401: "Unauthorized. You are not authorized to access this resource.",
        403: "Forbidden. You do not have permission to access this resource.",
        404: "Page not found. The resource you requested could not be found.",
        419: "Page expired. Please refresh and try again.",
        429: "Too many requests. Please try again later.",
        500: "Internal server error. Something went wrong on our server.",
        503: "Service unavailable. The service is temporarily unavailable.",
    };

    const getErrorMessage = () => {
        if (message) return message;
        return defaultMessages[status] || "An unexpected error occurred";
    };

    const getErrorTitle = () => {
        switch (status) {
            case 401:
                return "Unauthorized";
            case 403:
                return "Forbidden";
            case 404:
                return "Not Found";
            case 419:
                return "Page Expired";
            case 429:
                return "Too Many Requests";
            case 500:
                return "Server Error";
            case 503:
                return "Service Unavailable";
            default:
                return "Error";
        }
    };

    const getErrorColor = () => {
        switch (status) {
            case 401:
            case 403:
                return "text-yellow-500";
            case 404:
            case 419:
                return "text-blue-500";
            case 429:
                return "text-purple-500";
            case 500:
            case 503:
                return "text-red-500";
            default:
                return "text-gray-700";
        }
    };

    const hasValidationErrors = errors && Object.keys(errors).length > 0;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-16">
            <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
                <div className="text-center">
                    <h1 className={`text-6xl font-bold ${getErrorColor()}`}>
                        {status || "?"}
                    </h1>
                    <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                        {getErrorTitle()}
                    </h2>
                    <p className="mt-2 text-gray-600">{getErrorMessage()}</p>

                    {hasValidationErrors && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">
                                Validation Errors:
                            </h3>
                            <ul className="text-sm text-red-600 space-y-1 text-left">
                                {Object.entries(errors).map(
                                    ([field, error]) => (
                                        <li
                                            key={field}
                                            className="flex items-start"
                                        >
                                            <span className="font-medium mr-1">
                                                {field}:
                                            </span>
                                            {Array.isArray(error)
                                                ? error[0]
                                                : error}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Go Back
                    </button>

                    <a
                        href="/"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-center"
                    >
                        Return to Home
                    </a>
                </div>

                {status === 500 && (
                    <div className="mt-8 text-xs text-gray-500 border-t border-gray-200 pt-4">
                        <p>
                            If this error persists, please contact support with
                            the following information:
                        </p>
                        <div className="mt-2 bg-gray-100 p-3 rounded text-gray-700 font-mono text-xs overflow-auto">
                            <p>Time: {new Date().toISOString()}</p>
                            <p>URL: {window.location.href}</p>
                            {/* You can add more debugging info here if needed */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
