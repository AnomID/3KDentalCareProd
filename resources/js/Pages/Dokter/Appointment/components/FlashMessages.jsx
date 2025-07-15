import React from "react";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const FlashMessages = ({ flash }) => {
    if (!flash || Object.keys(flash).length === 0) return null;

    return (
        <>
            {flash.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
                    <div className="flex items-center">
                        <CheckCircle size={18} className="mr-2" />
                        <p>{flash.success}</p>
                    </div>
                </div>
            )}

            {flash.error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                    <div className="flex items-center">
                        <AlertCircle size={18} className="mr-2" />
                        <p>{flash.error}</p>
                    </div>
                </div>
            )}

            {flash.info && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-lg">
                    <div className="flex items-center">
                        <Info size={18} className="mr-2" />
                        <p>{flash.info}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default FlashMessages;
