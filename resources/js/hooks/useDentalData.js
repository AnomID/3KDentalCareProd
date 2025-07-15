import { useState, useEffect } from "react";

export const useDentalData = () => {
    const [diagnoses, setDiagnoses] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [icdCodes, setIcdCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            try {
                const [diagnosesRes, treatmentsRes, icdRes] = await Promise.all(
                    [
                        fetch(route("api.dental-diagnoses")),
                        fetch(route("api.dental-treatments")),
                        fetch(route("api.icd10-codes.search")),
                    ]
                );

                if (diagnosesRes.ok) {
                    const diagnosesData = await diagnosesRes.json();
                    setDiagnoses(diagnosesData.data || []);
                }

                if (treatmentsRes.ok) {
                    const treatmentsData = await treatmentsRes.json();
                    setTreatments(treatmentsData.data || []);
                }

                if (icdRes.ok) {
                    const icdData = await icdRes.json();
                    setIcdCodes(icdData.data || []);
                }
            } catch (error) {
                console.error("Error loading dental data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return {
        diagnoses,
        treatments,
        icdCodes,
        isLoading,
    };
};
