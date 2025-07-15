import React, { useRef, useEffect, useState } from "react";
import {
    ODONTOGRAM_MODE,
    MODE_COLORS,
    DEFAULT_TEETH_NUMBERS,
    TOOTH_SURFACES,
} from "./OdontogramConstants";
import { RefreshCw } from "lucide-react";

const OdontogramCanvas = ({
    data,
    activeMode,
    onChange,
    isLoading,
    canEdit = true,
    width = 900,
    height = 420,
}) => {
    const canvasRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [hoveredTooth, setHoveredTooth] = useState(null);
    const [teethCoordinates, setTeethCoordinates] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedBridgeStart, setSelectedBridgeStart] = useState(null);

    // Store canvas context in a ref for performance
    const ctxRef = useRef(null);
    const canvasScale = useRef(1);

    // Store background image in ref for faster redrawing
    const backgroundImageRef = useRef(null);

    // Define center teeth (incisors and canines)
    const CENTER_TEETH = [
        "11",
        "12",
        "13",
        "21",
        "22",
        "23",
        "51",
        "52",
        "53",
        "61",
        "62",
        "63",
        "71",
        "72",
        "73",
        "81",
        "82",
        "83",
        "31",
        "32",
        "33",
        "41",
        "42",
        "43",
    ];

    // Initialize canvas when component mounts
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.id = "odontogram"; // Add id for download functionality

            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext("2d");
            ctxRef.current = ctx;
            canvasScale.current = 1;

            // Draw initial odontogram template
            drawOdontogramBackground(ctx);
        }
    }, [width, height]);

    // Effect to redraw when data changes
    useEffect(() => {
        if (ctxRef.current && isInitialized) {
            redrawOdontogram();
        }
    }, [data, isInitialized]);

    // Effect to update hover effects
    useEffect(() => {
        if (ctxRef.current && isInitialized) {
            redrawOdontogram();
            if (hoveredTooth) {
                drawHoverEffect(ctxRef.current, hoveredTooth);
            }
        }
    }, [hoveredTooth, mousePosition, activeMode]);

    // Helper function to draw the odontogram background
    const drawOdontogramBackground = (ctx) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const pt = 50, // padding top
            pb = 20, // padding bottom
            gap_per = 10, // gap between teeth
            gap_bag = 30; // gap between sections

        // Calculate box size based on available space
        const totalTeethWidth = 16; // 16 teeth per row
        const totalGaps = 15 * gap_per + gap_bag; // 15 gaps between teeth + 1 section gap
        const availableWidth = canvasWidth - totalGaps;
        const bigBoxSize = availableWidth / totalTeethWidth;
        const smallBoxSize = bigBoxSize / 2;

        // Calculate starting position to center the odontogram
        const totalOdontogramWidth = 16 * bigBoxSize + 15 * gap_per + gap_bag;
        const pl = (canvasWidth - totalOdontogramWidth) / 2; // center horizontally

        // Use numbers from DEFAULT_TEETH_NUMBERS
        const numbers = [...DEFAULT_TEETH_NUMBERS];

        // Temporary storage for teeth coordinates
        const teethCoords = {};

        // Draw each tooth
        let sec = 0;
        for (let y = 0; y < 4; y++) {
            sec = 0;
            for (let x = 0; x < 16; x++) {
                if (x % 8 === 0 && x !== 0) sec++;

                // Skip placeholders for baby teeth
                if (y % 3 !== 0 && (x < 8 ? (x % 8) - 2 <= 0 : x % 8 >= 5))
                    continue;

                const xpos = x * bigBoxSize + pl + x * gap_per + sec * gap_bag;
                const ypos = y * bigBoxSize + pt + pt * y;

                // Draw the big box (outline of the tooth)
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#555";
                ctx.rect(xpos, ypos, bigBoxSize, bigBoxSize);
                ctx.stroke();

                // Get tooth number for this position
                const toothNumber = numbers.shift();

                // Draw appropriate tooth shape based on position and tooth number
                if (CENTER_TEETH.includes(toothNumber)) {
                    drawCenterTooth(
                        ctx,
                        toothNumber,
                        bigBoxSize,
                        smallBoxSize,
                        xpos,
                        ypos
                    );
                } else {
                    drawSideTooth(
                        ctx,
                        toothNumber,
                        bigBoxSize,
                        smallBoxSize,
                        xpos,
                        ypos
                    );
                }

                // Store tooth coordinates for later use
                const x1 = xpos;
                const y1 = ypos;
                const x2 = xpos + bigBoxSize;
                const y2 = ypos + bigBoxSize;
                const cx = xpos + bigBoxSize / 2;
                const cy = ypos + bigBoxSize / 2;

                teethCoords[toothNumber] = {
                    num: toothNumber,
                    bigBoxSize,
                    smallBoxSize,
                    x1,
                    y1,
                    x2,
                    y2,
                    cx,
                    cy,
                    // Store specific regions of the tooth
                    top: calculateRegion("top", x1, y1, x2, y2, smallBoxSize),
                    right: calculateRegion(
                        "right",
                        x1,
                        y1,
                        x2,
                        y2,
                        smallBoxSize
                    ),
                    bottom: calculateRegion(
                        "bottom",
                        x1,
                        y1,
                        x2,
                        y2,
                        smallBoxSize
                    ),
                    left: calculateRegion("left", x1, y1, x2, y2, smallBoxSize),
                    middle: calculateRegion(
                        "middle",
                        x1,
                        y1,
                        x2,
                        y2,
                        smallBoxSize
                    ),
                };
            }
        }

        // Store teeth coordinates
        setTeethCoordinates(teethCoords);
        setIsInitialized(true);

        // Save the background for faster redrawing
        backgroundImageRef.current = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );
    };

    // Helper to calculate region coordinates based on type
    const calculateRegion = (type, x1, y1, x2, y2, smallBoxSize) => {
        // Different tooth regions based on quadrants
        switch (type) {
            case "top":
                return {
                    tl: { x: x1, y: y1 },
                    tr: { x: x2, y: y1 },
                    br: { x: x2 - smallBoxSize / 2, y: y1 + smallBoxSize / 2 },
                    bl: { x: x1 + smallBoxSize / 2, y: y1 + smallBoxSize / 2 },
                };
            case "right":
                return {
                    tl: { x: x2 - smallBoxSize / 2, y: y1 + smallBoxSize / 2 },
                    tr: { x: x2, y: y1 },
                    br: { x: x2, y: y2 },
                    bl: { x: x2 - smallBoxSize / 2, y: y2 - smallBoxSize / 2 },
                };
            case "bottom":
                return {
                    tl: { x: x1 + smallBoxSize / 2, y: y2 - smallBoxSize / 2 },
                    tr: { x: x2 - smallBoxSize / 2, y: y2 - smallBoxSize / 2 },
                    br: { x: x2, y: y2 },
                    bl: { x: x1, y: y2 },
                };
            case "left":
                return {
                    tl: { x: x1, y: y1 },
                    tr: { x: x1 + smallBoxSize / 2, y: y1 + smallBoxSize / 2 },
                    br: { x: x1 + smallBoxSize / 2, y: y2 - smallBoxSize / 2 },
                    bl: { x: x1, y: y2 },
                };
            case "middle":
                return {
                    tl: { x: x1 + smallBoxSize / 2, y: y1 + smallBoxSize / 2 },
                    tr: { x: x2 - smallBoxSize / 2, y: y1 + smallBoxSize / 2 },
                    br: { x: x2 - smallBoxSize / 2, y: y2 - smallBoxSize / 2 },
                    bl: { x: x1 + smallBoxSize / 2, y: y2 - smallBoxSize / 2 },
                };
            default:
                return {
                    tl: { x: 0, y: 0 },
                    tr: { x: 0, y: 0 },
                    br: { x: 0, y: 0 },
                    bl: { x: 0, y: 0 },
                };
        }
    };

    // Draw side tooth (molar/premolar)
    const drawSideTooth = (
        ctx,
        toothNumber,
        bigBoxSize,
        smallBoxSize,
        xpos,
        ypos
    ) => {
        // Small Box (center square)
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#555";
        ctx.rect(
            xpos + smallBoxSize / 2,
            ypos + smallBoxSize / 2,
            smallBoxSize,
            smallBoxSize
        );
        ctx.stroke();

        // Lines connecting to corners
        // Top Left diagonal
        ctx.beginPath();
        ctx.moveTo(xpos, ypos);
        ctx.lineTo(xpos + smallBoxSize / 2, ypos + smallBoxSize / 2);
        ctx.stroke();

        // Top Right diagonal
        ctx.beginPath();
        ctx.moveTo(xpos + bigBoxSize, ypos);
        ctx.lineTo(
            xpos + bigBoxSize - smallBoxSize / 2,
            ypos + smallBoxSize / 2
        );
        ctx.stroke();

        // Bottom Left diagonal
        ctx.beginPath();
        ctx.moveTo(xpos, ypos + bigBoxSize);
        ctx.lineTo(
            xpos + smallBoxSize / 2,
            ypos + bigBoxSize - smallBoxSize / 2
        );
        ctx.stroke();

        // Bottom Right diagonal
        ctx.beginPath();
        ctx.moveTo(xpos + bigBoxSize, ypos + bigBoxSize);
        ctx.lineTo(
            xpos + bigBoxSize - smallBoxSize / 2,
            ypos + bigBoxSize - smallBoxSize / 2
        );
        ctx.stroke();

        // Draw tooth number
        ctx.font = "12px Arial";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "center";
        ctx.fillText(
            toothNumber,
            xpos + bigBoxSize / 2,
            ypos + bigBoxSize * 1.4
        );
    };

    // Draw center tooth (incisor/canine) - IMPROVED VERSION
    const drawCenterTooth = (
        ctx,
        toothNumber,
        bigBoxSize,
        smallBoxSize,
        xpos,
        ypos
    ) => {
        // Calculate center positions
        const centerX = xpos + bigBoxSize / 2;
        const centerY = ypos + bigBoxSize / 2;
        const offset = 3;

        // Draw horizontal line connecting left and right sides
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#555";
        ctx.moveTo(xpos + smallBoxSize / 2 + offset, centerY);
        ctx.lineTo(xpos + bigBoxSize - smallBoxSize / 2 - offset, centerY);
        ctx.stroke();

        // Lines connecting to corners for central teeth
        // Top Left diagonal
        ctx.beginPath();
        ctx.moveTo(xpos, ypos);
        ctx.lineTo(xpos + smallBoxSize / 2 + offset, centerY);
        ctx.stroke();

        // Top Right diagonal
        ctx.beginPath();
        ctx.moveTo(xpos + bigBoxSize, ypos);
        ctx.lineTo(xpos + bigBoxSize - smallBoxSize / 2 - offset, centerY);
        ctx.stroke();

        // Bottom Left diagonal
        ctx.beginPath();
        ctx.moveTo(xpos, ypos + bigBoxSize);
        ctx.lineTo(xpos + smallBoxSize / 2 + offset, centerY);
        ctx.stroke();

        // Bottom Right diagonal
        ctx.beginPath();
        ctx.moveTo(xpos + bigBoxSize, ypos + bigBoxSize);
        ctx.lineTo(xpos + bigBoxSize - smallBoxSize / 2 - offset, centerY);
        ctx.stroke();

        // Draw tooth number
        ctx.font = "12px Arial";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "center";
        ctx.fillText(
            toothNumber,
            xpos + bigBoxSize / 2,
            ypos + bigBoxSize * 1.4
        );
    };

    // Draw hover effect on tooth or region
    const drawHoverEffect = (ctx, toothInfo) => {
        if (!toothInfo) return;

        const { region, tooth } = toothInfo;

        // Get tooth data from coordinates
        const toothData = teethCoordinates[tooth];
        if (!toothData) return;

        // If hovering over a specific region
        if (region && toothData[region]) {
            const regionData = toothData[region];

            // Fill region with semi-transparent color
            ctx.beginPath();
            ctx.moveTo(regionData.tl.x, regionData.tl.y);
            ctx.lineTo(regionData.tr.x, regionData.tr.y);
            ctx.lineTo(regionData.br.x, regionData.br.y);
            ctx.lineTo(regionData.bl.x, regionData.bl.y);
            ctx.closePath();

            ctx.fillStyle = "rgba(100, 149, 237, 0.3)"; // Light blue semi-transparent
            ctx.fill();
        } else {
            // Hover effect for entire tooth
            ctx.beginPath();
            ctx.rect(
                toothData.x1,
                toothData.y1,
                toothData.bigBoxSize,
                toothData.bigBoxSize
            );
            ctx.fillStyle = "rgba(100, 149, 237, 0.2)"; // Lighter blue for whole tooth
            ctx.fill();
        }

        // If in bridge mode and we have a bridge start, draw a connecting line
        if (activeMode === ODONTOGRAM_MODE.BRIDGE && selectedBridgeStart) {
            const startToothData = teethCoordinates[selectedBridgeStart];
            if (startToothData && toothData) {
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "rgba(100, 149, 237, 0.6)";
                ctx.moveTo(startToothData.cx, startToothData.y1 - 5);
                ctx.lineTo(toothData.cx, toothData.y1 - 5);
                ctx.stroke();
            }
        }
    };

    // Redraw the odontogram with all conditions
    const redrawOdontogram = () => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas || !backgroundImageRef.current) return;

        // Clear canvas and restore background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(backgroundImageRef.current, 0, 0);

        // Draw all tooth conditions
        if (data.conditions) {
            data.conditions.forEach((condition) => {
                drawToothCondition(ctx, condition);
            });
        }

        // Draw all bridges
        if (data.bridges) {
            data.bridges.forEach((bridge) => {
                drawBridge(ctx, bridge);
            });
        }

        // Draw all indicators
        if (data.indicators) {
            data.indicators.forEach((indicator) => {
                drawIndicator(ctx, indicator);
            });
        }
    };

    // Draw tooth condition
    const drawToothCondition = (ctx, condition) => {
        // Parse tooth number and surface from condition.pos (e.g., "18-R")
        let toothNumber, surface;
        if (condition.pos && condition.pos.includes("-")) {
            [toothNumber, surface] = condition.pos.split("-");
        } else {
            toothNumber = condition.pos || condition.tooth_number;
            surface = condition.surface;
        }

        const toothData = teethCoordinates[toothNumber];
        if (!toothData) return;

        const colorData =
            MODE_COLORS[condition.code] || MODE_COLORS[ODONTOGRAM_MODE.DEFAULT];

        // Draw based on condition type
        if (surface) {
            // Surface-specific condition
            const regionKey = getSurfaceRegionKey(surface);
            const regionData = toothData[regionKey];

            if (regionData) {
                drawConditionInRegion(
                    ctx,
                    regionData,
                    condition.code,
                    colorData
                );
            }
        } else {
            // Whole tooth condition
            drawWholeToothCondition(ctx, toothData, condition.code, colorData);
        }
    };

    // Map surface code to region key
    const getSurfaceRegionKey = (surface) => {
        const surfaceMap = {
            T: "top",
            R: "right",
            B: "bottom",
            L: "left",
            M: "middle",
        };
        return surfaceMap[surface] || "middle";
    };

    // Draw condition in a specific region
    const drawConditionInRegion = (
        ctx,
        regionData,
        conditionCode,
        colorData
    ) => {
        ctx.beginPath();
        ctx.moveTo(regionData.tl.x, regionData.tl.y);
        ctx.lineTo(regionData.tr.x, regionData.tr.y);
        ctx.lineTo(regionData.br.x, regionData.br.y);
        ctx.lineTo(regionData.bl.x, regionData.bl.y);
        ctx.closePath();

        // Apply fill style if needed
        if (colorData.fill && colorData.fill !== "transparent") {
            ctx.fillStyle = colorData.fill;
            ctx.fill();
        }

        // Apply stroke if needed
        if (colorData.stroke) {
            ctx.strokeStyle = colorData.stroke;
            ctx.lineWidth = colorData.lineWidth || 2;
            ctx.stroke();
        }

        // If it's a pattern (like POC)
        if (colorData.pattern === "lines") {
            drawLinesPattern(ctx, regionData);
        }

        // If it's text-based
        if (colorData.text) {
            const cx = (regionData.tl.x + regionData.br.x) / 2;
            const cy = (regionData.tl.y + regionData.br.y) / 2;
            const size = Math.min(
                regionData.tr.x - regionData.tl.x,
                regionData.bl.y - regionData.tl.y
            );

            ctx.font = `bold ${size}px Algerian`;
            ctx.fillStyle = "#000";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            // If text is true (boolean), use the condition code, otherwise use the text value
            const textToShow =
                typeof colorData.text === "boolean"
                    ? conditionCode
                    : colorData.text;

            ctx.fillText(textToShow, cx, cy);
        }
    };

    // Draw lines pattern (for porcelain crown, etc)
    const drawLinesPattern = (ctx, regionData) => {
        const startX = regionData.tl.x;
        const endX = regionData.tr.x;
        const startY = regionData.tl.y;
        const endY = regionData.bl.y;

        ctx.beginPath();
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = startX; x < endX; x += (endX - startX) / 15) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }

        ctx.stroke();
    };

    // Draw condition for the whole tooth - IMPROVED VERSION WITH PROPER SYMBOLS
    const drawWholeToothCondition = (
        ctx,
        toothData,
        conditionCode,
        colorData
    ) => {
        // Different handling based on condition type
        switch (conditionCode) {
            case ODONTOGRAM_MODE.NVT:
            case ODONTOGRAM_MODE.RCT:
                drawRootIndicator(
                    ctx,
                    toothData,
                    colorData,
                    conditionCode === ODONTOGRAM_MODE.RCT
                );
                break;
            case ODONTOGRAM_MODE.CFR:
                drawFractureSymbol(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.FMC:
            case ODONTOGRAM_MODE.POC:
                drawCrown(
                    ctx,
                    toothData,
                    colorData,
                    conditionCode === ODONTOGRAM_MODE.POC
                );
                break;
            case ODONTOGRAM_MODE.RRX:
                drawRootRemnant(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.MIS:
                drawMissingTooth(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.NON:
                drawNonSymbol(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.UNE:
                drawUneruptedSymbol(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.PRE:
                drawPartialEruptSymbol(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.ANO:
                drawAnomalySymbol(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.IPX:
                drawImplantSymbol(ctx, toothData);
                break;
            case ODONTOGRAM_MODE.FRM_ACR:
                drawDentureSymbol(ctx, toothData);
                break;
            default:
                // For other conditions, just highlight the tooth
                ctx.beginPath();
                ctx.rect(
                    toothData.x1,
                    toothData.y1,
                    toothData.bigBoxSize,
                    toothData.bigBoxSize
                );
                ctx.fillStyle = colorData.fill || "rgba(200, 200, 200, 0.5)";
                ctx.fill();
                break;
        }
    };

    // Draw root indicator for NVT/RCT
    const drawRootIndicator = (ctx, toothData, colorData, fill = false) => {
        const x1 = toothData.x1;
        const x2 = toothData.x2;
        const y2 = toothData.y2;
        const size = x2 - x1;
        const height = 25;

        ctx.beginPath();
        ctx.moveTo(x1 + size / 4, y2);
        ctx.lineTo(x1 + size / 2, y2 + height);
        ctx.lineTo(x2 - size / 4, y2);
        ctx.closePath();

        if (fill) {
            ctx.fillStyle = colorData.fill || "#333";
            ctx.fill();
        }

        ctx.strokeStyle = colorData.stroke || "#333";
        ctx.lineWidth = colorData.lineWidth || 2;
        ctx.stroke();
    };

    // Draw fracture symbol
    const drawFractureSymbol = (ctx, toothData) => {
        const x = toothData.cx;
        const y = toothData.cy;
        const size = toothData.bigBoxSize / 2;

        ctx.font = `bold ${size}px Algerian`;
        ctx.fillStyle = "#000";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText("#", x, y);
    };

    // Draw crown (FMC/POC)
    const drawCrown = (ctx, toothData, colorData, isPorcelain = false) => {
        // Draw crown outline
        ctx.beginPath();
        ctx.rect(
            toothData.x1,
            toothData.y1,
            toothData.bigBoxSize,
            toothData.bigBoxSize
        );
        ctx.strokeStyle = colorData.stroke || "#333";
        ctx.lineWidth = colorData.lineWidth || 6;
        ctx.stroke();

        // For porcelain, add vertical lines
        if (isPorcelain) {
            const startX = toothData.x1;
            const endX = toothData.x2;
            const startY = toothData.y1;
            const endY = toothData.y2;

            ctx.beginPath();
            ctx.lineWidth = 1;

            // Draw vertical lines
            for (let x = startX; x < endX; x += (endX - startX) / 15) {
                ctx.moveTo(x, startY);
                ctx.lineTo(x, endY);
            }

            ctx.stroke();
        }
    };

    // Draw root remnant
    const drawRootRemnant = (ctx, toothData) => {
        const x1 = toothData.x1;
        const y1 = toothData.y1;
        const x2 = toothData.x2;
        const y2 = toothData.y2;
        const bigBoxSize = toothData.bigBoxSize;
        const smallBoxSize = toothData.smallBoxSize;

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 4;

        // Draw lines for root remnant
        ctx.beginPath();
        ctx.moveTo(x1 + smallBoxSize / 3, y1 - smallBoxSize / 2);
        ctx.lineTo(x1 + smallBoxSize, y2 + smallBoxSize / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1 + smallBoxSize, y2 + smallBoxSize / 2);
        ctx.lineTo(x1 + smallBoxSize * 2, y1 - smallBoxSize);
        ctx.stroke();
    };

    // Draw missing tooth (X)
    const drawMissingTooth = (ctx, toothData) => {
        const x1 = toothData.x1;
        const y1 = toothData.y1;
        const x2 = toothData.x2;
        const y2 = toothData.y2;
        const bigBoxSize = toothData.bigBoxSize;
        const smallBoxSize = toothData.smallBoxSize;

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 4;

        // Draw X
        ctx.beginPath();
        ctx.moveTo(x1 + smallBoxSize * 0.5, y1 - smallBoxSize / 2);
        ctx.lineTo(x1 + smallBoxSize * 1.5, y2 + smallBoxSize / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1 + smallBoxSize * 1.5, y1 - smallBoxSize / 2);
        ctx.lineTo(x1 + smallBoxSize * 0.5, y2 + smallBoxSize / 2);
        ctx.stroke();
    };

    // NEW SYMBOL FUNCTIONS

    // Draw NON symbol (tooth not present, unknown if ever existed)
    const drawNonSymbol = (ctx, toothData) => {
        const x = toothData.x1;
        const y = toothData.y1;

        ctx.font = "bold 12px Algerian";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "left";
        ctx.fillText("   NON", x, y);
    };

    // Draw UNE symbol (unerupted tooth)
    const drawUneruptedSymbol = (ctx, toothData) => {
        const x = toothData.x1;
        const y = toothData.y1;

        ctx.font = "bold 12px Algerian";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "left";
        ctx.fillText("   UNE", x, y);
    };

    // Draw PRE symbol (partially erupted tooth)
    const drawPartialEruptSymbol = (ctx, toothData) => {
        const x = toothData.x1;
        const y = toothData.y1;

        ctx.font = "bold 12px Algerian";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "left";
        ctx.fillText("   PRE", x, y);
    };

    // Draw ANO symbol (anomaly)
    const drawAnomalySymbol = (ctx, toothData) => {
        const x = toothData.x1;
        const y = toothData.y1;

        ctx.font = "bold 12px Algerian";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "left";
        ctx.fillText("   ANO", x, y);
    };

    // Draw IPX symbol (implant + porcelain crown)
    const drawImplantSymbol = (ctx, toothData) => {
        const x = toothData.x1;
        const y = toothData.y2;

        ctx.font = "bold 12px Algerian";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillText("   IPX", x, y);
    };

    // Draw FRM_ACR symbol (partial/full denture)
    const drawDentureSymbol = (ctx, toothData) => {
        const x = toothData.x1 + (toothData.x2 - toothData.x1) / 2;
        const y =
            toothData.y2 +
            (toothData.x2 - toothData.x1) / 2 -
            (toothData.x2 - toothData.x1) / 8;

        ctx.font = "bold 12px Algerian";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillText("PRD/FLD", x, y);
    };

    // Draw bridge - FIXED to handle both formats
    const drawBridge = (ctx, bridge) => {
        // Handle different bridge data formats
        let fromTooth, toTooth;

        if (bridge.connected_teeth && bridge.connected_teeth.length >= 2) {
            fromTooth = bridge.connected_teeth[0];
            toTooth = bridge.connected_teeth[1];
        } else if (bridge.from && bridge.to) {
            fromTooth = bridge.from;
            toTooth = bridge.to;
        } else {
            console.warn("Bridge missing connection data:", bridge);
            return;
        }

        const fromToothData = teethCoordinates[fromTooth];
        const toToothData = teethCoordinates[toTooth];

        if (!fromToothData || !toToothData) return;

        // Draw bridge line
        ctx.beginPath();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 3;

        // Draw supports from each tooth
        ctx.moveTo(fromToothData.cx, fromToothData.y1);
        ctx.lineTo(fromToothData.cx, fromToothData.y1 - 8);

        ctx.moveTo(toToothData.cx, toToothData.y1);
        ctx.lineTo(toToothData.cx, toToothData.y1 - 8);

        // Draw connecting line
        ctx.moveTo(fromToothData.cx, fromToothData.y1 - 8);
        ctx.lineTo(toToothData.cx, toToothData.y1 - 8);

        ctx.stroke();
    };

    // Draw indicator (arrows) - FIXED to handle both formats
    const drawIndicator = (ctx, indicator) => {
        // Handle different indicator data formats
        const toothNumber = indicator.tooth_number || indicator.tooth;
        let indicatorType = indicator.indicator_type || indicator.type;

        // Convert string back to number for drawing if needed
        if (typeof indicatorType === "string") {
            const stringToModeMap = {
                ARROW_TOP_LEFT: ODONTOGRAM_MODE.ARROW_TOP_LEFT,
                ARROW_TOP_RIGHT: ODONTOGRAM_MODE.ARROW_TOP_RIGHT,
                ARROW_TOP_TURN_LEFT: ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT,
                ARROW_TOP_TURN_RIGHT: ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT,
                ARROW_BOTTOM_LEFT: ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT,
                ARROW_BOTTOM_RIGHT: ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT,
                ARROW_BOTTOM_TURN_LEFT: ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT,
                ARROW_BOTTOM_TURN_RIGHT:
                    ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT,
            };
            indicatorType = stringToModeMap[indicatorType] || indicatorType;
        }

        if (!toothNumber || !indicatorType) {
            console.warn("Indicator missing required data:", indicator);
            return;
        }

        const toothData = teethCoordinates[toothNumber];
        if (!toothData) return;

        const arrowSize = 15;
        const arrowWidth = 8;

        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#000";
        ctx.lineWidth = 2;

        // Draw different arrows based on type
        switch (indicatorType) {
            case ODONTOGRAM_MODE.ARROW_TOP_LEFT:
                drawArrow(
                    ctx,
                    toothData.cx - 10,
                    toothData.y1 - 15,
                    toothData.cx - 30,
                    toothData.y1 - 15,
                    arrowSize,
                    arrowWidth
                );
                break;
            case ODONTOGRAM_MODE.ARROW_TOP_RIGHT:
                drawArrow(
                    ctx,
                    toothData.cx + 10,
                    toothData.y1 - 15,
                    toothData.cx + 30,
                    toothData.y1 - 15,
                    arrowSize,
                    arrowWidth
                );
                break;
            case ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT:
                drawArrow(
                    ctx,
                    toothData.cx - 10,
                    toothData.y2 + 15,
                    toothData.cx - 30,
                    toothData.y2 + 15,
                    arrowSize,
                    arrowWidth
                );
                break;
            case ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT:
                drawArrow(
                    ctx,
                    toothData.cx + 10,
                    toothData.y2 + 15,
                    toothData.cx + 30,
                    toothData.y2 + 15,
                    arrowSize,
                    arrowWidth
                );
                break;
            // Handle curved arrows as well
            case ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT:
            case ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT:
            case ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT:
            case ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT:
                // Drawing curved arrows requires more complex path drawing
                // These could be implemented with arcs and additional path segments
                // For now, we'll use straight arrows as a simplification
                drawArrow(
                    ctx,
                    toothData.cx,
                    indicatorType <= ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT
                        ? toothData.y1 - 15
                        : toothData.y2 + 15,
                    toothData.cx + 20,
                    indicatorType <= ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT
                        ? toothData.y1 - 15
                        : toothData.y2 + 15,
                    arrowSize,
                    arrowWidth
                );
                break;
        }
    };

    // Helper function to draw an arrow
    const drawArrow = (
        ctx,
        fromX,
        fromY,
        toX,
        toY,
        headLength = 10,
        headWidth = 7
    ) => {
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw the arrow head
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / headWidth),
            toY - headLength * Math.sin(angle - Math.PI / headWidth)
        );
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / headWidth),
            toY - headLength * Math.sin(angle + Math.PI / headWidth)
        );
        ctx.closePath();
        ctx.fill();
    };

    // Mouse move handler to detect hovering - FIXED VERSION
    const handleMouseMove = (e) => {
        if (!canvasRef.current || !isInitialized || isLoading || !canEdit)
            return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Get mouse position relative to canvas - SIMPLIFIED
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePosition({ x, y });

        // Check if mouse is over any tooth
        let found = false;
        Object.entries(teethCoordinates).forEach(([tooth, coords]) => {
            if (found) return;

            // Check if mouse is within this tooth's bounding box
            if (
                x >= coords.x1 &&
                x <= coords.x2 &&
                y >= coords.y1 &&
                y <= coords.y2
            ) {
                // Now check specific regions
                let region = null;

                // For whole tooth modes, we don't need to check regions
                if (
                    ![
                        ODONTOGRAM_MODE.NVT,
                        ODONTOGRAM_MODE.RCT,
                        ODONTOGRAM_MODE.NON,
                        ODONTOGRAM_MODE.UNE,
                        ODONTOGRAM_MODE.PRE,
                        ODONTOGRAM_MODE.ANO,
                        ODONTOGRAM_MODE.CFR,
                        ODONTOGRAM_MODE.FMC,
                        ODONTOGRAM_MODE.POC,
                        ODONTOGRAM_MODE.RRX,
                        ODONTOGRAM_MODE.MIS,
                        ODONTOGRAM_MODE.IPX,
                        ODONTOGRAM_MODE.FRM_ACR,
                        ODONTOGRAM_MODE.BRIDGE,
                        ODONTOGRAM_MODE.HAPUS,
                        ODONTOGRAM_MODE.ARROW_TOP_LEFT,
                        ODONTOGRAM_MODE.ARROW_TOP_RIGHT,
                        ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT,
                        ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT,
                        ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT,
                        ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT,
                        ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT,
                        ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT,
                    ].includes(activeMode)
                ) {
                    // Check each region for filling modes
                    ["top", "right", "bottom", "left", "middle"].forEach(
                        (r) => {
                            if (region) return;

                            if (
                                isPointInPolygon(x, y, [
                                    coords[r].tl,
                                    coords[r].tr,
                                    coords[r].br,
                                    coords[r].bl,
                                ])
                            ) {
                                region = r;
                            }
                        }
                    );
                }

                setHoveredTooth({ tooth, region });
                found = true;

                // Change cursor to pointer when hovering over a tooth
                canvas.style.cursor = "pointer";
            }
        });

        if (!found) {
            setHoveredTooth(null);
            canvas.style.cursor = "default";
        }
    };

    // Check if point is inside polygon
    const isPointInPolygon = (x, y, polygon) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x,
                yi = polygon[i].y;
            const xj = polygon[j].x,
                yj = polygon[j].y;

            const intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

            if (intersect) inside = !inside;
        }

        return inside;
    };

    // Handle click on tooth
    const handleClick = (e) => {
        if (
            !canvasRef.current ||
            !isInitialized ||
            isLoading ||
            !canEdit ||
            activeMode === ODONTOGRAM_MODE.DEFAULT
        )
            return;

        if (hoveredTooth) {
            const { tooth, region } = hoveredTooth;

            // Bridge mode handling
            if (activeMode === ODONTOGRAM_MODE.BRIDGE) {
                if (!selectedBridgeStart) {
                    // First click - select start tooth
                    setSelectedBridgeStart(tooth);
                } else if (selectedBridgeStart !== tooth) {
                    // Second click - create bridge between two teeth
                    handleAddBridge(selectedBridgeStart, tooth);
                    setSelectedBridgeStart(null);
                } else {
                    // Clicked the same tooth twice - cancel
                    setSelectedBridgeStart(null);
                }
                return;
            }

            // Arrow indicators handling
            if (
                [
                    ODONTOGRAM_MODE.ARROW_TOP_LEFT,
                    ODONTOGRAM_MODE.ARROW_TOP_RIGHT,
                    ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT,
                    ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT,
                    ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT,
                    ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT,
                    ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT,
                    ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT,
                ].includes(activeMode)
            ) {
                handleAddIndicator(tooth, activeMode);
                return;
            }

            // Create condition based on active mode and region
            if (activeMode === ODONTOGRAM_MODE.HAPUS) {
                // Remove condition
                handleDeleteCondition(tooth, region);
            } else {
                // Add condition
                handleAddCondition(tooth, region, activeMode);
            }
        }
    };

    // Handle adding a condition
    const handleAddCondition = (tooth, region, mode) => {
        // Format position based on region (e.g., "18-T" for tooth 18, top region)
        const pos = region
            ? `${tooth}-${region.charAt(0).toUpperCase()}`
            : tooth;

        // Create new condition object - FIXED FORMAT
        const newCondition = {
            tooth_number: tooth,
            surface: region ? region.charAt(0).toUpperCase() : null,
            condition_code: getConditionCodeFromMode(mode),
            code: mode,
            pos,
            geometry_data: {},
        };

        // Update conditions in state
        const updatedConditions = [...(data.conditions || [])];

        // Check if condition already exists
        const existingIndex = updatedConditions.findIndex((c) => c.pos === pos);

        if (existingIndex >= 0) {
            // Replace existing condition
            updatedConditions[existingIndex] = newCondition;
        } else {
            // Add new condition
            updatedConditions.push(newCondition);
        }

        // Notify parent of change
        onChange({
            ...data,
            conditions: updatedConditions,
        });
    };

    // Handle adding a bridge - FIXED FORMAT
    const handleAddBridge = (fromTooth, toTooth) => {
        const newBridge = {
            bridge_name: "Bridge",
            connected_teeth: [fromTooth, toTooth], // Use proper format
            bridge_type: "fixed",
            bridge_geometry: null,
            // Keep backward compatibility
            from: fromTooth,
            to: toTooth,
        };

        // Update bridges in state
        const updatedBridges = [...(data.bridges || [])];

        // Check if bridge already exists
        const existingIndex = updatedBridges.findIndex(
            (b) =>
                (b.from === fromTooth && b.to === toTooth) ||
                (b.from === toTooth && b.to === fromTooth) ||
                (b.connected_teeth &&
                    b.connected_teeth.includes(fromTooth) &&
                    b.connected_teeth.includes(toTooth))
        );

        if (existingIndex >= 0) {
            // Replace existing bridge
            updatedBridges[existingIndex] = newBridge;
        } else {
            // Add new bridge
            updatedBridges.push(newBridge);
        }

        // Notify parent of change
        onChange({
            ...data,
            bridges: updatedBridges,
        });
    };

    // Handle adding an indicator - FIXED FORMAT
    const handleAddIndicator = (tooth, indicatorType) => {
        // Convert mode number to string enum
        const indicatorTypeString = getIndicatorTypeFromMode(indicatorType);

        // console.log("Creating indicator:", {
        //     tooth,
        //     mode: indicatorType,
        //     converted_type: indicatorTypeString,
        // });

        const newIndicator = {
            tooth_number: tooth, // Use proper format
            indicator_type: indicatorTypeString, // Use string enum, not number!
            geometry_data: null,
            notes: null,
            // Keep backward compatibility
            tooth: tooth,
            type: indicatorTypeString, // Also use string here
        };

        // Update indicators in state
        const updatedIndicators = [...(data.indicators || [])];

        // Check if indicator already exists
        const existingIndex = updatedIndicators.findIndex(
            (i) =>
                (i.tooth === tooth || i.tooth_number === tooth) &&
                (i.type === indicatorTypeString ||
                    i.indicator_type === indicatorTypeString)
        );

        if (existingIndex >= 0) {
            // Replace existing indicator
            updatedIndicators[existingIndex] = newIndicator;
        } else {
            // Add new indicator
            updatedIndicators.push(newIndicator);
        }

        // Notify parent of change
        onChange({
            ...data,
            indicators: updatedIndicators,
        });
    };

    // Handle deleting a condition
    const handleDeleteCondition = (tooth, region) => {
        console.log(
            "Deleting condition for tooth:",
            tooth,
            "region:",
            region,
            "data:",
            data
        );

        let updatedConditions = [...(data.conditions || [])];
        let updatedBridges = [...(data.bridges || [])];
        let updatedIndicators = [...(data.indicators || [])];

        if (region) {
            // Delete specific surface condition
            const pos = `${tooth}-${region.charAt(0).toUpperCase()}`;

            const beforeCount = updatedConditions.length;
            updatedConditions = updatedConditions.filter((c) => {
                // Remove condition that matches exact position
                const shouldKeep = c.pos !== pos;
                if (!shouldKeep) {
                    console.log("Removing condition:", c);
                }
                return shouldKeep;
            });

            console.log(
                `Removed ${
                    beforeCount - updatedConditions.length
                } surface conditions for ${pos}`
            );
        } else {
            // Delete entire tooth - all conditions, bridges involving this tooth, and indicators

            // Remove all conditions for this tooth
            const beforeConditionCount = updatedConditions.length;
            updatedConditions = updatedConditions.filter((c) => {
                const shouldKeep =
                    c.tooth_number !== tooth && !c.pos?.startsWith(tooth);
                if (!shouldKeep) {
                    console.log("Removing tooth condition:", c);
                }
                return shouldKeep;
            });
            console.log(
                `Removed ${
                    beforeConditionCount - updatedConditions.length
                } tooth conditions`
            );

            // Remove bridges involving this tooth
            const beforeBridgeCount = updatedBridges.length;
            updatedBridges = updatedBridges.filter((b) => {
                let shouldKeep = true;

                // Check connected_teeth array
                if (b.connected_teeth && Array.isArray(b.connected_teeth)) {
                    shouldKeep = !b.connected_teeth.includes(tooth);
                }

                // Check backward compatibility fields
                if (shouldKeep && (b.from === tooth || b.to === tooth)) {
                    shouldKeep = false;
                }

                if (!shouldKeep) {
                    console.log("Removing bridge:", b);
                }
                return shouldKeep;
            });
            console.log(
                `Removed ${beforeBridgeCount - updatedBridges.length} bridges`
            );

            // Remove indicators for this tooth
            const beforeIndicatorCount = updatedIndicators.length;
            updatedIndicators = updatedIndicators.filter((i) => {
                const shouldKeep =
                    i.tooth_number !== tooth && i.tooth !== tooth;
                if (!shouldKeep) {
                    console.log("Removing indicator:", i);
                }
                return shouldKeep;
            });
            console.log(
                `Removed ${
                    beforeIndicatorCount - updatedIndicators.length
                } indicators`
            );
        }

        // Update state with cleaned data
        const newData = {
            ...data,
            conditions: updatedConditions,
            bridges: updatedBridges,
            indicators: updatedIndicators,
        };

        console.log("Updated data:", newData);

        // Notify parent of change
        onChange(newData);
    };

    // Convert mode to condition code - FIXED VERSION
    const getConditionCodeFromMode = (mode) => {
        // Map mode number to string enum that matches database
        const modeToStringMap = {
            [ODONTOGRAM_MODE.AMF]: "AMF",
            [ODONTOGRAM_MODE.COF]: "COF",
            [ODONTOGRAM_MODE.FIS]: "FIS",
            [ODONTOGRAM_MODE.NVT]: "NVT",
            [ODONTOGRAM_MODE.RCT]: "RCT",
            [ODONTOGRAM_MODE.NON]: "NON",
            [ODONTOGRAM_MODE.UNE]: "UNE",
            [ODONTOGRAM_MODE.PRE]: "PRE",
            [ODONTOGRAM_MODE.ANO]: "ANO",
            [ODONTOGRAM_MODE.CARIES]: "CARIES",
            [ODONTOGRAM_MODE.CFR]: "CFR",
            [ODONTOGRAM_MODE.FMC]: "FMC",
            [ODONTOGRAM_MODE.POC]: "POC",
            [ODONTOGRAM_MODE.RRX]: "RRX",
            [ODONTOGRAM_MODE.MIS]: "MIS",
            [ODONTOGRAM_MODE.IPX]: "IPX",
            [ODONTOGRAM_MODE.FRM_ACR]: "FRM_ACR",
            [ODONTOGRAM_MODE.BRIDGE]: "BRIDGE",
        };

        return modeToStringMap[mode] || "CARIES"; // Default fallback
    };

    // Convert mode to indicator type string - NEW FUNCTION
    const getIndicatorTypeFromMode = (mode) => {
        const modeToIndicatorMap = {
            [ODONTOGRAM_MODE.ARROW_TOP_LEFT]: "ARROW_TOP_LEFT",
            [ODONTOGRAM_MODE.ARROW_TOP_RIGHT]: "ARROW_TOP_RIGHT",
            [ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT]: "ARROW_TOP_TURN_LEFT",
            [ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT]: "ARROW_TOP_TURN_RIGHT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT]: "ARROW_BOTTOM_LEFT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT]: "ARROW_BOTTOM_RIGHT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT]: "ARROW_BOTTOM_TURN_LEFT",
            [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT]:
                "ARROW_BOTTOM_TURN_RIGHT",
        };

        return modeToIndicatorMap[mode] || "ARROW_TOP_LEFT"; // Default fallback
    };

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded"
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                style={{
                    cursor: canEdit ? "default" : "not-allowed",
                    width,
                    height,
                }}
            />
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>
                    {hoveredTooth && (
                        <span>
                            Gigi {hoveredTooth.tooth}
                            {hoveredTooth.region && ` (${hoveredTooth.region})`}
                        </span>
                    )}
                </span>
                <span>
                    {selectedBridgeStart && (
                        <span>
                            Bridge: dari gigi {selectedBridgeStart} - pilih gigi
                            tujuan
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};

export default OdontogramCanvas;
