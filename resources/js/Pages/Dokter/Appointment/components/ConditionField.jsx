import React from "react";

/**
 * Komponen untuk menampilkan dan mengedit kondisi medis
 * (seperti penyakit atau alergi) dengan checkbox dan textarea
 */
const ConditionField = ({
    label,
    fieldName,
    checked,
    note,
    onChange,
    icon = null,
}) => {
    return (
        <div className="mb-4">
            <div className="flex items-center mb-2">
                <input
                    type="checkbox"
                    id={`has_${fieldName}`}
                    name={`has_${fieldName}`}
                    checked={checked}
                    onChange={onChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                    htmlFor={`has_${fieldName}`}
                    className="ml-2 text-sm font-medium text-gray-700 flex items-center"
                >
                    {icon && <span className="mr-1">{icon}</span>}
                    {label}
                </label>
            </div>
            {checked && (
                <div className="ml-6">
                    <textarea
                        name={`${fieldName}_note`}
                        value={note || ""}
                        onChange={onChange}
                        rows="2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Catatan tentang ${label}`}
                    ></textarea>
                </div>
            )}
        </div>
    );
};

export default ConditionField;
