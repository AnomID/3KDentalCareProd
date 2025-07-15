import { motion } from "framer-motion";
import Button from "./Button";

const images = [
    "/images/drg.bawa.png",
    "/images/drg.aprillia.png",
    "/images/drg.aulia.png",
    "/images/drg.ghozzy.png",
    "/images/drg.suaeni.png",
];

export default function DocterSection() {
    return (
        <div className="relative py-10 lg:py-16 overflow-hidden bg-gradient-to-b from-[#1D1912] to-[#BB8525]">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="sm:max-w-lg text-center mx-auto"
                >
                    <h1 className="text-4xl font-bold tracking-tight text-[#F3F3E6] sm:text-6xl">
                        Dokter Gigi Kami Yang Profesional
                    </h1>
                    <p className="mt-4 text-lg text-[#EECD5C]">
                        Temui dokter profesional kami yang siap memberikan
                        layanan terbaik untuk Anda.
                    </p>
                </motion.div>

                {/* Carousel */}
                <div className="mt-12 lg:mt-16 overflow-hidden relative">
                    <motion.div
                        className="flex space-x-6 lg:space-x-8"
                        animate={{ x: ["0%", "-100%"] }}
                        transition={{
                            repeat: Infinity,
                            duration: 15,
                            ease: "linear",
                        }}
                    >
                        {[...images, ...images].map((src, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                                className="w-40 sm:w-52 md:w-60 lg:w-72 h-56 sm:h-64 md:h-72 lg:h-80 rounded-lg shadow-lg overflow-hidden flex-shrink-0 bg-transparent"
                            >
                                <img
                                    src={src}
                                    alt=""
                                    className="w-full h-full object-contain"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="mt-10 text-center"
                >
                    <div className="flex flex-col items-left gap-2 mt-5 z-10">
                        <Button size="md" href="/">
                            {" "}
                            Dokter Pilihan Kami{" "}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
