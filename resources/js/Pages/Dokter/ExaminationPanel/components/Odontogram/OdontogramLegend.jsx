import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    ODONTOGRAM_MODE,
    MODE_DESCRIPTIONS,
    MODE_COLORS,
} from "./OdontogramConstants";

const OdontogramLegend = () => {
    const legendItems = [
        {
            group: "Tambalan",
            items: [
                {
                    mode: ODONTOGRAM_MODE.AMF,
                    color: "#222",
                    description: "Tambalan Amalgam (Hitam)",
                },
                {
                    mode: ODONTOGRAM_MODE.COF,
                    color: "#29b522",
                    description: "Tambalan Composite (Hijau)",
                },
                {
                    mode: ODONTOGRAM_MODE.FIS,
                    color: "#ed3bed",
                    description: "Pit & Fissure Sealant (Ungu)",
                },
                {
                    mode: ODONTOGRAM_MODE.CARIES,
                    color: "#ff5252",
                    description: "Karies (Garis Merah)",
                },
            ],
        },
        {
            group: "Kondisi Gigi",
            items: [
                {
                    mode: ODONTOGRAM_MODE.NVT,
                    color: "#333",
                    description: "Non-Vital (Segitiga Kosong)",
                },
                {
                    mode: ODONTOGRAM_MODE.RCT,
                    color: "#333",
                    description: "Root Canal Treatment (Segitiga Penuh)",
                },
                {
                    mode: ODONTOGRAM_MODE.CFR,
                    color: "#000",
                    description: "Fraktur (Tanda #)",
                },
                {
                    mode: ODONTOGRAM_MODE.NON,
                    color: "#555",
                    description: "Tidak Ada (NON)",
                },
                {
                    mode: ODONTOGRAM_MODE.UNE,
                    color: "#555",
                    description: "Un-Erupted (UNE)",
                },
                {
                    mode: ODONTOGRAM_MODE.PRE,
                    color: "#555",
                    description: "Partial Erupt (PRE)",
                },
                {
                    mode: ODONTOGRAM_MODE.ANO,
                    color: "#555",
                    description: "Anomali (ANO)",
                },
            ],
        },
        {
            group: "Restorasi",
            items: [
                {
                    mode: ODONTOGRAM_MODE.FMC,
                    color: "#333",
                    description: "Full Metal Crown (Garis Tebal)",
                },
                {
                    mode: ODONTOGRAM_MODE.POC,
                    color: "#333",
                    description: "Porcelain Crown (Garis + Strip)",
                },
                {
                    mode: ODONTOGRAM_MODE.RRX,
                    color: "#333",
                    description: "Sisa Akar",
                },
                {
                    mode: ODONTOGRAM_MODE.MIS,
                    color: "#333",
                    description: "Gigi Hilang (X)",
                },
                {
                    mode: ODONTOGRAM_MODE.IPX,
                    color: "#555",
                    description: "Implant (IPX)",
                },
                {
                    mode: ODONTOGRAM_MODE.FRM_ACR,
                    color: "#555",
                    description: "Gigi Tiruan",
                },
                {
                    mode: ODONTOGRAM_MODE.BRIDGE,
                    color: "#555",
                    description: "Bridge",
                },
            ],
        },
    ];

    const renderColorSample = (color, mode) => {
        const colorConfig = MODE_COLORS[mode];

        if (colorConfig?.text) {
            return (
                <div className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs font-bold">
                    {typeof colorConfig.text === "boolean"
                        ? MODE_DESCRIPTIONS[mode]?.charAt(0)
                        : colorConfig.text}
                </div>
            );
        }

        if (colorConfig?.pattern === "lines") {
            return (
                <div
                    className="w-6 h-6 border border-gray-300 rounded relative"
                    style={{
                        backgroundColor: colorConfig.fill || "transparent",
                    }}
                >
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-30"
                        style={{
                            backgroundSize: "2px 100%",
                            backgroundRepeat: "repeat-x",
                        }}
                    ></div>
                </div>
            );
        }

        return (
            <div
                className="w-6 h-6 border border-gray-300 rounded"
                style={{
                    backgroundColor: colorConfig?.fill || color,
                    borderColor: colorConfig?.stroke || color,
                    borderWidth: colorConfig?.lineWidth
                        ? `${colorConfig.lineWidth}px`
                        : "1px",
                }}
            ></div>
        );
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-sm flex items-center">
                    📖 Legenda Odontogram
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {legendItems.map((group) => (
                    <div key={group.group}>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                            {group.group}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.items.map((item) => (
                                <div
                                    key={item.mode}
                                    className="flex items-center space-x-2"
                                >
                                    {renderColorSample(item.color, item.mode)}
                                    <span className="text-xs text-gray-600">
                                        {item.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Indikator
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                            ➰ Arrow: Menunjukkan arah perawatan
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            🔗 Bridge: Menghubungkan 2+ gigi
                        </Badge>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                    <p>
                        <strong>Cara Penggunaan:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Pilih mode di panel kontrol</li>
                        <li>Klik pada bagian gigi yang diinginkan</li>
                        <li>
                            Untuk tambalan: klik permukaan spesifik (M, O, D, V,
                            L)
                        </li>
                        <li>Untuk kondisi gigi: klik seluruh gigi</li>
                        <li>Gunakan mode hapus untuk menghapus kondisi</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default OdontogramLegend;
