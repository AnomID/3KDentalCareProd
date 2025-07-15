import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import { Heart, Droplet, AlertTriangle } from "lucide-react";

const MedicalHistorySection = ({
    formData,
    bloodTypes,
    onChange,
    onSubmit,
    onBack,
    medicalHistory,
    canEdit,
    onNext,
}) => {
    // Helper function to render condition field with checkbox and textarea
    const renderConditionField = (label, fieldName, icon = null) => {
        const hasCondition = formData[`has_${fieldName}`];

        return (
            <div className="mb-4">
                <div className="flex items-center mb-2">
                    <Checkbox
                        id={`has_${fieldName}`}
                        name={`has_${fieldName}`}
                        checked={hasCondition}
                        onCheckedChange={(checked) => {
                            onChange({
                                target: {
                                    name: `has_${fieldName}`,
                                    type: "checkbox",
                                    checked,
                                },
                            });
                        }}
                        className="mr-2"
                        disabled={!canEdit}
                    />
                    <Label
                        htmlFor={`has_${fieldName}`}
                        className="ml-2 text-sm font-medium text-gray-700"
                    >
                        {label}
                    </Label>
                </div>
                {hasCondition && (
                    <div className="ml-6">
                        <Textarea
                            name={`${fieldName}_note`}
                            value={formData[`${fieldName}_note`]}
                            onChange={onChange}
                            rows="2"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                            placeholder={`Catatan tentang ${label}`}
                            disabled={!canEdit}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {medicalHistory
                            ? "Edit Riwayat Medis"
                            : "Buat Riwayat Medis Baru"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <Label
                                htmlFor="blood_type"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Golongan Darah
                            </Label>
                            <Select
                                value={formData.blood_type || "placeholder"}
                                onValueChange={(value) => {
                                    // Don't set the placeholder value in the actual form data
                                    if (value !== "placeholder") {
                                        onChange({
                                            target: {
                                                name: "blood_type",
                                                value,
                                            },
                                        });
                                    }
                                }}
                                disabled={!canEdit}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih golongan darah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Fixed: Changed empty string to a placeholder value */}
                                    <SelectItem value="placeholder">
                                        Pilih golongan darah
                                    </SelectItem>
                                    {bloodTypes &&
                                        bloodTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label
                                htmlFor="blood_pressure"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Tekanan Darah
                            </Label>
                            <Input
                                id="blood_pressure"
                                name="blood_pressure"
                                value={formData.blood_pressure || ""}
                                onChange={onChange}
                                placeholder="contoh: 120/80"
                                className="w-full"
                                disabled={!canEdit}
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="blood_pressure_status"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Status Tekanan Darah
                            </Label>
                            <Select
                                value={formData.blood_pressure_status}
                                onValueChange={(value) =>
                                    onChange({
                                        target: {
                                            name: "blood_pressure_status",
                                            value,
                                        },
                                    })
                                }
                                disabled={!canEdit}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">
                                        Normal
                                    </SelectItem>
                                    <SelectItem value="hypertension">
                                        Hipertensi
                                    </SelectItem>
                                    <SelectItem value="hypotension">
                                        Hipotensi
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                            <Heart size={18} className="mr-2 text-red-500" />
                            Riwayat Penyakit
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    {renderConditionField(
                                        "Penyakit Jantung",
                                        "heart_disease",
                                        <Heart />
                                    )}
                                    {renderConditionField(
                                        "Diabetes",
                                        "diabetes"
                                    )}
                                    {renderConditionField(
                                        "Hemofilia",
                                        "hemophilia"
                                    )}
                                </div>
                                <div>
                                    {renderConditionField(
                                        "Hepatitis",
                                        "hepatitis"
                                    )}
                                    {renderConditionField(
                                        "Gastritis",
                                        "gastritis"
                                    )}
                                    {renderConditionField(
                                        "Penyakit Lainnya",
                                        "other_disease"
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                            <AlertTriangle
                                size={18}
                                className="mr-2 text-amber-500"
                            />
                            Riwayat Alergi
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    {renderConditionField(
                                        "Alergi Obat",
                                        "drug_allergy"
                                    )}
                                </div>
                                <div>
                                    {renderConditionField(
                                        "Alergi Makanan",
                                        "food_allergy"
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                        >
                            Kembali
                        </Button>
                        {canEdit && (
                            <Button type="submit">
                                {medicalHistory
                                    ? "Perbarui & Lanjutkan"
                                    : "Simpan & Lanjutkan"}
                            </Button>
                        )}
                        {!canEdit && (
                            <Button type="button" onClick={() => onNext()}>
                                Lanjutkan
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </form>
    );
};

export default MedicalHistorySection;
