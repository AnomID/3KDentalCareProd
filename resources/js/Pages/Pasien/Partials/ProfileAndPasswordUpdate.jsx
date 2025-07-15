import { useState, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm, usePage } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

export default function ProfileAndPasswordUpdate() {
    const user = usePage().props.auth.user;
    const [isOpen, setIsOpen] = useState(false);
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <div className="max-w-6xl mx-auto mt-5 bg-[#2A2A2A] p-6 rounded-lg shadow-md text-white">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                Profil Akun
            </h2>

            {/* Informasi Profil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-300">Nama:</p>
                    <p className="mt-1 p-2 rounded-md bg-gray-800 border border-gray-600">
                        {user.name}
                    </p>
                </div>
                <div>
                    <p className="font-semibold text-gray-300">Email:</p>
                    <p className="mt-1 p-2 rounded-md bg-gray-800 border border-gray-600">
                        {user.email}
                    </p>
                </div>
            </div>

            {/* Tombol Ubah Password */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Ubah Password
                </button>
            </div>

            {/* Modal Update Password */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => setIsOpen(false)}
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-lg bg-gray-800 p-6 rounded-xl shadow-xl text-white">
                            <Dialog.Title className="text-xl font-bold border-b pb-3 mb-4">
                                Update Password
                            </Dialog.Title>
                            <form
                                onSubmit={updatePassword}
                                className="space-y-6"
                            >
                                <div>
                                    <InputLabel
                                        htmlFor="current_password"
                                        value="Current Password"
                                        className="text-gray-300"
                                    />
                                    <TextInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(e) =>
                                            setData(
                                                "current_password",
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                        className="mt-1 block w-full bg-gray-800 text-white border-gray-600 focus:ring focus:ring-blue-500"
                                        autoComplete="current-password"
                                    />
                                    <InputError
                                        message={errors.current_password}
                                        className="text-red-400 mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="New Password"
                                        className="text-gray-300"
                                    />
                                    <TextInput
                                        id="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        type="password"
                                        className="mt-1 block w-full bg-gray-800 text-white border-gray-600 focus:ring focus:ring-blue-500"
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="text-red-400 mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                        className="text-gray-300"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        type="password"
                                        className="mt-1 block w-full bg-gray-800 text-white border-gray-600 focus:ring focus:ring-blue-500"
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="text-red-400 mt-2"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <PrimaryButton
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Save
                                    </PrimaryButton>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                                    >
                                        Close
                                    </button>
                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out duration-200"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out duration-200"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-400">
                                            Saved successfully.
                                        </p>
                                    </Transition>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
