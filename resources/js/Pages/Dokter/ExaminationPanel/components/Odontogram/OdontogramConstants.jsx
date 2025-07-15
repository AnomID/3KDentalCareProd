// resources/js/Pages/Dokter/ExaminationPanel/components/Odontogram/OdontogramConstants.js

// Konstanta untuk MODE Odontogram
export const ODONTOGRAM_MODE = {
    HAPUS: 100, // HAPUS
    DEFAULT: 0, // Do Nothing
    AMF: 1, // Hitam = TAMBALAN AMALGAM
    COF: 2, // Hijau Diarsir = TAMBALAN COMPOSITE
    FIS: 3, // UNGU = pit dan fissure sealant
    NVT: 4, // SEGITIGA DIBAWAH (seperti Akar) = gigi non-vital
    RCT: 5, // SEGITIGA DIBAWAH (seperti Akar) filled = Perawatan Saluran Akar
    NON: 6, // gigi tidak ada, tidak diketahui ada atau tidak ada. (non)
    UNE: 7, // Un-Erupted (une)
    PRE: 8, // Partial-Erupt (pre)
    ANO: 9, // Anomali (ano), Pegshaped, micro, fusi, etc
    CARIES: 10, // Caries = Tambalan sementara (car)
    CFR: 11, // fracture (cfr) (Tanda '#' di tengah" gigi)
    FMC: 12, // Full metal crown pada gigi vital (fmc)
    POC: 13, // Porcelain crown pada gigi vital (poc)
    RRX: 14, // Sisa Akar (rrx)
    MIS: 15, // Gigi hilang (mis)
    IPX: 16, // Implant + Porcelain crown (ipx - poc)
    FRM_ACR: 17, // Partial Denture/ Full Denture
    BRIDGE: 18, // BRIDGE
    ARROW_TOP_LEFT: 19, // TOP-LEFT ARROW
    ARROW_TOP_RIGHT: 20, // TOP-RIGHT ARROW
    ARROW_TOP_TURN_LEFT: 21, // TOP-TURN-LEFT ARROW
    ARROW_TOP_TURN_RIGHT: 22, // TOP-TURN-RIGHT ARROW
    ARROW_BOTTOM_LEFT: 23, // BOTTOM-LEFT ARROW
    ARROW_BOTTOM_RIGHT: 24, // BOTTOM-RIGHT ARROW
    ARROW_BOTTOM_TURN_LEFT: 25, // BOTTOM-TURN-LEFT ARROW
    ARROW_BOTTOM_TURN_RIGHT: 26, // BOTTOM-TURN-RIGHT ARROW
};

// Mode descriptions for display
export const MODE_DESCRIPTIONS = {
    [ODONTOGRAM_MODE.HAPUS]: "Hapus",
    [ODONTOGRAM_MODE.DEFAULT]: "Pilih Mode",
    [ODONTOGRAM_MODE.AMF]: "Tambalan Amalgam",
    [ODONTOGRAM_MODE.COF]: "Tambalan Composite",
    [ODONTOGRAM_MODE.FIS]: "Pit & Fissure Sealant",
    [ODONTOGRAM_MODE.NVT]: "Gigi Non Vital",
    [ODONTOGRAM_MODE.RCT]: "Perawatan Saluran Akar",
    [ODONTOGRAM_MODE.NON]: "Gigi Tidak Ada",
    [ODONTOGRAM_MODE.UNE]: "Un-Erupted",
    [ODONTOGRAM_MODE.PRE]: "Partial-Erupt",
    [ODONTOGRAM_MODE.ANO]: "Anomali",
    [ODONTOGRAM_MODE.CARIES]: "Karies",
    [ODONTOGRAM_MODE.CFR]: "Fraktur",
    [ODONTOGRAM_MODE.FMC]: "Full Metal Crown",
    [ODONTOGRAM_MODE.POC]: "Porcelain Crown",
    [ODONTOGRAM_MODE.RRX]: "Sisa Akar",
    [ODONTOGRAM_MODE.MIS]: "Gigi Hilang",
    [ODONTOGRAM_MODE.IPX]: "Implant + Crown",
    [ODONTOGRAM_MODE.FRM_ACR]: "Gigi Tiruan",
    [ODONTOGRAM_MODE.BRIDGE]: "Bridge",
    [ODONTOGRAM_MODE.ARROW_TOP_LEFT]: "Panah Atas Kiri",
    [ODONTOGRAM_MODE.ARROW_TOP_RIGHT]: "Panah Atas Kanan",
    [ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT]: "Panah Atas Belok Kiri",
    [ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT]: "Panah Atas Belok Kanan",
    [ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT]: "Panah Bawah Kiri",
    [ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT]: "Panah Bawah Kanan",
    [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT]: "Panah Bawah Belok Kiri",
    [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT]: "Panah Bawah Belok Kanan",
};

