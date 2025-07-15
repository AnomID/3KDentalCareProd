// resources/js/Pages/Dokter/ExaminationPanel/components/Odontogram/OdontogramMetadata.jsx
import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    OCCLUSION_OPTIONS,
    TORUS_PALATINUS_OPTIONS,
    TORUS_MANDIBULARIS_OPTIONS,
    PALATUM_OPTIONS,
} from "./OdontogramConstants";

const OdontogramMetadata = ({
    occlusion,
    setOcclusion,
    torusPalatinus,
    setTorusPalatinus,
    torusMandibularis,
    setTorusMandibularis,
    palatum,
    setPalatum,
    diastema,
    setDiastema,
    gigiAnomali,
    setGigiAnomali,
    others,
    setOthers,
    canEdit = true,
    isLoading = false,
}) => {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
                Metadata Odontogram
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Occlusion */}
                <div>
                    <Label
                        htmlFor="occlusion"
                        className="text-xs font-medium text-gray-700"
                    >
                        Occlusion
                    </Label>
                    <Select
                        value={occlusion}
                        onValueChange={setOcclusion}
                        disabled={!canEdit || isLoading}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Pilih occlusion" />
                        </SelectTrigger>
                        <SelectContent>
                            {OCCLUSION_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Torus Palatinus */}
                <div>
                    <Label
                        htmlFor="torus_palatinus"
                        className="text-xs font-medium text-gray-700"
                    >
                        Torus Palatinus
                    </Label>
                    <Select
                        value={torusPalatinus}
                        onValueChange={setTorusPalatinus}
                        disabled={!canEdit || isLoading}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Pilih torus palatinus" />
                        </SelectTrigger>
                        <SelectContent>
                            {TORUS_PALATINUS_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Torus Mandibularis */}
                <div>
                    <Label
                        htmlFor="torus_mandibularis"
                        className="text-xs font-medium text-gray-700"
                    >
                        Torus Mandibularis
                    </Label>
                    <Select
                        value={torusMandibularis}
                        onValueChange={setTorusMandibularis}
                        disabled={!canEdit || isLoading}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Pilih torus mandibularis" />
                        </SelectTrigger>
                        <SelectContent>
                            {TORUS_MANDIBULARIS_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Palatum */}
                <div>
                    <Label
                        htmlFor="palatum"
                        className="text-xs font-medium text-gray-700"
                    >
                        Palatum
                    </Label>
                    <Select
                        value={palatum}
                        onValueChange={setPalatum}
                        disabled={!canEdit || isLoading}
                    >
                        <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Pilih palatum" />
                        </SelectTrigger>
                        <SelectContent>
                            {PALATUM_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Diastema */}
                <div>
                    <Label
                        htmlFor="diastema"
                        className="text-xs font-medium text-gray-700"
                    >
                        Diastema
                    </Label>
                    <Textarea
                        id="diastema"
                        value={diastema}
                        onChange={(e) => setDiastema(e.target.value)}
                        placeholder="Jelaskan dimana dan berapa lebarnya"
                        rows={2}
                        className="mt-1"
                        disabled={!canEdit || isLoading}
                    />
                </div>

                {/* Gigi Anomali */}
                <div>
                    <Label
                        htmlFor="gigi_anomali"
                        className="text-xs font-medium text-gray-700"
                    >
                        Gigi Anomali
                    </Label>
                    <Textarea
                        id="gigi_anomali"
                        value={gigiAnomali}
                        onChange={(e) => setGigiAnomali(e.target.value)}
                        placeholder="Jelaskan gigi yang mana dan bentuknya"
                        rows={2}
                        className="mt-1"
                        disabled={!canEdit || isLoading}
                    />
                </div>

                {/* Others */}
                <div>
                    <Label
                        htmlFor="others"
                        className="text-xs font-medium text-gray-700"
                    >
                        Lainnya
                    </Label>
                    <Textarea
                        id="others"
                        value={others}
                        onChange={(e) => setOthers(e.target.value)}
                        placeholder="Hal-hal yang tidak tercakup diatas"
                        rows={2}
                        className="mt-1"
                        disabled={!canEdit || isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default OdontogramMetadata;
