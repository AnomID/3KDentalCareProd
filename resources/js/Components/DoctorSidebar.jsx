import React, { useState } from "react";
import { Link } from "@inertiajs/react";

const DoctorSidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const [isAppointmentOpen, setAppointmentOpen] = useState(false);
    const [isMedicalOpen, setMedicalOpen] = useState(false);

    const toggleAppointmentDropdown = () => {
        setAppointmentOpen(!isAppointmentOpen);
    };

    const toggleMedicalDropdown = () => {
        setMedicalOpen(!isMedicalOpen);
    };

    return (
        <div
            className={`${
                isSidebarOpen ? "w-64" : "w-16"
            } bg-gray-800 text-white min-h-screen transition-all duration-300 ease-in-out relative`}
        >
            {/* Sidebar Header */}
            <div className="p-4 text-center font-bold text-xl">
                <span
                    className={`block transition-all duration-300 ease-in-out ${
                        isSidebarOpen
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-[-100%]"
                    }`}
                >
                    Doctor Panel
                </span>
            </div>

            <button
                onClick={toggleSidebar}
                className="absolute top-4 left-4 text-white text-2xl"
            >
                {isSidebarOpen ? "←" : "→"}
            </button>

            {/* Nav Link */}
            <nav className="mt-10">
                <ul>
                    {/* Dashboard */}
                    <li>
                        <Link
                            href={route("doctor.dashboard")}
                            className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                        >
                            <span
                                className={`block transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Dashboard
                            </span>
                        </Link>
                    </li>

                    {/* Appointments */}
                    <li>
                        <button
                            onClick={toggleAppointmentDropdown}
                            className="flex items-center justify-between py-2 px-4 text-lg text-gray-300 hover:text-white w-full text-left"
                        >
                            <span
                                className={`transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Appointments
                            </span>
                            <span
                                className={`transition-all duration-300 ease-in-out transform ${
                                    isAppointmentOpen
                                        ? "rotate-180"
                                        : "rotate-0"
                                }`}
                            >
                                ↓
                            </span>
                        </button>

                        {/* Dropdown Appointments */}
                        <ul
                            className={`pl-6 mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
                                isAppointmentOpen
                                    ? "max-h-48 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 translate-y-[-20px]"
                            }`}
                        >
                            <li>
                                <Link
                                    href={route("doctor.appointments.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    All Appointments
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("doctor.appointments.today")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    Today's Appointments
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* NEW: Patients */}
                    <li>
                        <Link
                            href={route("doctor.patients.index")}
                            className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                        >
                            <span
                                className={`block transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Patients
                            </span>
                        </Link>
                    </li>

                    {/* Logout */}
                    <li>
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                        >
                            <span
                                className={`block transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Logout
                            </span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default DoctorSidebar;
