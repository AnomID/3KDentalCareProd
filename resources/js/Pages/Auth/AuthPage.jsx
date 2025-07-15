import { useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "@/Layouts/AppLayout";

export default function AuthPage() {
    const { auth, errors: pageErrors } = usePage().props;
    const [isLogin, setIsLogin] = useState(true);
    const [remember, setRemember] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: Cookies.get("email") || "",
        password: "",
        password_confirmation: "",
    });

    // Redirect jika sudah login
    useEffect(() => {
        if (auth?.user) {
            router.visit(route("dashboard"));
        }
    }, [auth]);

    useEffect(() => {
        if (remember) {
            Cookies.set("email", data.email, { expires: 30 });
        } else {
            Cookies.remove("email");
        }
    }, [data.email, remember]);

    useEffect(() => {
        if (isLogin && pageErrors.email) {
            toast.error(pageErrors.email, {
                position: "top-center",
                autoClose: 3000,
            });
        }
    }, [pageErrors, isLogin]);
    const submit = (e) => {
        e.preventDefault();
        post(route(isLogin ? "login" : "register"), {
            data: { ...data, remember },
            onSuccess: () => {
                toast.success(
                    isLogin ? "Login successful!" : "Registration successful!",
                    { position: "top-center", autoClose: 3000 }
                );
            },
            onError: (errors) => {
                Object.values(errors).forEach((error) =>
                    toast.error(error, {
                        position: "top-center",
                        autoClose: 3000,
                    })
                );
            },
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <AppLayout>
            <div className="flex min-h-screen items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg bg-[#1D1912] border border-[#BB8525] p-8 rounded-2xl shadow-xl text-white"
                >
                    {/* Title */}
                    <motion.h2
                        key={isLogin ? "login" : "register"}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center text-3xl font-bold text-[#EECD5C] mb-6"
                    >
                        {isLogin ? "Welcome Back!" : "Join Us"}
                    </motion.h2>

                    {/* Form */}
                    <motion.form
                        key={isLogin ? "loginForm" : "registerForm"}
                        initial={{ opacity: 0, x: isLogin ? 30 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        onSubmit={submit}
                        className="space-y-4"
                    >
                        {!isLogin && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className={`w-full px-4 py-3 rounded-lg bg-[#F3F3E6] text-black border ${
                                        errors.name
                                            ? "border-red-500"
                                            : "border-transparent"
                                    } focus:ring-2 focus:ring-[#D2A63C]`}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className={`w-full px-4 py-3 rounded-lg bg-[#F3F3E6] text-black border ${
                                    errors.email
                                        ? "border-red-500"
                                        : "border-transparent"
                                } focus:ring-2 focus:ring-[#D2A63C]`}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className={`w-full px-4 py-3 rounded-lg bg-[#F3F3E6] text-black border ${
                                    errors.password
                                        ? "border-red-500"
                                        : "border-transparent"
                                } focus:ring-2 focus:ring-[#D2A63C]`}
                                required
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Register */}
                        {!isLogin && (
                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className={`w-full px-4 py-3 rounded-lg bg-[#F3F3E6] text-black border ${
                                        errors.password_confirmation
                                            ? "border-red-500"
                                            : "border-transparent"
                                    } focus:ring-2 focus:ring-[#D2A63C]`}
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Remember Me untuk Login */}
                        {isLogin && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={remember}
                                    onChange={(e) =>
                                        setRemember(e.target.checked)
                                    }
                                    className="accent-[#D2A63C]"
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-sm text-gray-300"
                                >
                                    Remember Me
                                </label>
                            </div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={processing}
                            className="w-full py-3 rounded-lg bg-[#D2A63C] text-black font-semibold shadow-md hover:bg-[#BB8525] transition duration-300"
                        >
                            {processing
                                ? "Processing..."
                                : isLogin
                                ? "Login"
                                : "Register"}
                        </motion.button>
                    </motion.form>

                    {/* Switch Form */}
                    <p className="mt-4 text-center text-gray-400">
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#EECD5C] hover:underline ml-1"
                        >
                            {isLogin ? "Sign Up" : "Login"}
                        </button>
                    </p>
                </motion.div>
            </div>
        </AppLayout>
    );
}
