import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Printer, Download } from "lucide-react";

const OdontogramPrintView = ({
    odontogram,
    patient,
    doctor,
    appointment,
    odontogramData,
    statistics,
}) => {
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        // This would typically use a PDF generation library
        // For now, we'll just trigger the print dialog
        window.print();
    };

    return (
        <div className="space-y-4">
            {/* Print Controls */}
            <div className="flex justify-end space-x-2 print:hidden">
                <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="flex items-center gap-2"
                >
                    <Printer size={16} />
                    Cetak
                </Button>
                <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2"
                >
                    <Download size={16} />
                    Download PDF
                </Button>
            </div>

            {/* Print Content */}
            <div className="print:block">
                <style jsx>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area,
                        .print-area * {
                            visibility: visible;
                        }
                        .print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        @page {
                            size: A4;
                            margin: 1cm;
                        }
                    }
                `}</style>

                <div className="print-area space-y-6">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold">ODONTOGRAM</h1>
                        <p className="text-lg">Rekam Medis Gigi</p>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2">
                                Informasi Pasien
                            </h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-1">Nama</td>
                                        <td className="py-1">
                                            : {patient?.name}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">Umur</td>
                                        <td className="py-1">
                                            : {patient?.age || "-"} tahun
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">Jenis Kelamin</td>
                                        <td className="py-1">
                                            :{" "}
                                            {patient?.gender === "male"
                                                ? "Laki-laki"
                                                : "Perempuan"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">
                                Informasi Pemeriksaan
                            </h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-1">Dokter</td>
                                        <td className="py-1">
                                            : {doctor?.name}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">Tanggal</td>
                                        <td className="py-1">
                                            :{" "}
                                            {new Date(
                                                odontogram?.examination_date
                                            ).toLocaleDateString("id-ID")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-1">Status</td>
                                        <td className="py-1">
                                            :{" "}
                                            {odontogram?.is_finalized
                                                ? "Final"
                                                : "Draft"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* DMFT Summary */}
                    {statistics?.dmft && (
                        <div>
                            <h3 className="font-semibold mb-2">
                                Ringkasan DMF-T
                            </h3>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div className="border p-2">
                                    <div className="text-xl font-bold text-red-600">
                                        {statistics.dmft.decayed}
                                    </div>
                                    <div className="text-sm">Decay (D)</div>
                                </div>
                                <div className="border p-2">
                                    <div className="text-xl font-bold text-orange-600">
                                        {statistics.dmft.missing}
                                    </div>
                                    <div className="text-sm">Missing (M)</div>
                                </div>
                                <div className="border p-2">
                                    <div className="text-xl font-bold text-blue-600">
                                        {statistics.dmft.filled}
                                    </div>
                                    <div className="text-sm">Filled (F)</div>
                                </div>
                                <div className="border p-2">
                                    <div className="text-xl font-bold">
                                        {statistics.dmft.total}
                                    </div>
                                    <div className="text-sm">Total</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div>
                        <h3 className="font-semibold mb-2">
                            Metadata Odontogram
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="py-1">Occlusion</td>
                                            <td className="py-1">
                                                : {odontogram?.occlusion || "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-1">
                                                Torus Palatinus
                                            </td>
                                            <td className="py-1">
                                                :{" "}
                                                {odontogram?.torus_palatinus ||
                                                    "-"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="py-1">
                                                Torus Mandibularis
                                            </td>
                                            <td className="py-1">
                                                :{" "}
                                                {odontogram?.torus_mandibularis ||
                                                    "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-1">Palatum</td>
                                            <td className="py-1">
                                                : {odontogram?.palatum || "-"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {odontogram?.diastema && (
                            <div className="mt-2">
                                <strong>Diastema:</strong> {odontogram.diastema}
                            </div>
                        )}

                        {odontogram?.gigi_anomali && (
                            <div className="mt-2">
                                <strong>Gigi Anomali:</strong>{" "}
                                {odontogram.gigi_anomali}
                            </div>
                        )}
                    </div>

                    {/* General Notes */}
                    {odontogram?.general_notes && (
                        <div>
                            <h3 className="font-semibold mb-2">Catatan Umum</h3>
                            <div className="border p-3 rounded text-sm">
                                {odontogram.general_notes}
                            </div>
                        </div>
                    )}

                    {/* Conditions Table */}
                    {odontogramData?.conditions &&
                        odontogramData.conditions.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">
                                    Detail Kondisi Gigi
                                </h3>
                                <table className="w-full border-collapse border text-xs">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-left">
                                                Gigi
                                            </th>
                                            <th className="border p-2 text-left">
                                                Kondisi
                                            </th>
                                            <th className="border p-2 text-left">
                                                Diagnosis
                                            </th>
                                            <th className="border p-2 text-left">
                                                Perawatan
                                            </th>
                                            <th className="border p-2 text-left">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {odontogramData.conditions.map(
                                            (condition, index) => (
                                                <tr key={index}>
                                                    <td className="border p-2">
                                                        {condition.tooth_number}
                                                        {condition.surface &&
                                                            `-${condition.surface}`}
                                                    </td>
                                                    <td className="border p-2">
                                                        {
                                                            condition.condition_code
                                                        }
                                                    </td>
                                                    <td className="border p-2">
                                                        {condition.diagnosis
                                                            ?.name || "-"}
                                                    </td>
                                                    <td className="border p-2">
                                                        {condition
                                                            .plannedTreatment
                                                            ?.name || "-"}
                                                    </td>
                                                    <td className="border p-2">
                                                        {condition.treatment_status ===
                                                        "completed"
                                                            ? "Selesai"
                                                            : condition.treatment_status ===
                                                              "in_progress"
                                                            ? "Berlangsung"
                                                            : condition.treatment_status ===
                                                              "not_started"
                                                            ? "Belum Mulai"
                                                            : "-"}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    {/* Footer */}
                    <div className="text-right pt-8">
                        <div className="inline-block">
                            <p className="mb-16">Dokter Gigi,</p>
                            <p className="border-t pt-2">{doctor?.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OdontogramPrintView;
