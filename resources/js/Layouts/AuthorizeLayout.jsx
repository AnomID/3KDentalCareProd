import React, { useState } from "react";
import SideBar from "@/Components/SideBar";
import SidebarDoctor from "@/Components/DoctorSidebar";
import AuthenticatedBottomNavbar from "@/Components/AuthenticatedBottomNavbar";
import { usePage } from "@inertiajs/react";
import DoctorSidebar from "@/Components/DoctorSidebar";

const AuthorizeLayout = ({ children }) => {
    const { auth } = usePage().props;
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Determine which sidebar to use based on the user role
    const renderSidebar = () => {
        if (auth.user.role === "doctor") {
            return (
                <DoctorSidebar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
            );
        } else if (auth.user.role === "employee") {
            return (
                <SideBar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
            );
        }

        // Default fallback
        return (
            <SideBar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
        );
    };

    // Determine page title based on user role
    const getPageTitle = () => {
        if (auth.user.role === "doctor") {
            return "Doctor";
        } else if (auth.user.role === "employee") {
            return "Employee";
        }

        return "Dashboard";
    };

    return (
        <div className="flex">
            {/* Sidebar - conditional rendering based on role */}
            {renderSidebar()}

            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-100 min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        {getPageTitle()}
                    </h1>
                </div>

                {children}
            </div>
            <AuthenticatedBottomNavbar />
        </div>
    );
};

export default AuthorizeLayout;
