import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PatientProfileShow({ patient }) {
    return (
        <AuthenticatedLayout>
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-[#1D1D22] via-[#3C2A25] to-[#4F3623] py-8 px-4">
                {/* Card for Profile */}
                <div className="w-full max-w-4xl bg-[#D5CABB] p-10 rounded-3xl shadow-2xl">
                    {/* Profile Title */}
                    <h1 className="text-[#1D1D22] text-4xl font-extrabold mb-6 text-center">
                        Your Profile
                    </h1>

                    {/* Profile Content */}
                    <div className="space-y-6">
                        {[
                            { label: "Name", value: patient.name },
                            {
                                label: "Birth Place",
                                value: patient.birth_place,
                            },
                            { label: "Birth Date", value: patient.birth_date },
                            {
                                label: "Citizenship",
                                value: patient.citizenship,
                            },
                            { label: "Gender", value: patient.gender },
                            { label: "Occupation", value: patient.occupation },
                            { label: "Address", value: patient.address },
                            { label: "Phone Number", value: patient.phone },
                            { label: "Blood Type", value: patient.blood_type },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex justify-between items-center border-b border-[#C3A764] py-3"
                            >
                                <label className="text-[#1D1D22] text-lg font-medium">
                                    {label}:
                                </label>
                                <p className="text-[#1D1D22] text-lg">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
