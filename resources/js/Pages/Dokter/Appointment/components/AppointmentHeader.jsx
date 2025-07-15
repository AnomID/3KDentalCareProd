import React from "react";
import { Link } from "@inertiajs/react";
import {
    ChevronLeft,
    ClipboardCheck,
    UserMinus,
    CalendarPlus,
    AlertCircle,
    Printer,
} from "lucide-react";

const AppointmentHeader = ({
    appointment,
    canComplete,
    canCancel,
    canMarkNoShow,
    handleCancelAppointment,
    handleMarkNoShow,
    handlePrintAppointment,
}) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
                <Link
                    href={route("doctor.appointments.today")}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
                <h2 className="text-2xl font-semibold text-gray-800">
                    Detail Janji Temu Pasien
                </h2>
            </div>
            <div className="flex space-x-3">
                {appointment.status === "confirmed" && canComplete && (
                    <Link
                        href={route("doctor.examination.show", appointment.id)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all flex items-center"
                    >
                        <ClipboardCheck size={18} className="mr-2" />
                        Proses Konsultasi
                    </Link>
                )}
                {appointment.status === "confirmed" && canMarkNoShow && (
                    <button
                        onClick={handleMarkNoShow}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all flex items-center"
                    >
                        <UserMinus size={18} className="mr-2" />
                        Tidak Hadir
                    </button>
                )}

                {appointment.status !== "canceled" &&
                    appointment.status !== "completed" &&
                    canCancel && (
                        <button
                            onClick={handleCancelAppointment}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all flex items-center"
                        >
                            <AlertCircle size={18} className="mr-2" />
                            Batalkan
                        </button>
                    )}
                <button
                    onClick={handlePrintAppointment}
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all flex items-center"
                >
                    <Printer size={18} className="mr-2" />
                    Cetak
                </button>
            </div>
        </div>
    );
};

export default AppointmentHeader;
