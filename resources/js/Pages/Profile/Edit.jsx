import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";

export default function Edit({ mustVerifyEmail, status }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile Settings
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Button to Open Profile Modal */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <button
                            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            onClick={() => setIsProfileOpen(true)}
                        >
                            Update Account
                        </button>
                    </div>

                    {/* Button to Open Password Modal */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <button
                            className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            onClick={() => setIsPasswordOpen(true)}
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            <Transition appear show={isProfileOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => setIsProfileOpen(false)}
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
                            <Dialog.Title className="text-lg font-semibold">
                                Update Profile
                            </Dialog.Title>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                            <button
                                className="mt-4 w-full bg-gray-600 text-white py-2 rounded-md"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                Close
                            </button>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </Transition>

            {/* Password Modal */}
            <Transition appear show={isPasswordOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => setIsPasswordOpen(false)}
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
                            <Dialog.Title className="text-lg font-semibold">
                                Update Password
                            </Dialog.Title>
                            <UpdatePasswordForm />
                            <button
                                className="mt-4 w-full bg-gray-600 text-white py-2 rounded-md"
                                onClick={() => setIsPasswordOpen(false)}
                            >
                                Close
                            </button>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}
