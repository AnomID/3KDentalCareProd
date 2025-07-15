import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

export const useOdontogram = (odontogramId) => {
    const [data, setData] = useState({
        conditions: [],
        bridges: [],
        indicators: [],
    });
    const [statistics, setStatistics] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const loadData = useCallback(async () => {
        if (!odontogramId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                route("odontogram.get-canvas-data", odontogramId)
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            if (result.success) {
                setData(result.data);
                setStatistics(result.odontogram);
                setHasUnsavedChanges(false);
            } else {
                throw new Error(result.message || "Failed to load data");
            }
        } catch (err) {
            setError(err.message);
            toast.error(`Gagal memuat data: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [odontogramId]);

    const saveData = useCallback(
        async (silent = false) => {
            if (!odontogramId) return false;

            setIsLoading(true);
            setError(null);

            try {
                // Save conditions
                if (data.conditions.length > 0) {
                    const conditionsResponse = await fetch(
                        route("odontogram.save-tooth-conditions", odontogramId),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": document.querySelector(
                                    'meta[name="csrf-token"]'
                                ).content,
                            },
                            body: JSON.stringify({
                                conditions: data.conditions,
                            }),
                        }
                    );

                    if (!conditionsResponse.ok) {
                        const result = await conditionsResponse.json();
                        throw new Error(
                            result.message || "Failed to save conditions"
                        );
                    }
                }

                // Save bridges
                if (data.bridges.length > 0) {
                    const bridgesResponse = await fetch(
                        route("odontogram.save-tooth-bridges", odontogramId),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": document.querySelector(
                                    'meta[name="csrf-token"]'
                                ).content,
                            },
                            body: JSON.stringify({ bridges: data.bridges }),
                        }
                    );

                    if (!bridgesResponse.ok) {
                        const result = await bridgesResponse.json();
                        throw new Error(
                            result.message || "Failed to save bridges"
                        );
                    }
                }

                // Save indicators
                if (data.indicators.length > 0) {
                    const indicatorsResponse = await fetch(
                        route("odontogram.save-tooth-indicators", odontogramId),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": document.querySelector(
                                    'meta[name="csrf-token"]'
                                ).content,
                            },
                            body: JSON.stringify({
                                indicators: data.indicators,
                            }),
                        }
                    );

                    if (!indicatorsResponse.ok) {
                        const result = await indicatorsResponse.json();
                        throw new Error(
                            result.message || "Failed to save indicators"
                        );
                    }
                }

                setHasUnsavedChanges(false);

                if (!silent) {
                    toast.success("Data berhasil disimpan");
                }

                // Reload data
                await loadData();

                return true;
            } catch (err) {
                setError(err.message);

                if (!silent) {
                    toast.error(`Gagal menyimpan: ${err.message}`);
                }

                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [odontogramId, data, loadData]
    );

    const updateData = useCallback((newData) => {
        setData((prevData) => ({
            ...prevData,
            ...newData,
        }));
        setHasUnsavedChanges(true);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        data,
        statistics,
        isLoading,
        error,
        hasUnsavedChanges,
        loadData,
        saveData,
        updateData,
    };
};
