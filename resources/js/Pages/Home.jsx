import AppLayout from "@/Layouts/AppLayout";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Footer from "@/Components/Footer";
import AboutSection from "@/Components/AboutSection";
import ServicesSection from "@/Components/ServicesSection";
import DocterSection from "@/Components/DocterSection";
import HeroSection from "@/Components/HeroSection";
export default function Home() {
    const images = [
        "/images/banner1.png",
        "/images/banner2.png",
        "/images/banner3.jpg",
    ];

    return (
        <AppLayout>
            {/* SLIDESHOW */}
            <section id="home">
                <div className="w-full">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay, EffectFade]}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 2000, disableOnInteraction: false }}
                        loop
                        effect="fade"
                        speed={1000}
                        className="w-full h-[600px]"
                    >
                        {images.map((src, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={src}
                                    alt={`Slide ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
            {/* Content  */}
            <section id="hero">
                <HeroSection />
            </section>
            <section id="tentang">
                <AboutSection />
            </section>

            <section id="layanan">
                <ServicesSection />
            </section>
            <section id="dokter">
                <DocterSection />
            </section>

            {/* Footer */}
            <section id="kontak">
                <Footer />
            </section>
        </AppLayout>
    );
}
