import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "@inertiajs/react";

export default function HeroSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { triggerOnce: true, threshold: 0.2 });

    return (
        <section
            ref={ref}
            className="relative bg-[#1D1912] text-white py-16 px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center"
        >
            {/* Kiri - Teks */}
            <div className="md:w-1/2 text-center md:text-left">
                <motion.h1
                    className="text-4xl md:text-5xl font-bold leading-tight"
                    initial={{ opacity: 0, y: -50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    Senyum Sehat, Hidup Bahagia
                </motion.h1>
                <motion.p
                    className="mt-4 text-lg text-gray-300"
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1 }}
                >
                    Perawatan gigi terbaik untuk senyum lebih percaya diri.
                    Dapatkan konsultasi gratis sekarang!
                </motion.p>
                <motion.div
                    className="mt-6 flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1.2 }}
                >
                    <Link
                        href={route("login")}
                        className="bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300"
                    >
                        Buat Janji Sekarang
                    </Link>
                </motion.div>
            </div>

            {/* Kanan - Gambar */}
            <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                <motion.img
                    src="/images/3kdc.png"
                    alt="Klinik Gigi 3K Dental Care"
                    className="w-80 md:w-96 lg:w-[450px] rounded-lg shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 1 }}
                />
            </div>
        </section>
    );
}
