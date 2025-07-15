import React from "react";
import { Link } from "@inertiajs/react";

const Pagination = ({ links }) => {
    // Don't render pagination if there's only 1 page
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-white shadow-sm rounded-md mt-4">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                            {links[0].label === "&laquo; Previous"
                                ? links[1].label
                                : links[0].label}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                            {links[links.length - 2].label === "Next &raquo;"
                                ? links[links.length - 3].label
                                : links[links.length - 2].label}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                            {links[links.length - 2].label}
                        </span>{" "}
                        results
                    </p>
                </div>
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        {links.map((link, index) => {
                            // Skip rendering "..." links
                            if (link.label.includes("...")) {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            // For active, previous, next and numeric links
                            return !link.url ? (
                                <span
                                    key={index}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                        link.active
                                            ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            : "text-gray-500 bg-white cursor-not-allowed"
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                        link.active
                                            ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            : "text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile pagination version */}
            <div className="flex sm:hidden items-center justify-between w-full">
                <div className="flex justify-between w-full">
                    {links[0].url ? (
                        <Link
                            href={links[0].url}
                            className="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white ring-1 ring-gray-300 hover:bg-gray-50"
                        >
                            Previous
                        </Link>
                    ) : (
                        <span className="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-500 bg-white cursor-not-allowed">
                            Previous
                        </span>
                    )}

                    {links[links.length - 1].url ? (
                        <Link
                            href={links[links.length - 1].url}
                            className="relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white ring-1 ring-gray-300 hover:bg-gray-50"
                        >
                            Next
                        </Link>
                    ) : (
                        <span className="relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-500 bg-white cursor-not-allowed">
                            Next
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pagination;
