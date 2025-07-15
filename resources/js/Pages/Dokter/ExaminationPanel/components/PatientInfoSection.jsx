import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { User, Calendar, Clock, Phone, MapPin, Briefcase } from "lucide-react";

const PatientInfoSection = ({ patient, appointment, onNext }) => {
    // Format date helper
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Calculate age from birth date
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }

        return age;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patient Information */}
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start mb-4">
                                <div className="h-14 w-14 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User size={24} className="text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-xl font-semibold text-gray-900">
                                        {patient.name}
                                    </h4>
                                    <div className="flex items-center mt-1 text-gray-600">
                                        <span className="mr-3">
                                            {patient.gender === "male"
                                                ? "Laki-laki"
                                                : "Perempuan"}
                                        </span>
                                        <span className="mx-1 text-gray-400">
                                            •
                                        </span>
                                        <span className="mx-3">
                                            {calculateAge(patient.birth_date)}{" "}
                                            tahun
                                        </span>
                                        <span className="mx-1 text-gray-400">
                                            •
                                        </span>
                                        <span className="mx-3">
                                            No. RM: {patient.no_rm || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                                        Tanggal Lahir
                                    </h5>
                                    <p className="text-gray-800 flex items-center">
                                        <Calendar
                                            size={16}
                                            className="mr-2 text-blue-600"
                                        />
                                        {formatDate(patient.birth_date)}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                                        Nomor Telepon
                                    </h5>
                                    <p className="text-gray-800 flex items-center">
                                        <Phone
                                            size={16}
                                            className="mr-2 text-blue-600"
                                        />
                                        {patient.phone || "-"}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                                        Alamat
                                    </h5>
                                    <p className="text-gray-800 flex items-center">
                                        <MapPin
                                            size={16}
                                            className="mr-2 text-blue-600"
                                        />
                                        {patient.address || "-"}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                                        Pekerjaan
                                    </h5>
                                    <p className="text-gray-800 flex items-center">
                                        <Briefcase
                                            size={16}
                                            className="mr-2 text-blue-600"
                                        />
                                        {patient.occupation || "-"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Appointment Information */}
                <div>
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Calendar
                                    size={18}
                                    className="mr-2 text-blue-600"
                                />
                                Detail Janji Temu
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                                        Tanggal & Waktu
                                    </h5>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-800 flex items-center">
                                            <Calendar
                                                size={16}
                                                className="mr-2 text-blue-600"
                                            />
                                            {formatDate(
                                                appointment.appointment_date
                                            )}
                                        </p>
                                        <p className="text-gray-800 flex items-center mt-1">
                                            <Clock
                                                size={16}
                                                className="mr-2 text-blue-600"
                                            />
                                            {appointment.appointment_time?.substring(
                                                0,
                                                5
                                            )}{" "}
                                            WIB
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                                        Keluhan Utama
                                    </h5>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-800">
                                            {appointment.chief_complaint}
                                        </p>
                                    </div>
                                </div>

                                {appointment.notes && (
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-500 mb-2">
                                            Catatan
                                        </h5>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-800">
                                                {appointment.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={onNext}>Lanjutkan ke Riwayat Medis</Button>
            </div>
        </div>
    );
};

export default PatientInfoSection;
