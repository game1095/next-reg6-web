"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PhoneNumbersPage() {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- Search State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    // --- Mock Data ---
    const [phoneData, setPhoneData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    // --- Load Favorites from LocalStorage ---
    useEffect(() => {
        const storedFavs = localStorage.getItem("phoneDataFavorites");
        if (storedFavs) {
            setFavorites(new Set(JSON.parse(storedFavs)));
        }
    }, []);

    // --- Data Loading ---
    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('phone_numbers')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching phone numbers:', error);
            } else {
                setPhoneData(data || []);
            }
        };

        fetchData();
    }, []);

    // --- Toggle Favorite ---
    const toggleFavorite = (id: number) => {
        const newFavs = new Set(favorites);
        if (newFavs.has(id)) {
            newFavs.delete(id);
        } else {
            newFavs.add(id);
        }
        setFavorites(newFavs);
        localStorage.setItem("phoneDataFavorites", JSON.stringify(Array.from(newFavs)));
    };

    // --- Navigation Items ---
    const navItems = [
        { name: "หน้าหลัก", href: "/", active: false },
        { name: "ข่าวประชาสัมพันธ์", href: "/#news", active: false },
        { name: "สรุปผลการดำเนินงาน", href: "/#dashboard", active: false },
        { name: "หนังสือเวียน", href: "/#circular", active: false },
        {
            name: "รวมระบบไปรษณีย์/คู่มือ",
            href: "/postal-systems",
            active: false,
            target: "_blank",
        },
        { name: "หมายเลขโทรศัพท์", href: "/phone-numbers", active: true },
        { name: "เข้าสู่ระบบ", href: "/#", active: false },
    ];

    // --- Scroll Effect ---
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- Search & Sort Logic ---
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        let result = phoneData.filter((item) => {
            return (
                item.office_name.toLowerCase().includes(term) ||
                item.zip_code.includes(term)
            );
        });

        // Sort: Favorites first, then by ID (or original order)
        result.sort((a, b) => {
            const favA = favorites.has(a.id) ? 1 : 0;
            const favB = favorites.has(b.id) ? 1 : 0;
            if (favA !== favB) return favB - favA; // True (1) comes before False (0)
            return a.id - b.id;
        });

        setFilteredData(result);
    }, [searchTerm, phoneData, favorites]);

    return (
        <div className="min-h-screen w-full bg-[#FAFAFA] text-gray-800 font-sans flex flex-col relative">
            {/* BACKGROUND GRAPHICS */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-gray-900 to-[#FAFAFA] z-0"></div>

            {/* ✅ NAVBAR */}
            <nav
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
                    ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-md py-2"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="w-full px-6 md:px-10 h-16 flex justify-between items-center">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-4 group flex-shrink-0">
                        <div className="relative">
                            <div className="relative w-12 h-12 bg-gradient-to-br from-[#ED1C24] to-rose-600 text-white flex items-center justify-center rounded-xl shadow-lg ring-2 ring-white/20">
                                <svg className="w-7 h-7 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 8l8 5 8-5V19H4V8zM20 6H4l8 5 8-5z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-black text-lg md:text-xl xl:text-2xl leading-none tracking-tight transition-colors duration-300 ${isScrolled ? "text-gray-900" : "text-white"}`}>
                                สำนักงานไปรษณีย์เขต 6
                            </span>
                            <span className={`text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase mt-0.5 transition-colors duration-300 ${isScrolled ? "text-gray-500" : "text-gray-200"}`}>
                                REGIONAL POSTAL BUREAU (REGION 6)
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className={`hidden xl:flex items-center px-1 py-1 rounded-full border shadow-sm transition-all duration-500 ${isScrolled
                        ? "bg-white/50 backdrop-blur-sm border-gray-200/50"
                        : "bg-black/20 backdrop-blur-md border-white/10"
                        }`}>
                        {navItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                target={item.target}
                                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${item.active
                                    ? "bg-[#ED1C24] text-white shadow-md"
                                    : isScrolled
                                        ? "text-gray-600 hover:text-[#ED1C24] hover:bg-white"
                                        : "text-gray-100 hover:text-white hover:bg-white/20"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className={`xl:hidden p-2 rounded-lg transition-colors ${isScrolled ? "text-gray-800" : "text-white"
                            }`}
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-white animate-fade-in-up">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <span className="text-xl font-black text-gray-900">เมนูหลัก</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-red-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 px-6 space-y-2">
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center justify-between py-3 text-lg font-bold ${item.active ? "text-[#ED1C24]" : "text-gray-700 hover:text-[#ED1C24]"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <main className="relative z-10 container mx-auto px-4 md:px-6 pt-32 pb-20">

                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-red-500/10 text-red-500 text-xs font-bold tracking-widest uppercase mb-4 border border-red-500/20">
                        Data Service
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                        หมายเลขโทรศัพท์
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                        ค้นหาข้อมูลเบอร์โทรศัพท์ที่ทำการไปรษณีย์ในสังกัด สำนักงานไปรษณีย์เขต 6
                    </p>
                </div>

                {/* SEARCH BAR CARD */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 mb-10 max-w-4xl mx-auto transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Input */}
                        <div className="w-full relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">ค้นหา (ชื่อที่ทำการ / รหัสไปรษณีย์)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#ED1C24] focus:border-[#ED1C24] block w-full pl-10 p-3.5 font-medium placeholder-gray-400 hover:bg-gray-100 transition-colors"
                                    placeholder="พิมพ์ชื่อที่ทำการ หรือ รหัสไปรษณีย์..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>


                    </div>
                </div>

                {/* DATA DISPLAY */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-black text-gray-500 tracking-wider">
                                <tr>
                                    <th scope="col" className="w-12 px-2 py-4 text-center"></th>
                                    <th scope="col" className="px-6 py-4">ชื่อที่ทำการ</th>
                                    <th scope="col" className="px-6 py-4">รหัสไปรษณีย์</th>
                                    <th scope="col" className="px-6 py-4">ตำแหน่ง</th>
                                    <th scope="col" className="px-6 py-4">สังกัด</th>
                                    <th scope="col" className="px-6 py-4">เบอร์โทรศัพท์</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-red-50/50 transition-colors">
                                            <td className="px-2 py-4 text-center">
                                                <button
                                                    onClick={() => toggleFavorite(item.id)}
                                                    className={`p-1.5 rounded-lg transition-all transform active:scale-95 ${favorites.has(item.id)
                                                        ? "text-[#ED1C24] bg-red-50 hover:bg-red-100"
                                                        : "text-gray-300 hover:text-yellow-400 hover:bg-yellow-50"
                                                        }`}
                                                    title={favorites.has(item.id) ? "นำออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
                                                >
                                                    <svg className="w-6 h-6" fill={favorites.has(item.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{item.office_name}</td>
                                            <td className="px-6 py-4 font-medium text-gray-500">
                                                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm font-mono">
                                                    {item.zip_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{item.title}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{item.dept}</td>
                                            <td className="px-6 py-4 text-[#ED1C24] font-bold font-mono text-lg">
                                                {item.phone}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                                            ไม่พบข้อมูล
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {filteredData.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredData.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col gap-3 hover:bg-red-50/30 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg mb-1">{item.office_name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono font-bold">
                                                        {item.zip_code}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">•</span>
                                                    <span className="text-gray-500 text-sm">{item.dept}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleFavorite(item.id)}
                                                className={`p-2 -mr-2 rounded-lg transition-colors ${favorites.has(item.id)
                                                    ? "text-[#ED1C24] bg-red-50"
                                                    : "text-gray-300 hover:text-yellow-400"
                                                    }`}
                                            >
                                                <svg className="w-6 h-6" fill={favorites.has(item.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">ตำแหน่ง</span>
                                                <span className="text-gray-700 font-medium">{item.title || "-"}</span>
                                            </div>
                                            <a href={`tel:${item.phone}`} className="flex items-center gap-2 bg-red-50 text-[#ED1C24] px-4 py-2 rounded-xl font-bold font-mono text-lg hover:bg-[#ED1C24] hover:text-white transition-all shadow-sm">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {item.phone}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-400 font-medium">
                                ไม่พบข้อมูล
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                        <span>แสดง {filteredData.length} รายการ</span>
                        {/* Pagination (Mock) */}
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>ก่อนหน้า</button>
                            <button className="px-3 py-1 bg-[#ED1C24] text-white border border-[#ED1C24] rounded shadow-sm">1</button>
                            <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 opacity-50 cursor-not-allowed">2</button>
                            <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>ถัดไป</button>
                        </div>
                    </div>
                </div>

            </main>

        </div>
    );
}
