import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import BottomNavbar from "@/Components/BottomNavbar";
import Navbar from "@/Components/Navbar";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="min-h-screen bg-[#1D1912] text-[#F3F3E6]">
            {/* Navbar  */}
            <Navbar />
            {/* Main Content */}
            <main className="max-w-auto mx-auto pt-16 pb-16 ">{children}</main>
            {/* Bottom Navbar */}
            <BottomNavbar />
        </div>
    );
}
