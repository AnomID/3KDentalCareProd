import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { motion, useAnimation } from "framer-motion";
import { Mail, Phone, MapPin, Youtube, Instagram } from "lucide-react";
import TiktokIcon from "./TiktokIcon";

export default function Footer() {
    const controls = useAnimation();
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const footer = document.getElementById("footer");
            if (footer) {
                const rect = footer.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - 100;
                setIsInView(isVisible);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        } else {
            controls.start("hidden");
        }
    }, [isInView, controls]);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    return (
        <motion.footer
            id="footer"
            className="relative bg-gradient-to-r from-[#231f20] to-[#8e793e] py-12 text-white1"
            initial="hidden"
            animate={controls}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 3K Dental Care */}
                <motion.div
                    className="bg-white/10 backdrop-blur-lg shadow-lg rounded-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-xl font-bold text-gold2">
                        3K Dental Care
                    </h3>
                    <p className="text-gray-300 mt-2">
                        Klinik gigi terbaik dengan layanan profesional dan
                        teknologi modern.
                    </p>
                    <div className="mt-4 space-y-2">
                        <p className="flex items-center gap-2">
                            <Mail size={20} className="text-gold2" />{" "}
                            info@3kdentalcare.com
                        </p>
                        <p className="flex items-center gap-2">
                            <Phone size={20} className="text-gold2" /> +62
                            812-3456-7890
                        </p>
                    </div>
                </motion.div>

                {/* Navigasi */}
                <motion.div
                    className="bg-white/10 backdrop-blur-lg shadow-lg rounded-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-xl font-bold text-gold2">Navigasi</h3>
                    <ul className="mt-2 space-y-2">
                        {[
                            "Home",
                            "Tentang Klinik",
                            "Layanan",
                            "Berita",
                            "Kontak",
                        ].map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={`/${item
                                        .toLowerCase()
                                        .replace(/\s/g, "")}`}
                                    className="text-gray-300 hover:text-gold2 transition duration-300 transform hover:scale-110"
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Media Sosial & Lokasi */}
                <motion.div
                    className="bg-white/10 backdrop-blur-lg shadow-lg rounded-lg p-6"
                    variants={itemVariants}
                >
                    <h3 className="text-xl font-bold text-gold2">Ikuti Kami</h3>
                    <div className="flex gap-4 mt-4">
                        {[
                            {
                                icon: Youtube,
                                link: "https://www.youtube.com/@3KDCSEMARANG/featured",
                            },
                            {
                                icon: Instagram,
                                link: "https://www.instagram.com/3k_dentalcare_semarang/",
                            },
                            {
                                icon: TiktokIcon,
                                link: "https://www.tiktok.com/@3kdcsemarang?is_from_webapp=1&sender_device=pc",
                            },
                        ].map((social, index) => (
                            <a
                                key={index}
                                href={social.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-white/20 backdrop-blur-lg rounded-full transition duration-300 hover:bg-gold1 hover:scale-110 hover:rotate-6"
                            >
                                <social.icon
                                    size={24}
                                    className="text-white1"
                                />
                            </a>
                        ))}
                    </div>

                    {/* Google Maps */}
                    <h3 className="text-xl font-bold text-gold2 mt-6">
                        Lokasi Kami
                    </h3>
                    <Link
                        href="https://maps.app.goo.gl/JwhogmNZdBBcUtgc7"
                        target="_blank"
                        className="flex items-center gap-2 mt-2 text-gray-300 hover:text-gold2 transition duration-300 transform hover:scale-105"
                    >
                        <MapPin size={20} className="text-gold2" /> Jl. Kh Ahmad
                        Dahlan No.9, Karangkidul, Kec. Semarang Tengah, Kota
                        Semarang, Jawa Tengah 50136, Indonesia
                    </Link>

                    {/* Embed Peta */}
                    <div className="mt-4 overflow-hidden rounded-lg shadow-lg">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.168587070438!2d110.42295887604597!3d-6.989414268451597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708bc9e64b992f%3A0xbc231184bd4376!2s3KDC%20Klinik%20Gigi%20Semarang!5e0!3m2!1sid!2sid!4v1740069974949!5m2!1sid!2sid"
                            width="100%"
                            height="180"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </motion.div>
            </div>

            {/* Hak Cipta */}
            <div className="mt-10 text-center text-gray-400 text-sm">
                © {new Date().getFullYear()} 3K Dental Care. Semua Hak
                Dilindungi.
            </div>
        </motion.footer>
    );
}
