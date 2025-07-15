import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function PatientProfileForm({ patient }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        birth_place: "",
        birth_date: "",
        citizenship: "Indonesia",
        gender: "Male",
        occupation: "",
        address: "",
        phone: "",
        blood_type: "A",
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [canNext, setCanNext] = useState(false);

    const steps = [
        {
            label: "Personal Information",
            fields: ["name", "birth_place", "birth_date"],
        },
        { label: "Details", fields: ["citizenship", "gender", "occupation"] },
        {
            label: "Contact Information",
            fields: ["address", "phone", "blood_type"],
        },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const checkCanNext = () => {
        const requiredFields = steps[currentStep].fields;
        const allFilled = requiredFields.every((field) => {
            return data[field] && data[field].trim() !== "";
        });
        setCanNext(allFilled);
    };

    const nextStep = () => {
        if (canNext && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (patient) {
            console.error("You already have a profile.");
            return;
        }

        post("/patient-store", data);
    };

    useEffect(() => {
        checkCanNext();
    }, [data, currentStep]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-[#1D1D22] via-[#3C2A25] to-[#4F3623] py-8 px-4">
            {/* Step Indicators */}
            <div className="w-full max-w-3xl mx-auto mb-8 flex justify-center space-x-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold 
                            ${
                                currentStep === index
                                    ? "bg-[#F8D465] scale-110"
                                    : "bg-[#C3A764]"
                            }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {index + 1}
                    </motion.div>
                ))}
            </div>

            {/* Form Container */}
            <div className="bg-[#D5CABB] p-8 w-full max-w-4xl rounded-lg shadow-lg">
                <h1 className="text-[#1D1D22] text-2xl mb-4 text-center font-semibold">
                    {steps[currentStep].label}
                </h1>
                <form onSubmit={handleSubmit}>
                    <motion.div
                        key={currentStep}
                        initial={{
                            opacity: 0,
                            x: currentStep === 0 ? 40 : -40,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: currentStep === 0 ? -40 : 40 }}
                        transition={{ duration: 0.5 }}
                    >
                        {steps[currentStep].fields.map((field) => (
                            <div key={field} className="mb-6">
                                <label
                                    htmlFor={field}
                                    className="block text-[#BB8525] font-medium mb-2"
                                >
                                    {field.replace("_", " ").toUpperCase()}
                                </label>

                                {/* Dropdown for Gender */}
                                {field === "gender" ? (
                                    <select
                                        id={field}
                                        name={field}
                                        value={data[field]}
                                        onChange={handleChange}
                                        className="w-full p-3 mt-2 bg-[#282828] text-white border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F8D465]"
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                ) : null}

                                {/* Dropdown for Blood Type */}
                                {field === "blood_type" ? (
                                    <select
                                        id={field}
                                        name={field}
                                        value={data[field]}
                                        onChange={handleChange}
                                        className="w-full p-3 mt-2 bg-[#282828] text-white border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F8D465]"
                                        required
                                    >
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                ) : null}

                                {/* Other fields like text inputs */}
                                {field !== "gender" &&
                                    field !== "blood_type" && (
                                        <input
                                            type={
                                                field === "birth_date"
                                                    ? "date"
                                                    : "text"
                                            }
                                            id={field}
                                            name={field}
                                            value={data[field]}
                                            onChange={handleChange}
                                            className="w-full p-3 mt-2 bg-[#282828] text-white border border-[#444444] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F8D465]"
                                            required
                                        />
                                    )}

                                {errors[field] && (
                                    <div className="text-red-500 text-sm mt-2">
                                        {errors[field]}
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>

                    <div className="text-red-500 text-sm mt-0">
                        *Your Data Can Only Be Edited In The Clinic, Be Careful!
                        <tr>*Fill Data Form for Next</tr>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={prevStep}
                            className="bg-[#BB8525] text-white py-2 px-4 rounded-md"
                            disabled={currentStep === 0}
                        >
                            Previous
                        </button>

                        {currentStep < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className={`py-2 px-4 rounded-md ${
                                    canNext
                                        ? "bg-[#F8D465] text-white"
                                        : "bg-[#C3A764] text-white cursor-not-allowed"
                                }`}
                                disabled={!canNext}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="bg-[#BB8525] text-white py-2 px-4 rounded-md"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="animate-spin">
                                        Loading...
                                    </span>
                                ) : (
                                    "Save Profile"
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