// Group modes for better UI organization
export const MODE_GROUPS = {
    Tambalan: [
        ODONTOGRAM_MODE.AMF,
        ODONTOGRAM_MODE.COF,
        ODONTOGRAM_MODE.FIS,
        ODONTOGRAM_MODE.CARIES,
    ],
    "Kondisi Gigi": [
        ODONTOGRAM_MODE.NVT,
        ODONTOGRAM_MODE.RCT,
        ODONTOGRAM_MODE.NON,
        ODONTOGRAM_MODE.UNE,
        ODONTOGRAM_MODE.PRE,
        ODONTOGRAM_MODE.ANO,
        ODONTOGRAM_MODE.CFR,
    ],
    Restorasi: [
        ODONTOGRAM_MODE.FMC,
        ODONTOGRAM_MODE.POC,
        ODONTOGRAM_MODE.RRX,
        ODONTOGRAM_MODE.MIS,
        ODONTOGRAM_MODE.IPX,
        ODONTOGRAM_MODE.FRM_ACR,
        ODONTOGRAM_MODE.BRIDGE,
    ],
    Indikator: [
        ODONTOGRAM_MODE.ARROW_TOP_LEFT,
        ODONTOGRAM_MODE.ARROW_TOP_RIGHT,
        ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT,
        ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT,
        ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT,
        ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT,
        ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT,
        ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT,
    ],
};

// Colors for different dental conditions
export const MODE_COLORS = {
    // Main tool colors
    [ODONTOGRAM_MODE.HAPUS]: {
        fill: "rgba(200, 200, 200, 0.8)",
        stroke: "#555",
    },
    [ODONTOGRAM_MODE.DEFAULT]: { fill: "transparent", stroke: "#555" },

    // Fillings
    [ODONTOGRAM_MODE.AMF]: { fill: "#222", stroke: "#222" },
    [ODONTOGRAM_MODE.COF]: { fill: "#29b522", stroke: "#1a7517" },
    [ODONTOGRAM_MODE.FIS]: { fill: "#ed3bed", stroke: "#a81ca8" },
    [ODONTOGRAM_MODE.CARIES]: {
        fill: "transparent",
        stroke: "#ff5252",
        lineWidth: 4,
    },

    // Tooth conditions
    [ODONTOGRAM_MODE.NVT]: { fill: "transparent", stroke: "#333" },
    [ODONTOGRAM_MODE.RCT]: { fill: "#333", stroke: "#333" },
    [ODONTOGRAM_MODE.NON]: { fill: "#555", stroke: "#555", text: true },
    [ODONTOGRAM_MODE.UNE]: { fill: "#555", stroke: "#555", text: true },
    [ODONTOGRAM_MODE.PRE]: { fill: "#555", stroke: "#555", text: true },
    [ODONTOGRAM_MODE.ANO]: { fill: "#555", stroke: "#555", text: true },
    [ODONTOGRAM_MODE.CFR]: { fill: "#555", stroke: "#555", text: "#" },

    // Restorations
    [ODONTOGRAM_MODE.FMC]: {
        fill: "transparent",
        stroke: "#333",
        lineWidth: 6,
    },
    [ODONTOGRAM_MODE.POC]: {
        fill: "transparent",
        stroke: "#333",
        lineWidth: 6,
        pattern: "lines",
    },
    [ODONTOGRAM_MODE.RRX]: {
        fill: "transparent",
        stroke: "#333",
        lineWidth: 4,
    },
    [ODONTOGRAM_MODE.MIS]: {
        fill: "transparent",
        stroke: "#333",
        lineWidth: 4,
    },
    [ODONTOGRAM_MODE.IPX]: { fill: "#555", stroke: "#555", text: true },
    [ODONTOGRAM_MODE.FRM_ACR]: { fill: "#555", stroke: "#555", text: true },
    [ODONTOGRAM_MODE.BRIDGE]: {
        fill: "transparent",
        stroke: "#555",
        lineWidth: 6,
    },

    // Arrows
    [ODONTOGRAM_MODE.ARROW_TOP_LEFT]: { fill: "#000", stroke: "#000" },
    [ODONTOGRAM_MODE.ARROW_TOP_RIGHT]: { fill: "#000", stroke: "#000" },
    [ODONTOGRAM_MODE.ARROW_TOP_TURN_LEFT]: { fill: "#000", stroke: "#000" },
    [ODONTOGRAM_MODE.ARROW_TOP_TURN_RIGHT]: { fill: "#000", stroke: "#000" },
    [ODONTOGRAM_MODE.ARROW_BOTTOM_LEFT]: { fill: "#000", stroke: "#000" },
    [ODONTOGRAM_MODE.ARROW_BOTTOM_RIGHT]: { fill: "#000", stroke: "#000" },
    [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_LEFT]: { fill: "#000", stroke: "#000" },
    [ODONTOGRAM_MODE.ARROW_BOTTOM_TURN_RIGHT]: { fill: "#000", stroke: "#000" },
};

