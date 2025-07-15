import { motion } from "framer-motion";
import Button from "./Button";

export default function AboutSection() {
    return (
        <section className="relative py-24 px-6 bg-gradient-to-b from-[#1D1912] to-[#BB8525] text-white overflow-hidden">
            {/* Background Wave */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <svg
                    viewBox="0 0 1440 320"
                    className="absolute bottom-0 left-0"
                >
                    <path
                        fill="#D2A63C"
                        fillOpacity="1"
                        d="M0,128L60,128C120,128,240,128,360,160C480,192,600,256,720,272C840,288,960,256,1080,213.3C1200,171,1320,117,1380,90.7L1440,64V320H0Z"
                    ></path>
                </svg>
            </div>

            <div className="container mx-auto flex flex-col items-center text-center">
                {/* Judul Section */}
                <motion.h2
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="text-4xl md:text-5xl font-bold tracking-wide drop-shadow-lg"
                >
                    Tentang{" "}
                    <span className="text-[#EECD5C]">3K Dental Care</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="mt-4 text-lg leading-relaxed text-[#F3F3E6] max-w-2xl"
                >
                    Kami adalah klinik gigi modern yang menawarkan layanan
                    profesional dengan teknologi terkini untuk memastikan
                    kesehatan dan kecantikan senyum Anda.
                </motion.p>

                {/* Layanan List */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 max-w-3xl">
                    {[
                        { icon: "🦷", text: "Perawatan Gigi Umum" },
                        { icon: "✨", text: "Whitening & Veneer" },
                        { icon: "🔧", text: "Pemasangan Behel" },
                        { icon: "👨‍⚕️", text: "Konsultasi Profesional" },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: false, amount: 0.3 }}
                            className="flex items-center gap-3 p-4 rounded-lg bg-white/10 backdrop-blur-md shadow-md hover:bg-white/20 transition transform hover:scale-105"
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <p className="text-lg">{item.text}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tombol CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="mt-8"
                >
                    <Button size="md" href="/about">
                        Tentang Klinik Kami
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
