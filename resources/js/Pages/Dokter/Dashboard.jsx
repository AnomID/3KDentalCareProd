import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import {
    CalendarDays,
    CheckCircle2,
    Users2,
    Clock3,
    AlarmClock,
} from "lucide-react";
import AuthorizeLayout from "@/Layouts/AuthorizeLayout";

/* ---------- Utility ---------- */
const primaryColor = "#4A90E2";

/* ----------  Atoms ---------- */
const Card = ({ children, className = "" }) => (
    <div
        className={
            "rounded-xl bg-white shadow-sm dark:bg-zinc-900 dark:shadow-zinc-800 transition-all " +
            className
        }
    >
        {children}
    </div>
);

const SectionHeading = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4">
        {Icon && (
            <Icon size={20} className="text-slate-500 dark:text-slate-400" />
        )}
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {title}
        </h2>
    </div>
);

/* ----------  DonutChart (inline-SVG, no lib) ---------- */
const DonutChart = ({ completed, total }) => {
    const radius = 30;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const progress = total ? (completed / total) * circumference : 0;

    return (
        <svg width="80" height="80" className="block mx-auto">
            <circle
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
            />
            <circle
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke={primaryColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
            />
            <text
                x="50%"
                y="52%"
                textAnchor="middle"
                className="text-xs fill-slate-700 dark:fill-slate-200"
            >
                {total ? Math.round((completed / total) * 100) : 0}%
            </text>
        </svg>
    );
};

/* ----------  Molecules ---------- */
const StatsCard = ({ icon: Icon, label, value, color }) => (
    <Card className="flex items-center gap-4 p-5 hover:shadow-md">
        <div
            className="flex items-center justify-center w-12 h-12 rounded-full text-white"
            style={{ backgroundColor: color }}
        >
            <Icon size={22} />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {value}
            </p>
        </div>
    </Card>
);

const AppointmentRow = ({ appointment }) => (
    <li className="flex items-center justify-between py-3 border-b last:border-none border-slate-100 dark:border-zinc-800">
        <span className="font-medium text-slate-700 dark:text-slate-200">
            {appointment.patient.name}
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-sm">
            {appointment.appointment_time}
        </span>
        <span
            className={
                "text-xs px-2 py-1 rounded-full capitalize " +
                (appointment.status === "completed"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300")
            }
        >
            {appointment.status}
        </span>
    </li>
);

const UpcomingRow = ({ item }) => (
    <li className="flex items-center justify-between py-3 border-b last:border-none border-slate-100 dark:border-zinc-800">
        <div>
            <p className="font-medium text-slate-700 dark:text-slate-200">
                {item.patient.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.appointment_date} • {item.appointment_time}
            </p>
        </div>
    </li>
);

/* ----------  Page Component ---------- */
const Dashboard = () => {
    const {
        doctor,
        todayAppointments,
        totalPatients,
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
    } = usePage().props;

    const [showStatsChart, setShowStatsChart] = useState(true);

    return (
        <>
            <Head title="Doctor Dashboard" />

            {/* Greeting */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                    Welcome back, Dr. {doctor.name}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Here’s an overview of your schedule and patient stats.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatsCard
                    icon={Users2}
                    label="Patients"
                    value={totalPatients}
                    color={primaryColor}
                />
                <StatsCard
                    icon={CalendarDays}
                    label="Appointments"
                    value={totalAppointments}
                    color="#16A34A"
                />
                <StatsCard
                    icon={CheckCircle2}
                    label="Completed"
                    value={completedAppointments}
                    color="#F59E0B"
                />

                {/* Mini-chart card */}
                <Card className="p-5 flex flex-col items-center justify-center">
                    <button
                        onClick={() => setShowStatsChart(!showStatsChart)}
                        className="self-end text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 focus:outline-none"
                        aria-label="Toggle chart visibility"
                    >
                        {showStatsChart ? "Hide" : "Show"}
                    </button>

                    {showStatsChart && (
                        <DonutChart
                            completed={completedAppointments}
                            total={totalAppointments}
                        />
                    )}
                    <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                        Completion rate
                    </p>
                </Card>
            </div>

            {/* Sections */}
            <div className="grid lg:grid-cols-3 gap-6 mt-8">
                {/* Today */}
                <Card className="p-6 lg:col-span-2">
                    <SectionHeading
                        icon={CalendarDays}
                        title="Today's Appointments"
                    />
                    {todayAppointments.length ? (
                        <ul>
                            {todayAppointments.map((a) => (
                                <AppointmentRow key={a.id} appointment={a} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            No appointments scheduled for today.
                        </p>
                    )}
                </Card>

                {/* Upcoming */}
                <Card className="p-6">
                    <SectionHeading
                        icon={Clock3}
                        title="Upcoming Appointments"
                    />
                    {upcomingAppointments.length ? (
                        <ul>
                            {upcomingAppointments.map((u) => (
                                <UpcomingRow key={u.id} item={u} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            No upcoming appointments.
                        </p>
                    )}
                </Card>
            </div>
        </>
    );
};

Dashboard.layout = (page) => <AuthorizeLayout>{page}</AuthorizeLayout>;

export default Dashboard;
