// resources/js/Pages/Dokter/ExaminationPanel/components/Odontogram/OdontogramControls.jsx
import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    ODONTOGRAM_MODE,
    MODE_DESCRIPTIONS,
    MODE_GROUPS,
    UI_MODE_COLORS,
} from "./OdontogramConstants";
import {
    Eraser,
    Paintbrush,
    Wrench,
    ArrowUpLeft,
    Settings,
    CircleOff,
    Link,
    AlertTriangle,
} from "lucide-react";
import OdontogramLegend from "./OdontogramLegend";

const OdontogramControls = ({
    activeMode,
    onModeChange,
    canEdit = true,
    isLoading = false,
}) => {
    const [activeTab, setActiveTab] = useState("tambal");
    const [showLegend, setShowLegend] = useState(false);

    // Helper to get icon for mode group
    const getGroupIcon = (group) => {
        switch (group) {
            case "Tambalan":
                return <Paintbrush size={16} />;
            case "Kondisi Gigi":
                return <Settings size={16} />;
            case "Restorasi":
                return <Wrench size={16} />;
            case "Indikator":
                return <ArrowUpLeft size={16} />;
            default:
                return null;
        }
    };

    // Get button variant based on mode
    const getButtonVariant = (mode) => {
        if (mode === activeMode) {
            return "default";
        }

        if (UI_MODE_COLORS[mode]) {
            return UI_MODE_COLORS[mode];
        }

        return "outline";
    };

    // Render button for each mode
    const renderModeButton = (mode) => (
        <Button
            key={mode}
            type="button"
            variant={getButtonVariant(mode)}
            size="sm"
            className={`mr-1 mb-1 ${
                activeMode === mode
                    ? "ring-2 ring-offset-2 ring-primary/50"
                    : ""
            }`}
            onClick={() => onModeChange(mode)}
            disabled={!canEdit || isLoading}
            title={MODE_DESCRIPTIONS[mode]}
        >
            <span className="truncate max-w-[120px]">
                {MODE_DESCRIPTIONS[mode]}
            </span>
        </Button>
    );

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-4 flex justify-between items-center">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Mode aktif:
                    </p>
                    <div
                        className={`bg-white px-3 py-2 border rounded-md ${
                            activeMode === ODONTOGRAM_MODE.HAPUS
                                ? "border-red-300 text-red-600"
                                : ""
                        }`}
                    >
                        {MODE_DESCRIPTIONS[activeMode]}
                    </div>
                </div>
                <div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLegend(!showLegend)}
                        className="ml-2"
                    >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {showLegend ? "Tutup" : "Lihat"} Legenda
                    </Button>
                </div>
            </div>

            {showLegend && (
                <div className="mb-4">
                    <OdontogramLegend />
                </div>
            )}

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="mb-4 w-full grid grid-cols-5">
                    <TabsTrigger
                        value="tambal"
                        className="text-xs flex items-center justify-center"
                    >
                        <Paintbrush className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Tambalan</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="kondisi"
                        className="text-xs flex items-center justify-center"
                    >
                        <Settings className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Kondisi</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="restorasi"
                        className="text-xs flex items-center justify-center"
                    >
                        <Wrench className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Restorasi</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="indikator"
                        className="text-xs flex items-center justify-center"
                    >
                        <ArrowUpLeft className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Indikator</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="tools"
                        className="text-xs flex items-center justify-center"
                    >
                        <Eraser className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Tools</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tambal" className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {MODE_GROUPS["Tambalan"].map(renderModeButton)}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 italic">
                        Pilih mode diatas lalu klik pada bagian gigi yang
                        diinginkan
                    </div>
                </TabsContent>

                <TabsContent value="kondisi" className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {MODE_GROUPS["Kondisi Gigi"].map(renderModeButton)}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 italic">
                        Pilih mode diatas lalu klik pada gigi yang diinginkan
                    </div>
                </TabsContent>

                <TabsContent value="restorasi" className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {MODE_GROUPS["Restorasi"].map(renderModeButton)}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 italic">
                        Pilih mode diatas lalu klik pada gigi yang diinginkan
                    </div>

                    {activeMode === ODONTOGRAM_MODE.BRIDGE && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-200 mt-2 flex items-start">
                            <Link className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                            <div className="text-xs text-blue-700">
                                <span className="font-medium">
                                    Mode Bridge:{" "}
                                </span>
                                Klik gigi pertama untuk titik awal bridge,
                                kemudian klik gigi kedua untuk titik akhir
                                bridge.
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="indikator" className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {MODE_GROUPS["Indikator"].map(renderModeButton)}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 italic">
                        Pilih indikator diatas lalu klik pada gigi yang
                        diinginkan
                    </div>
                </TabsContent>

                <TabsContent value="tools" className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={
                                activeMode === ODONTOGRAM_MODE.HAPUS
                                    ? "default"
                                    : "destructive"
                            }
                            size="sm"
                            className={`${
                                activeMode === ODONTOGRAM_MODE.HAPUS
                                    ? "ring-2 ring-offset-2 ring-red-300"
                                    : ""
                            }`}
                            onClick={() => onModeChange(ODONTOGRAM_MODE.HAPUS)}
                            disabled={!canEdit || isLoading}
                        >
                            <Eraser className="mr-1" size={16} /> Hapus
                        </Button>
                        <Button
                            type="button"
                            variant={
                                activeMode === ODONTOGRAM_MODE.DEFAULT
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            className={`${
                                activeMode === ODONTOGRAM_MODE.DEFAULT
                                    ? "ring-2 ring-offset-2 ring-primary/50"
                                    : ""
                            }`}
                            onClick={() =>
                                onModeChange(ODONTOGRAM_MODE.DEFAULT)
                            }
                            disabled={isLoading}
                        >
                            <CircleOff className="mr-1" size={16} /> Pilih Mode
                        </Button>
                    </div>

                    {activeMode === ODONTOGRAM_MODE.HAPUS && (
                        <div className="bg-red-50 p-2 rounded border border-red-200 mt-2 flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                            <div className="text-xs text-red-700">
                                <span className="font-medium">
                                    Mode Hapus Aktif:{" "}
                                </span>
                                Klik pada gigi untuk menghapus semua kondisi
                                pada gigi tersebut. Klik pada bagian spesifik
                                gigi untuk menghapus kondisi pada bagian
                                tersebut saja.
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <div className="mt-4">
                <p className="text-xs text-gray-500">
                    Klik pada bagian gigi untuk menerapkan kondisi yang dipilih.
                    Gunakan mode hapus untuk menghapus kondisi.
                </p>
            </div>
        </div>
    );
};

export default OdontogramControls;
