// resources/js/Components/ui/SearchDropdown.jsx
import React, { useState, useEffect, useRef } from "react";

// Simple ChevronDown icon
const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
        />
    </svg>
);

// Simple X icon
const XMarkIcon = ({ className = "w-4 h-4" }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
        />
    </svg>
);

const SearchDropdown = ({
    value,
    onChange,
    onSearch,
    options = [],
    placeholder = "Cari...",
    disabled = false,
    loading = false,
    displayKey = "name",
    valueKey = "id",
    secondaryKey = null, // for showing additional info like code
    className = "",
    error = null,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Find selected option when value changes
    useEffect(() => {
        if (value && options.length > 0) {
            const found = options.find((option) => option[valueKey] === value);
            setSelectedOption(found || null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options, valueKey]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch && searchTerm.length > 0) {
                onSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(true);
            if (onSearch && searchTerm.length === 0) {
                onSearch(""); // Load initial options
            }
        }
    };

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (!isOpen) setIsOpen(true);
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        onChange(option[valueKey]);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = () => {
        setSelectedOption(null);
        onChange(null);
        setSearchTerm("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const displayValue = selectedOption
        ? `${selectedOption[displayKey]}${
              secondaryKey && selectedOption[secondaryKey]
                  ? ` (${selectedOption[secondaryKey]})`
                  : ""
          }`
        : "";

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? searchTerm : displayValue}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full px-3 py-2 pr-10 border rounded-md shadow-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${
                            disabled
                                ? "bg-gray-100 cursor-not-allowed"
                                : "cursor-pointer"
                        }
                        ${error ? "border-red-300" : "border-gray-300"}
                    `}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {selectedOption && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronDownIcon
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {loading ? (
                        <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            Mencari...
                        </div>
                    ) : options.length > 0 ? (
                        options.map((option, index) => (
                            <button
                                key={option[valueKey] || index}
                                type="button"
                                onClick={() => handleOptionSelect(option)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                        {option[displayKey]}
                                    </span>
                                    {secondaryKey && option[secondaryKey] && (
                                        <span className="text-sm text-gray-500">
                                            {option[secondaryKey]}
                                        </span>
                                    )}
                                </div>
                                {option.description && (
                                    <div className="text-sm text-gray-600 truncate mt-1">
                                        {option.description}
                                    </div>
                                )}
                            </button>
                        ))
                    ) : searchTerm.length > 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                            Tidak ada hasil untuk "{searchTerm}"
                        </div>
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                            Ketik untuk mencari...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
