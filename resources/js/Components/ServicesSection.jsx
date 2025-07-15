import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Button from "./Button";

const services = [
    {
        title: "3KDC Prosthodonti",
        description: "Membersihkan plak dan karang gigi untuk kesehatan mulut.",
        img: "/images/s.prosthodonti.jpg",
        link: "/layanan/pembersihan-gigi",
    },
    {
        title: "3KDC Bedah Mulut",
        description: "Pemutihan gigi profesional untuk senyum cerah.",
        img: "/images/s.bedah-mulut.jpg",
        link: "/layanan/pemutihan-gigi",
    },
    {
        title: "3KDC Perawatan Gigi Anak",
        description: "Perawatan khusus untuk anak-anak agar gigi tetap sehat.",
        img: "/images/s.dental-child.jpg",
        link: "/layanan/perawatan-anak",
    },
    {
        title: "3KDC Konservasi Gigi",
        description: "Perawatan untuk mempertahankan struktur asli gigi.",
        img: "/images/s.conservation.jpeg",
        link: "/layanan/konservasi-gigi",
    },
    {
        title: "3KDC Orthodonti",
        description: "Pemasangan behel untuk merapikan gigi.",
        img: "/images/s.orthodenti.jpeg",
        link: "/layanan/perawatan-ortodonti",
    },
    {
        title: "3KDC Direct Veneer",
        description: "Solusi veneer untuk gigi yang lebih indah.",
        img: "/images/s.veneer.jpg",
        link: "/layanan/direct-veneer",
    },
];

export default function ServicesSection() {
    return (
        <section
            id="dental-services"
            className="relative w-full py-0 mb-24 z-10"
        >
            {/* Swiper Slideshow */}
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 3000 }}
                pagination={{ clickable: true }}
                className="w-full h-[500px] pb-24"
            >
                {services.map((service, index) => (
                    <SwiperSlide key={index}>
                        {/* Tambahkan animasi agar aktif setiap kali slide masuk viewport */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: false, amount: 0.3 }} // Aktif setiap kali masuk viewport
                            className="relative w-full h-[500px] flex items-center justify-center"
                        >
                            {/* Background Image with Gradient Overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${service.img})`,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20"></div>
                            </div>

                            {/* Text Content */}
                            <div className="relative z-10 text-center px-6 max-w-3xl">
                                <h2 className="text-4xl font-bold text-white">
                                    {service.title}
                                </h2>
                                <p className="text-lg text-gray-300 mt-3">
                                    {service.description}
                                </p>
                                <div className="flex flex-col items-left gap-2 mt-5 z-10">
                                    <Button size="md" href="/">
                                        {" "}
                                        Informasi Lanjut{" "}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
