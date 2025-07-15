// resources/js/Pages/Dokter/ExaminationPanel/components/Odontogram/OdontogramNotes.jsx
import React from "react";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";

const OdontogramNotes = ({
    generalNotes,
    setGeneralNotes,
    canEdit = true,
    isLoading = false,
}) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="general_notes" className="font-medium">
                Catatan Umum
            </Label>
            <Textarea
                id="general_notes"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Catatan umum tentang kondisi gigi pasien"
                rows={3}
                disabled={!canEdit || isLoading}
            />
            <p className="text-xs text-gray-500">
                Tambahkan catatan tambahan terkait kondisi gigi pasien yang
                tidak dapat direpresentasikan dalam odontogram.
            </p>
        </div>
    );
};

export default OdontogramNotes;
