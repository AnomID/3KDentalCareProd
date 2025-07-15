import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const user = auth.user;
    const isPatientDataAvailable =
        user && user.role === "patient" && user.patient && user.patient.id;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    let menuItems = [
        { name: "Home", href: "/" },
        { name: "Tentang Klinik", href: "/tentang" },
        { name: "Layanan", href: "/layanan" },
        { name: "Dokter", href: "/dokter" },
        { name: "Kontak", href: "/kontak" },
    ];

    if (auth.user) {
        switch (auth.user.role) {
            case "patient":
                menuItems = [
                    { name: "Janji Temu", href: "/appointments" },
                    // { name: "Riwayat", href: "/history" },
                    // { name: "Tagihan", href: "/billing" },
                    { name: "Dashboard", href: "/patient-dashboard" },
                    { name: "Detail Pasien", href: "/patient-profile" },
                ];

                break;
            case "doctor":
                menuItems = [
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "Pasien", href: "/patients" },
                    { name: "Jadwal", href: "/schedule" },
                    { name: "Rekam Medis", href: "/medical-records" },
                ];
                break;
            case "employee":
                menuItems = [
                    { name: "Dashboard", href: "/karyawan/dashboard" },
                    {
                        name: "Manajemen Janji Temu",
                        href: "/manage-appointments",
                    },
                    { name: "Manajemen Tagihan", href: "/manage-billing" },
                ];
                break;
        }
    }

    return (
        <nav
            className={`fixed top-0 left-0 w-full px-6 py-4 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-black1 shadow-lg backdrop-blur-md"
                    : "bg-transparent"
            }`}
        >
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold flex items-center">
                    <img
                        src="/images/3k-logo.png"
                        alt="Logo"
                        className="h-10"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-6">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="relative group transition duration-300 text-white hover:text-[#D2A63C]"
                        >
                            {item.name}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D2A63C] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}

                    {/* Tombol Login atau Logout */}
                    {auth.user ? (
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="relative group transition duration-300 text-white hover:text-[#D2A63C]"
                        >
                            Logout
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D2A63C] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="relative group transition duration-300 text-white hover:text-[#D2A63C]"
                        >
                            Login
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D2A63C] transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        {isOpen ? (
                            <X
                                size={32}
                                className="text-gold transition-transform transform rotate-90"
                            />
                        ) : (
                            <Menu
                                size={32}
                                className="text-white transition-transform transform scale-105"
                            />
                        )}
                    </div>
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 left-0 w-full h-screen bg-black bg-opacity-80 backdrop-blur-lg transform transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } flex flex-col items-center justify-center space-y-6 text-white text-xl`}
            >
                {/* Tombol Tutup (X) */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-5 right-6 text-3xl text-white hover:text-[#D2A63C] transition duration-300"
                >
                    &times;
                </button>

                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="py-2 px-6 hover:text-[#D2A63C] transition duration-300"
                    >
                        {item.name}
                    </Link>
                ))}

                {/* Tombol Login atau Logout di Mobile */}
                {auth.user ? (
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        onClick={() => setIsOpen(false)}
                        className="py-2 px-6 hover:text-[rgb(210,166,60)] transition duration-300"
                    >
                        Logout
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="py-2 px-6 hover:text-[#D2A63C] transition duration-300"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
