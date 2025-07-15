import React from "react";
import { Calendar, Clock } from "lucide-react";
import { formatDateWithDay } from "../utils/dateFormatters";

const AppointmentStatusBar = ({ appointment }) => {
    const statusColors = {
        scheduled: "bg-blue-100 text-blue-800",
        confirmed: "bg-green-100 text-green-800",
        completed: "bg-purple-100 text-purple-800",
        canceled: "bg-red-100 text-red-800",
        no_show: "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
        scheduled: "Terjadwal",
        confirmed: "Dikonfirmasi",
        completed: "Selesai",
        canceled: "Dibatalkan",
        no_show: "Tidak Hadir",
    };

    return (
        <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
                <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[appointment.status]
                    }`}
                >
                    {statusLabels[appointment.status]}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600 text-sm flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {formatDateWithDay(appointment.appointment_date)}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600 text-sm flex items-center">
                    <Clock size={16} className="mr-1" />
                    {appointment.appointment_time?.substring(0, 5)} WIB
                </span>
            </div>
            {appointment.queue && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                    No. Antrian:{" "}
                    {appointment.queue.formatted_queue_number ||
                        (appointment.queue.queue_number
                            ? "A" +
                              String(appointment.queue.queue_number).padStart(
                                  3,
                                  "0"
                              )
                            : "-")}
                </div>
            )}
        </div>
    );
};

export default AppointmentStatusBar;
