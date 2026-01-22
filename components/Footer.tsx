import Link from "next/link";
import { MapPin, Phone, Globe } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#1F4E79] text-white border-t border-white/10">
            <div className="w-full px-4 md:px-12 lg:px-20 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

                    <div className="lg:col-span-3 space-y-6">
                        <Link href="/" className="group inline-block">
                            <span className="text-3xl font-black tracking-tighter transition-transform group-hover:scale-105 block">
                                EXTRARANGO
                            </span>
                        </Link>
                    </div>

                    <div className="lg:col-span-4">
                        <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-white/40">Contacto</h4>
                        <ul className="space-y-5">
                            <li className="flex items-center gap-4 group">
                                <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
                                    <Phone size={18} className="text-emerald-400" />
                                </div>
                                <a href="tel:+542615542045" className="text-sm text-white/80 hover:text-white transition-colors font-medium">
                                    +54 261 5542045
                                </a>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
                                    <MapPin size={18} className="text-emerald-400" />
                                </div>
                                <div className="text-sm text-white/80 leading-snug">
                                    <p className="font-semibold text-white">Sede Central</p>
                                    <span>Córdoba 270, Ciudad de Mendoza</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="md:col-span-2 lg:col-span-5">
                        <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-white/40">Nuestra Ubicación</h4>
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group h-[200px] w-full">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3350.457853616641!2d-68.8396262!3d-32.8851419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e09191d8e1247%3A0x6334a1708892f3e8!2sC%C3%B3rdoba%20270%2C%20M5500%20Mendoza!5e0!3m2!1ses-419!2sar!4v1700000000000"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'grayscale(0.4) contrast(1.2) brightness(0.9)' }}
                                allowFullScreen={true}
                                loading="lazy"
                                className="transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                            ></iframe>
                            <div className="absolute inset-0 pointer-events-none border-[8px] border-white/5 rounded-2xl"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-1 order-2 md:order-1 text-center md:text-left">
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">
                            © {new Date().getFullYear()} EXTRARANGO
                        </p>
                    </div>

                    <div className="order-1 md:order-2">
                        <a
                            href="https://instagram.com/pablopenoff"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1"
                        >
                            <span className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Desarrollado por</span>
                            <span className="text-[11px] text-white/50 group-hover:text-emerald-400 font-medium transition-colors duration-300 tracking-wider">
                                PABLO PENOFF
                            </span>
                        </a>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 items-center order-3">
                        <div className="flex items-center gap-2 text-[11px] text-white/40">
                            <Globe size={12} className="text-emerald-500/50" />
                            <span>Mendoza, Argentina</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
                        <span className="text-[10px] text-white/20 font-mono tracking-tighter">
                            SEC. 1 — M5500
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}