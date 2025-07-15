import { Link, usePage } from "@inertiajs/react";
import {
    Home,
    Users,
    LogIn,
    Briefcase,
    Star,
    LayoutDashboard,
    CalendarCheck,
    ClipboardList,
    CreditCard,
    User,
    Clipboard,
    Calendar,
} from "lucide-react";

export default function BottomNavbar() {
    const { auth } = usePage().props;
    const user = auth.user;
    const role = user ? user.role : "none";

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#1D1D22] backdrop-blur-md border-t border-[#F8D465] shadow-lg py-3 flex justify-around z-50">
            {/* Navbar for Non-Logged-in Users */}
            {!user && (
                <>
                    <NavItem href="/" icon={Home} label="Home" />
                    <NavItem href="/#" icon={Users} label="Doctors" />
                    <NavItem href="/login" icon={LogIn} label="Login" />
                    <NavItem href="/#" icon={Briefcase} label="Services" />
                    <NavItem href="/#" icon={Star} label="Testimonials" />
                </>
            )}

            {/* Navbar for Patients */}
            {role === "patient" && (
                <>
                    <NavItem
                        href="/patient-dashboard"
                        icon={Home}
                        label="Dashboard"
                    />
                    <NavItem
                        href="/appointments"
                        icon={CalendarCheck}
                        label="Appointments"
                    />
                    {/* <NavItem
                        href="/history"
                        icon={ClipboardList}
                        label="History"
                    /> */}
                    {/* <NavItem
                        href="/billing"
                        icon={CreditCard}
                        label="Billing"
                    /> */}
                    <NavItem
                        href={route("patient.profile")}
                        icon={User}
                        label="Profile"
                    />
                </>
            )}

            {/* Navbar for Employees */}
            {role === "employee" && (
                <>
                    <NavItem
                        href="/employee-dashboard"
                        icon={LayoutDashboard}
                        label="Dashboard"
                    />
                    <NavItem
                        href="/schedules"
                        icon={Calendar}
                        label="Manage Schedule"
                    />
                    <NavItem href="/patients" icon={Users} label="Patients" />
                    <NavItem href="/doctors" icon={Clipboard} label="Doctors" />
                    <NavItem href="/employees" icon={Users} label="Employees" />
                    <NavItem
                        href="/appointments"
                        icon={CalendarCheck}
                        label="Appointments"
                    />
                </>
            )}
        </div>
    );
}

function NavItem({ href, icon: Icon, label }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center text-[#F8D465] hover:text-[#C3A764] transition duration-300"
        >
            <div className="p-2 rounded-full bg-white/10 hover:bg-[#F8D465]/20 transition duration-300 shadow-md">
                <Icon size={22} className="text-current" />
            </div>
            <span className="text-xs mt-1">{label}</span>
        </Link>
    );
}
