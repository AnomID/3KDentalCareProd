import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { Calendar, Clock, FileText, ArrowLeft, Check } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function EditAppointment({ appointment, schedules }) {
    const { auth } = usePage().props;
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        schedule_id: appointment.schedule_id.toString(),
        appointment_date: appointment.appointment_date,
        reason: appointment.reason || "",
    });

    // When date changes, fetch available schedules
    useEffect(() => {
        if (data.appointment_date) {
            setIsLoading(true);
            axios
                .get("/api/available-schedules", {
                    params: {
                        doctor_id: appointment.doctor_id,
                        date: data.appointment_date,
                    },
                })
                .then((response) => {
                    const schedulesData = response.data;

                    // Keep the current schedule in the list even if it's full now
                    const currentScheduleInResponse = schedulesData.some(
                        (schedule) =>
                            schedule.id.toString() ===
                            appointment.schedule_id.toString()
                    );

                    if (!currentScheduleInResponse) {
                        const currentSchedule = schedules.find(
                            (schedule) =>
                                schedule.id.toString() ===
                                appointment.schedule_id.toString()
                        );

                        if (currentSchedule) {
                            schedulesData.push({
                                ...currentSchedule,
                                remaining_quota: 0,
                                note: "Jadwal saat ini (sudah penuh)",
                            });
                        }
                    }

                    setAvailableSchedules(schedulesData);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching schedules:", error);
                    setIsLoading(false);
                });
        }
    }, [data.appointment_date]);

    const handleDateChange = (e) => {
        const date = e.target.value;
        setData("appointment_date", date);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("patient.appointments.update", appointment.id));
    };

    // Calculate the minimum date (can't edit to a date before today)
    const today = new Date().toISOString().split("T")[0];

    // Format doctor name
    const doctorName = appointment.doctor.name;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-extrabold text-[#EEE4D3]">
                        Edit Janji Temu
                    </h2>
                    <span className="text-[#1D1D22] bg-[#F8D465] px-4 py-2 rounded-lg">
                        Halo, {auth.user.name}!
                    </span>
                </div>
            }
        >
            <Head title="Edit Janji Temu" />

            {/* Background Gradien */}
            <div className="py-8 min-h-screen bg-gradient-to-r from-[#1D1D22] via-[#3C2A25] to-[#4F3623]">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* Back button */}
                    <Link
                        href={route(
                            "patient.appointments.show",
                            appointment.id
                        )}
                        className="inline-flex items-center text-[#D5CABB] hover:text-[#F8D465] mb-6 transition-all"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Kembali ke Detail Janji Temu
                    </Link>

                    {/* Form Card */}
                    <div className="bg-[#D5CABB] p-8 rounded-lg shadow-lg border-l-4 border-[#F8D465]">
                        <h3 className="text-2xl font-bold text-[#1D1D22] mb-6">
                            Edit Janji Temu dengan Dr. {doctorName}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            {/* Doctor Info (Read-only) */}
                            <div className="mb-6 bg-[#C3A764]/20 p-4 rounded-lg">
                                <p className="text-[#1D1D22] font-semibold">
                                    Dokter: Dr. {appointment.doctor.name}
                                </p>
                                <p className="text-[#1D1D22]">
                                    Spesialisasi:{" "}
                                    {appointment.doctor.specialties?.[0]
                                        ?.name || "Dokter Umum"}
                                </p>
                            </div>

                            {/* Date Selection */}
                            <div className="mb-6">
                                <label
                                    htmlFor="appointment_date"
                                    className="block text-[#1D1D22] font-semibold mb-2 flex items-center"
                                >
                                    <Calendar size={20} className="mr-2" />
                                    Pilih Tanggal
                                </label>
                                <input
                                    type="date"
                                    id="appointment_date"
                                    value={data.appointment_date}
                                    onChange={handleDateChange}
                                    min={today}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#F8D465] focus:ring focus:ring-[#F8D465] focus:ring-opacity-50 bg-white text-[#1D1D22]"
                                    required
                                />
                                {errors.appointment_date && (
                                    <p className="text-red-600 mt-1">
                                        {errors.appointment_date}
                                    </p>
                                )}
                            </div>

                            {/* Schedule Selection */}
                            <div className="mb-6">
                                <label
                                    htmlFor="schedule_id"
                                    className="block text-[#1D1D22] font-semibold mb-2 flex items-center"
                                >
                                    <Clock size={20} className="mr-2" />
                                    Pilih Jadwal
                                </label>
                                {isLoading ? (
                                    <div className="text-[#1D1D22] italic">
                                        Memuat jadwal tersedia...
                                    </div>
                                ) : data.appointment_date ? (
                                    availableSchedules.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {availableSchedules.map(
                                                (schedule) => (
                                                    <div
                                                        key={schedule.id}
                                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                            data.schedule_id ===
                                                            schedule.id.toString()
                                                                ? "bg-[#F8D465] border-[#C3A764]"
                                                                : "bg-white hover:bg-[#F8D465]/50 border-gray-300"
                                                        } ${
                                                            schedule.remaining_quota ===
                                                                0 &&
                                                            schedule.id.toString() !==
                                                                appointment.schedule_id.toString()
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            // Allow selecting if it's either the current schedule or has quota
                                                            if (
                                                                schedule.remaining_quota >
                                                                    0 ||
                                                                schedule.id.toString() ===
                                                                    appointment.schedule_id.toString()
                                                            ) {
                                                                setData(
                                                                    "schedule_id",
                                                                    schedule.id.toString()
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div className="font-medium text-[#1D1D22] flex justify-between">
                                                            <span>
                                                                {
                                                                    schedule.formatted_time
                                                                }
                                                            </span>
                                                            {data.schedule_id ===
                                                                schedule.id.toString() && (
                                                                <Check
                                                                    size={18}
                                                                    className="text-[#1D1D22]"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {schedule.note || (
                                                                <>
                                                                    Tersisa:{" "}
                                                                    {
                                                                        schedule.remaining_quota
                                                                    }{" "}
                                                                    slot
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                                            Tidak ada jadwal tersedia untuk
                                            dokter dan tanggal yang dipilih.
                                            Silakan pilih tanggal lain.
                                        </div>
                                    )
                                ) : (
                                    <div className="text-gray-500 italic">
                                        Pilih tanggal terlebih dahulu
                                    </div>
                                )}
                                {errors.schedule_id && (
                                    <p className="text-red-600 mt-1">
                                        {errors.schedule_id}
                                    </p>
                                )}
                            </div>

                            {/* Reason */}
                            <div className="mb-6">
                                <label
                                    htmlFor="reason"
                                    className="block text-[#1D1D22] font-semibold mb-2 flex items-center"
                                >
                                    <FileText size={20} className="mr-2" />
                                    Alasan Kunjungan
                                </label>
                                <textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData("reason", e.target.value)
                                    }
                                    rows={4}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#F8D465] focus:ring focus:ring-[#F8D465] focus:ring-opacity-50 bg-white text-[#1D1D22]"
                                    placeholder="Ceritakan keluhan Anda secara singkat..."
                                ></textarea>
                                {errors.reason && (
                                    <p className="text-red-600 mt-1">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            {/* Submit & Cancel Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#F8D465] hover:bg-[#C3A764] text-[#1D1D22] font-bold py-3 px-6 rounded-lg transition-all flex-1 flex items-center justify-center"
                                >
                                    {processing ? (
                                        "Memproses..."
                                    ) : (
                                        <>
                                            <Check size={20} className="mr-2" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={route(
                                        "patient.appointments.show",
                                        appointment.id
                                    )}
                                    className="bg-gray-300 hover:bg-gray-400 text-[#1D1D22] font-bold py-3 px-6 rounded-lg transition-all flex-1 text-center"
                                >
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Info Card */}
                    <div className="mt-6 bg-[#F8D465] p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-[#1D1D22] mb-2">
                            Perhatian
                        </h3>
                        <ul className="space-y-2 text-[#1D1D22]">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Perubahan jadwal hanya bisa dilakukan minimal 24
                                jam sebelum jadwal asli
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Pastikan jadwal baru sesuai dengan ketersediaan
                                Anda
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Jika Anda ingin membatalkan janji temu, silakan
                                gunakan tombol "Batalkan" di halaman detail
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
