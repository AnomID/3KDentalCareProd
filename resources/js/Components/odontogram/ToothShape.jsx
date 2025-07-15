// File: resources/js/Components/odontogram/ToothShape.jsx
import React from "react";

const ToothShape = ({
    conditions = [],
    isSelected = false,
    selectedSurface = null,
    isDeciduousTooth = false,
    onClick,
    onSurfaceClick,
}) => {
    // Base tooth size (scaled for deciduous)
    const size = isDeciduousTooth ? 0.8 : 1;
    const width = 30 * size;
    const height = 40 * size;

    // Get unique conditions map for different surfaces
    const getConditionByCode = (code) => {
        return conditions.find((c) => c.condition_code === code);
    };

    // Surface paths (different shapes for different surfaces)
    const getSurfacePath = (surface) => {
        const w = width;
        const h = height;

        switch (surface) {
            case "M": // Mesial
                return `M 0,0 L ${w * 0.5},0 L ${w * 0.4},${h * 0.8} L 0,${
                    h * 0.9
                } Z`;
            case "O": // Occlusal
                return `M ${w * 0.3},${h * 0.1} L ${w * 0.7},${h * 0.1} L ${
                    w * 0.7
                },${h * 0.6} L ${w * 0.3},${h * 0.6} Z`;
            case "D": // Distal
                return `M ${w * 0.5},0 L ${w},0 L ${w},${h * 0.9} L ${
                    w * 0.6
                },${h * 0.8} Z`;
            case "V": // Vestibular
                return `M ${w * 0.1},${h * 0.1} L ${w * 0.9},${h * 0.1} L ${
                    w * 0.9
                },${h * 0.9} L ${w * 0.1},${h * 0.9} Z`;
            case "L": // Lingual/Palatal
                return `M ${w * 0.15},${h * 0.15} L ${w * 0.85},${h * 0.15} L ${
                    w * 0.85
                },${h * 0.85} L ${w * 0.15},${h * 0.85} Z`;
            default:
                return "";
        }
    };

    // Get color fill based on condition
    const getConditionFill = (condition) => {
        const code = condition.condition_code;

        // Color mapping based on the guide
        const colorMap = {
            amf: "#000000", // Black for amalgam
            cof: "#ffffff", // White with stripes for composite
            fis: "#ff69b4", // Pink for fissure sealant
            rct: "none", // No fill, just arrow
            nvt: "#ffcccc", // Light red for non-vital
            fmc: "#ffd700", // Gold for full metal crown
            poc: "#e6f3ff", // Light blue for porcelain crown
            non: "none", // No fill
        };

        return colorMap[code] || "#f0f0f0";
    };

    // Check if tooth should have stripes (composite filling)
    const hasStripes = conditions.some((c) => c.condition_code === "cof");

    // Check if tooth is non-vital (for arrow symbol)
    const hasRct = conditions.some((c) => c.condition_code === "rct");

    return (
        <g className={`tooth ${isSelected ? "tooth-selected" : ""}`}>
            {/* Tooth outline */}
            <path
                d={`M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z`}
                fill="white"
                stroke="#333"
                strokeWidth="1"
                onClick={onClick}
                className="cursor-pointer"
            />

            {/* Surface areas (only for posterior teeth - premolars and molars) */}
            {/* Only show 5 surfaces for premolars and molars, 4 for others */}
            {["M", "O", "D", "V", "L"].map((surface) => {
                const condition = getConditionByCode(surface);
                const isSelectedSurface = selectedSurface === surface;

                return (
                    <g key={surface}>
                        <path
                            d={getSurfacePath(surface)}
                            fill={
                                condition
                                    ? getConditionFill(condition)
                                    : "transparent"
                            }
                            stroke={
                                isSelectedSurface ? "#2563eb" : "transparent"
                            }
                            strokeWidth={isSelectedSurface ? "2" : "0"}
                            onClick={() => onSurfaceClick(surface)}
                            className="surface cursor-pointer hover:stroke-blue-300"
                        />

                        {/* Special patterns */}
                        {condition && condition.condition_code === "cof" && (
                            <g>
                                {/* Stripes pattern for composite */}
                                <defs>
                                    <pattern
                                        id={`stripes-${surface}`}
                                        patternUnits="userSpaceOnUse"
                                        width="4"
                                        height="4"
                                    >
                                        <path
                                            d="M 0,4 L 4,0"
                                            stroke="#999"
                                            strokeWidth="0.5"
                                        />
                                    </pattern>
                                </defs>
                                <path
                                    d={getSurfacePath(surface)}
                                    fill={`url(#stripes-${surface})`}
                                />
                            </g>
                        )}
                    </g>
                );
            })}

            {/* Special symbols */}
            {hasRct && (
                <g>
                    {/* Arrow pointing down for RCT */}
                    <path
                        d={`M ${width / 2},${-10} L ${width / 2 - 5},${-5} L ${
                            width / 2 + 5
                        },${-5} Z`}
                        fill="red"
                    />
                </g>
            )}

            {/* Missing tooth (X pattern) */}
            {conditions.some((c) => c.condition_code === "mis") && (
                <g stroke="red" strokeWidth="2">
                    <line x1="0" y1="0" x2={width} y2={height} />
                    <line x1={width} y1="0" x2="0" y2={height} />
                </g>
            )}
        </g>
    );
};

export default ToothShape;
