import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, Fragment } from "react";
import { Head } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import ProfileAndPasswordUpdate from "./Partials/ProfileAndPasswordUpdate";

export default function Profile({ patient, message }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Profil Pasien" />

            <div className="max-w-6xl mx-auto mt-14 bg-[#2A2A2A] p-6 rounded-lg shadow-md text-white">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    Profil Pasien
                </h2>

                {message && (
                    <div className="bg-yellow-500 text-black p-3 rounded-md mb-4 text-center">
                        {message}
                    </div>
                )}

                {patient ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold">Nama:</p>
                            <p>{patient.name}</p>
                        </div>
                        <div>
                            <p className="font-semibold">
                                Tempat, Tanggal Lahir:
                            </p>
                            <p>
                                {patient.birth_place}, {patient.birth_date}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold">Usia:</p>
                            <p>{patient.age} tahun</p>
                        </div>
                        <div>
                            <p className="font-semibold">Kewarganegaraan:</p>
                            <p>{patient.citizenship}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Jenis Kelamin:</p>
                            <p>{patient.gender}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Pekerjaan:</p>
                            <p>{patient.occupation || "-"}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="font-semibold">Alamat:</p>
                            <p>{patient.address}</p>
                        </div>
                        <div>
                            <p className="font-semibold">No. HP:</p>
                            <p>{patient.phone}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Golongan Darah:</p>
                            <p>{patient.blood_type}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Tipe Identitas:</p>
                            <p>{patient.identity_type || "-"}</p>
                        </div>
                        <div>
                            <p className="font-semibold">No. Identitas:</p>
                            <p>{patient.no_identity || "-"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-lg font-semibold">
                            Data pasien belum tersedia.
                        </p>
                        <a
                            href="/form"
                            className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                        >
                            Isi Data Pasien
                        </a>
                    </div>
                )}
            </div>

            {/* Profile And Password Update */}
            {patient && <ProfileAndPasswordUpdate patient={patient} />}
        </AuthenticatedLayout>
    );
}
