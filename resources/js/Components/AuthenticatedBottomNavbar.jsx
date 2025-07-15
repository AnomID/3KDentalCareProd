import React from "react";
import { Link } from "@inertiajs/react";

const AuthenticatedBottomNavbar = ({ user }) => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-3   px-4">
            <div className="container mx-auto flex items-center justify-center">
                <div className="text-gray-600 text-sm">
                    &copy; {currentYear} 3KDentalCare. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default AuthenticatedBottomNavbar;
