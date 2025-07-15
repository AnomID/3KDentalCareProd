import React, { useState } from "react";
import { Link } from "@inertiajs/react";

const SideBar = ({ isSidebarOpen, toggleSidebar }) => {
    const [isPatientOpen, setPatientOpen] = useState(false);
    const [isEmployeeOpen, setEmployeeOpen] = useState(false);
    const [isDoctorOpen, setDoctorOpen] = useState(false);
    const [isUserOpen, setUserOpen] = useState(false);
    const [isAppointmentOpen, setAppointmentOpen] = useState(false);
    const [isIcdOpen, setIcdOpen] = useState(false);

    const togglePatientDropdown = () => {
        setPatientOpen(!isPatientOpen);
    };
    const toggleEmployeeDropdown = () => {
        setEmployeeOpen(!isEmployeeOpen);
    };
    const toggleDoctorDropdown = () => {
        setDoctorOpen(!isDoctorOpen);
    };
    const toggleUserDropdown = () => {
        setUserOpen(!isUserOpen);
    };
    const toggleAppointmentDropdown = () => {
        setAppointmentOpen(!isAppointmentOpen);
    };
    const toggleIcdDropdown = () => {
        setIcdOpen(!isIcdOpen);
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
                    Employee Panel
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
                            href="/karyawan/dashboard"
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
                                    ? "max-h-64 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 translate-y-[-20px]"
                            }`}
                        >
                            <li>
                                <Link
                                    href={route("employee.appointments.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    All Appointments
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route(
                                        "employee.appointments.create-for-patient"
                                    )}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    Create Appointment
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("employee.appointments.today")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    Today's Appointments
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* Patient */}
                    <li>
                        <button
                            onClick={togglePatientDropdown}
                            className="flex items-center justify-between py-2 px-4 text-lg text-gray-300 hover:text-white w-full text-left"
                        >
                            <span
                                className={`transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Patients
                            </span>
                            <span
                                className={`transition-all duration-300 ease-in-out transform ${
                                    isPatientOpen ? "rotate-180" : "rotate-0"
                                }`}
                            >
                                ↓
                            </span>
                        </button>

                        {/* Dropdown Patient */}
                        <ul
                            className={`pl-6 mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
                                isPatientOpen
                                    ? "max-h-32 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 translate-y-[-20px]"
                            }`}
                        >
                            <li>
                                <Link
                                    href={route("patients.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    All Patients
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("guardians.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    All Guardians
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* Users */}
                    <li>
                        <button
                            onClick={toggleUserDropdown}
                            className="flex items-center justify-between py-2 px-4 text-lg text-gray-300 hover:text-white w-full text-left"
                        >
                            <span
                                className={`transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Users
                            </span>
                            <span
                                className={`transition-all duration-300 ease-in-out transform ${
                                    isUserOpen ? "rotate-180" : "rotate-0"
                                }`}
                            >
                                ↓
                            </span>
                        </button>

                        {/* Dropdown Users */}
                        <ul
                            className={`pl-6 mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
                                isUserOpen
                                    ? "max-h-64 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 translate-y-[-20px]"
                            }`}
                        >
                            <li>
                                <Link
                                    href={route("users.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    All Users
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href={route("employee.create")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    Add User
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* Employee */}
                    <li>
                        <button
                            onClick={toggleEmployeeDropdown}
                            className="flex items-center justify-between py-2 px-4 text-lg text-gray-300 hover:text-white w-full text-left"
                        >
                            <span
                                className={`transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Employees
                            </span>
                            <span
                                className={`transition-all duration-300 ease-in-out transform ${
                                    isEmployeeOpen ? "rotate-180" : "rotate-0"
                                }`}
                            >
                                ↓
                            </span>
                        </button>

                        {/* Dropdown Employee */}
                        <ul
                            className={`pl-6 mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
                                isEmployeeOpen
                                    ? "max-h-32 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 translate-y-[-20px]"
                            }`}
                        >
                            <li>
                                <Link
                                    href={route("employees.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    All Employees
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* Doctor */}
                    <li>
                        <button
                            onClick={toggleDoctorDropdown}
                            className="flex items-center justify-between py-2 px-4 text-lg text-gray-300 hover:text-white w-full text-left"
                        >
                            <span
                                className={`transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                Doctors
                            </span>
                            <span
                                className={`transition-all duration-300 ease-in-out transform ${
                                    isDoctorOpen ? "rotate-180" : "rotate-0"
                                }`}
                            >
                                ↓
                            </span>
                        </button>

                        {/* Dropdown Doctor */}
                        <ul
                            className={`pl-6 mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
                                isDoctorOpen
                                    ? "max-h-32 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 translate-y-[-20px]"
                            }`}
                        >
                            <li>
                                <Link
                                    href={route("doctors.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    All Doctors
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/schedules"
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    Schedules
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("schedule-exceptions.index")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    Schedule Exceptions
                                </Link>
                            </li>
                        </ul>
                    </li>
                    {/* ICD Links */}
                    <li>
                        <button
                            onClick={toggleIcdDropdown}
                            className="flex items-center justify-between py-2 px-4 text-lg text-gray-300 hover:text-white w-full text-left"
                        >
                            <span
                                className={`transition-all duration-300 ease-in-out ${
                                    isSidebarOpen
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 translate-x-[-100%]"
                                }`}
                            >
                                ICD Codes
                            </span>
                            <span
                                className={`transition-all duration-300 ease-in-out transform ${
                                    isIcdOpen ? "rotate-180" : "rotate-0"
                                }`}
                            >
                                ↓
                            </span>
                        </button>

                        {/* Dropdown ICD Links */}
                        <ul
                            className={`pl-6 mt-2 transition-all duration-300 ease-in-out overflow-hidden ${
                                isIcdOpen
                                    ? "max-h-32 opacity-100 translate-y-0"
                                    : "max-h-0 opacity-0 translate-y-[-20px]"
                            }`}
                        >
                            <li>
                                <Link
                                    href={route("icd.icd9cm")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    ICD-9 CM Codes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("icd.icd10-diagnoses")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    ICD-10 Diagnoses
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("icd.icd10-external-cause")}
                                    className="block py-2 px-4 text-lg text-gray-300 hover:text-white"
                                >
                                    ICD-10 External Causes
                                </Link>
                            </li>
                        </ul>
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

export default SideBar;