// UI Button colors for different modes
export const UI_MODE_COLORS = {
    [ODONTOGRAM_MODE.HAPUS]: "destructive",
    [ODONTOGRAM_MODE.DEFAULT]: "secondary",
    [ODONTOGRAM_MODE.AMF]: "secondary",
    [ODONTOGRAM_MODE.COF]: "secondary",
    // Default button style for other modes is 'outline'
};

// Permukaaan gigi
export const TOOTH_SURFACES = {
    TOP: "T", // Top (occlusal untuk posterior, incisal untuk anterior)
    BOTTOM: "B", // Bottom (gingival)
    LEFT: "L", // Left (lingual/palatal)
    RIGHT: "R", // Right (buccal untuk posterior, labial untuk anterior)
    MIDDLE: "M", // Middle (tengah)
};

// Nomor gigi default untuk rendering
export const DEFAULT_TEETH_NUMBERS = [
    "18",
    "17",
    "16",
    "15",
    "14",
    "13",
    "12",
    "11",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "55",
    "54",
    "53",
    "52",
    "51",
    "61",
    "62",
    "63",
    "64",
    "65",
    "85",
    "84",
    "83",
    "82",
    "81",
    "71",
    "72",
    "73",
    "74",
    "75",
    "48",
    "47",
    "46",
    "45",
    "44",
    "43",
    "42",
    "41",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
];

// Untuk metadata form
export const OCCLUSION_OPTIONS = [
    { value: "normal", label: "Normal Bite" },
    { value: "cross", label: "Cross Bite" },
    { value: "steep", label: "Steep Bite" },
];

export const TORUS_PALATINUS_OPTIONS = [
    { value: "none", label: "Tidak Ada" },
    { value: "small", label: "Kecil" },
    { value: "medium", label: "Sedang" },
    { value: "large", label: "Besar" },
    { value: "multiple", label: "Multiple" },
];

export const TORUS_MANDIBULARIS_OPTIONS = [
    { value: "none", label: "Tidak Ada" },
    { value: "left", label: "Sisi Kiri" },
    { value: "right", label: "Sisi Kanan" },
    { value: "both", label: "Kedua Sisi" },
];

export const PALATUM_OPTIONS = [
    { value: "deep", label: "Dalam" },
    { value: "medium", label: "Sedang" },
    { value: "shallow", label: "Rendah" },
];
