import React from "react";
import { Link } from "@inertiajs/react";

const ExaminationHeader = ({ patient, appointment, formatDate }) => {
    // Status badge styling
    const getStatusBadgeClass = (status) => {
        const statusColors = {
            scheduled: "bg-blue-100 text-blue-800",
            confirmed: "bg-green-100 text-green-800",
            completed: "bg-purple-100 text-purple-800",
            canceled: "bg-red-100 text-red-800",
            no_show: "bg-gray-100 text-gray-800",
        };
        return statusColors[status] || "bg-gray-100 text-gray-800";
    };

    const StatusBadge = ({ status }) => {
        const statusLabels = {
            scheduled: "Terjadwal",
            confirmed: "Dikonfirmasi",
            completed: "Selesai",
            canceled: "Dibatalkan",
            no_show: "Tidak Hadir",
        };

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    status
                )}`}
            >
                {statusLabels[status]}
            </span>
        );
    };

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <Link
                    href={route("doctor.appointments.today")}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-600"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </Link>
                <h2 className="text-2xl font-semibold text-gray-800">
                    Pemeriksaan Pasien
                </h2>
            </div>
            <div className="flex items-center space-x-3">
                <StatusBadge status={appointment.status} />
                <span className="text-gray-600 text-sm">
                    {formatDate(appointment.appointment_date)}
                </span>
            </div>
        </div>
    );
};

export default ExaminationHeader;
