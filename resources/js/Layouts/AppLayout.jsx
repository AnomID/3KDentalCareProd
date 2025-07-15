import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { Home, Users, CalendarClock, Activity, Star } from "lucide-react";
import Navbar from "@/Components/Navbar";
import BottomNavbar from "@/Components/BottomNavbar";

export default function AppLayout({ children }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#1D1912] text-white">
            {/* Navbar */}
            <Navbar />
            {/* Main Contain */}
            <main className="flex-1">{children}</main>
            {/* Bottom Navigation Mobile */}
            {isMobile && <BottomNavbar />}
        </div>
    );
}
