import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";
import {
    BarChart3,
    TrendingUp,
    Activity,
    Clock,
    CheckCircle,
    AlertTriangle,
    DollarSign,
} from "lucide-react";

const OdontogramSummary = ({ odontogramData, statistics }) => {
    // Calculate DMFT if available
    const dmftData = statistics?.dmft || {
        decayed: 0,
        missing: 0,
        filled: 0,
        total: 0,
    };

    // Calculate percentages for progress bars
    const totalTeeth = 32; // Adult teeth
    const healthyTeeth = totalTeeth - dmftData.total;
    const healthyPercentage = (healthyTeeth / totalTeeth) * 100;

    // Treatment statistics
    const treatmentStats = {
        total: statistics?.tooth_conditions_count || 0,
        diagnosed: statistics?.diagnosed_conditions || 0,
        planned: statistics?.planned_treatments || 0,
        completed: statistics?.completed_treatments || 0,
    };

    // Calculate treatment progress
    const treatmentProgress =
        treatmentStats.total > 0
            ? (treatmentStats.completed / treatmentStats.total) * 100
            : 0;

    // Get urgent conditions count
    const urgentCount =
        odontogramData?.conditions?.filter((c) => c.priority === "urgent")
            .length || 0;

    // Calculate estimated total cost
    const totalCost =
        odontogramData?.conditions?.reduce((sum, condition) => {
            return sum + (parseFloat(condition.treatment_cost) || 0);
        }, 0) || 0;

    return (
        <div className="space-y-4">
            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    DMF-T Score
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {dmftData.total}
                                </p>
                                <p className="text-xs text-gray-500">
                                    dari 32 gigi
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Kondisi Gigi
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {treatmentStats.total}
                                </p>
                                <p className="text-xs text-gray-500">
                                    total kondisi
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Perawatan Selesai
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {treatmentStats.completed}
                                </p>
                                <p className="text-xs text-gray-500">
                                    dari {treatmentStats.planned} rencana
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Estimasi Biaya
                                </p>
                                <p className="text-lg font-bold text-orange-600">
                                    Rp{" "}
                                    {new Intl.NumberFormat("id-ID").format(
                                        totalCost
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                    total rencana
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card> */}
            </div>

            {/* DMFT Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                        <TrendingUp className="mr-2" size={16} />
                        Analisis DMF-T (Decayed, Missing, Filled Teeth)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {dmftData.decayed}
                            </div>
                            <div className="text-sm text-gray-600">
                                Decay (D)
                            </div>
                            <div className="text-xs text-gray-500">
                                Gigi berlubang
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {dmftData.missing}
                            </div>
                            <div className="text-sm text-gray-600">
                                Missing (M)
                            </div>
                            <div className="text-xs text-gray-500">
                                Gigi hilang
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {dmftData.filled}
                            </div>
                            <div className="text-sm text-gray-600">
                                Filled (F)
                            </div>
                            <div className="text-xs text-gray-500">
                                Gigi ditambal
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {healthyTeeth}
                            </div>
                            <div className="text-sm text-gray-600">Healthy</div>
                            <div className="text-xs text-gray-500">
                                Gigi sehat
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Kesehatan Gigi Keseluruhan</span>
                            <span>{healthyPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={healthyPercentage} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Treatment Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center">
                            <Clock className="mr-2" size={16} />
                            Progress Perawatan
                        </div>
                        {urgentCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="flex items-center"
                            >
                                <AlertTriangle size={12} className="mr-1" />
                                {urgentCount} Urgen
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {treatmentStats.diagnosed}
                            </div>
                            <div className="text-sm text-gray-600">
                                Terdiagnosis
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">
                                {treatmentStats.planned}
                            </div>
                            <div className="text-sm text-gray-600">
                                Direncanakan
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                                {treatmentStats.completed}
                            </div>
                            <div className="text-sm text-gray-600">Selesai</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress Perawatan</span>
                            <span>{treatmentProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={treatmentProgress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Condition Distribution */}
            {odontogramData?.conditions &&
                odontogramData.conditions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Distribusi Kondisi Gigi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(
                                    odontogramData.conditions.reduce(
                                        (acc, condition) => {
                                            acc[condition.condition_code] =
                                                (acc[
                                                    condition.condition_code
                                                ] || 0) + 1;
                                            return acc;
                                        },
                                        {}
                                    )
                                ).map(([code, count]) => (
                                    <div
                                        key={code}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline">
                                                {code}
                                            </Badge>
                                            <span>
                                                {getConditionName(code)}
                                            </span>
                                        </div>
                                        <span className="font-medium">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
        </div>
    );
};

// Helper function to get condition name
const getConditionName = (code) => {
    const conditionNames = {
        AMF: "Tambalan Amalgam",
        COF: "Tambalan Composite",
        FIS: "Pit dan Fissure Sealant",
        NVT: "Gigi Non-Vital",
        RCT: "Perawatan Saluran Akar",
        NON: "Gigi Tidak Ada",
        UNE: "Un-Erupted",
        PRE: "Partial-Erupt",
        ANO: "Anomali",
        CARIES: "Karies",
        CFR: "Fraktur",
        FMC: "Full Metal Crown",
        POC: "Porcelain Crown",
        RRX: "Sisa Akar",
        MIS: "Gigi Hilang",
        IPX: "Implant",
        FRM_ACR: "Partial/Full Denture",
        BRIDGE: "Bridge",
    };

    return conditionNames[code] || code;
};

export default OdontogramSummary;
