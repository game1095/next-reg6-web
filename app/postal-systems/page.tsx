"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient"; // ตรวจสอบ path นี้ให้ตรงกับโปรเจกต์คุณ

// --- Icons Components ---
const BackIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400 hover:text-gray-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`w-5 h-5 transition-colors duration-200 ${
      filled
        ? "text-yellow-400 fill-yellow-400"
        : "text-gray-300 group-hover:text-gray-400"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

// Logo Placeholder
const ThaiPostLogo = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8 text-[#ED1C24]"
    fill="currentColor"
  >
    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" />
  </svg>
);

// Department Icons (ปรับ ID ให้ตรงกับ Database ของ Admin)
const DeptIcon = ({ id }: { id: string }) => {
  switch (id) {
    case "FAV":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      );
    case "รป.":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      );
    case "ทข.":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      );
    case "ตล.":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      );
    case "บค.":
    case "อบ.":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      );
    case "ทพ.":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      );
    case "กง.":
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      );
    default:
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6h16M4 12h16M4 18h16"
        />
      );
  }
};

export default function PostalSystemsPage() {
  const [activeSection, setActiveSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  // State สำหรับเก็บข้อมูลจริงจาก DB
  const [dbSystems, setDbSystems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem("postalFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Fetch systems from Supabase
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const { data, error } = await supabase
          .from("postal_systems")
          .select("*")
          .eq("status", "published") // ดึงเฉพาะสถานะ Published
          .order("name");

        if (error) throw error;
        setDbSystems(data || []);
      } catch (error) {
        console.error("Error fetching systems:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystems();
  }, []);

  const toggleFavorite = (systemName: string) => {
    let newFavorites;
    if (favorites.includes(systemName)) {
      newFavorites = favorites.filter((name) => name !== systemName);
    } else {
      newFavorites = [...favorites, systemName];
    }
    setFavorites(newFavorites);
    localStorage.setItem("postalFavorites", JSON.stringify(newFavorites));
  };

  // โครงสร้างส่วนงาน (Static Config) แต่ระบบงาน (systems) จะดึงจาก DB
  const departmentConfig = [
    {
      id: "รป.",
      name: "ส่วนระบบไปรษณีย์และสารสนเทศ",
      shortName: "ส่วนระบบไปรษณีย์และสารสนเทศ",
      desc: "ดูแลระบบปฏิบัติการไปรษณีย์ เครือข่าย และอุปกรณ์คอมพิวเตอร์",
    },
    {
      id: "ทข.",
      name: "ส่วนทีมขายและดูแลลูกค้า",
      shortName: "ส่วนทีมขายและดูแลลูกค้า",
      desc: "บริหารงานขาย ลูกค้าองค์กร และคู่ค้าทางธุรกิจ",
    },
    {
      id: "ตล.",
      name: "ส่วนการตลาดและบริการลูกค้า",
      shortName: "ส่วนการตลาดและบริการลูกค้า",
      desc: "วางแผนการตลาด โปรโมชั่น และประชาสัมพันธ์",
    },
    {
      id: "บค.",
      name: "ส่วนบริการหลังการขายและคุณภาพ",
      shortName: "ส่วนบริการหลังการขายและคุณภาพ",
      desc: "งานบุคคล สวัสดิการพนักงาน และการพัฒนาบุคลากร",
    },
    {
      id: "อบ.",
      name: "ส่วนอำนวยการและบุคคล",
      shortName: "ส่วนอำนวยการและบุคคล",
      desc: "งานสารบรรณ ธุรการ และงานสนับสนุนองค์กร",
    },
    {
      id: "ทพ.",
      name: "ส่วนทรัพย์สินและพัสดุ",
      shortName: "ส่วนทรัพย์สินและพัสดุ",
      desc: "บริหารจัดการอาคาร สถานที่ ยานพาหนะ และพัสดุ",
    },
    {
      id: "กง.",
      name: "ส่วนการเงินและบัญชี",
      shortName: "ส่วนการเงินและบัญชี",
      desc: "ดูแลระบบการเงิน บัญชี และงบประมาณ",
    },
  ];

  // รวมข้อมูลจาก Config เข้ากับข้อมูลจริงจาก DB
  const departments = useMemo(() => {
    return departmentConfig.map((dept) => ({
      ...dept,
      systems: dbSystems
        .filter((sys) => sys.dept === dept.id)
        .map((sys) => ({
          name: sys.name,
          href: sys.url,
        })),
    }));
  }, [dbSystems]);

  // Logic for filtering by search
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;

    return departments
      .map((dept) => ({
        ...dept,
        systems: dept.systems.filter(
          (sys) =>
            sys.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((dept) => dept.systems.length > 0);
  }, [searchTerm, departments]);

  // Logic to find favorite systems objects
  const favoriteSystemsList = useMemo(() => {
    const allSystems = departments.flatMap((d) => d.systems);
    return allSystems.filter((sys) => favorites.includes(sys.name));
  }, [favorites, departments]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = departments.map((d) => document.getElementById(d.id));
      const scrollPosition = window.scrollY + 180;

      for (const section of sections) {
        if (
          section &&
          section.offsetTop <= scrollPosition &&
          section.offsetTop + section.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [departments]); // Re-run when departments loaded

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-slate-200 to-transparent opacity-40 -z-10 pointer-events-none"></div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="h-1 w-full bg-[#ED1C24]"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Logo & Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="group">
                  <div className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#ED1C24] group-hover:text-white transition-all duration-200">
                    <BackIcon />
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-px h-8 bg-gray-200 hidden md:block"></div>
                  <ThaiPostLogo />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                      ระบบงานไปรษณีย์
                    </h1>
                    <p className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase">
                      Postal Systems Hub
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="ค้นหาระบบงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent transition-all sm:text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Side Navigation */}
          {!searchTerm && (
            <aside className="lg:w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-32 z-30">
                <nav className="flex flex-col gap-1.5">
                  {/* Jump to Favorites Button (if has favorites) */}
                  {favorites.length > 0 && (
                    <button
                      onClick={() => scrollToSection("FAV")}
                      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 text-left w-full group overflow-hidden mb-2 border border-yellow-200 bg-yellow-50 text-yellow-700 hover:shadow-md hover:bg-yellow-100`}
                    >
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-white shadow-sm text-yellow-500">
                        <StarIcon filled={true} />
                      </div>
                      <span className="relative z-10 leading-snug">
                        รายการโปรด ({favorites.length})
                      </span>
                    </button>
                  )}

                  {departments.map((dept) => {
                    const isActive = activeSection === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => scrollToSection(dept.id)}
                        className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 text-left w-full group overflow-hidden ${
                          isActive
                            ? "bg-[#ED1C24] text-white shadow-lg shadow-red-200"
                            : "text-gray-600 hover:bg-white hover:shadow-md hover:text-[#ED1C24] bg-transparent"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white text-gray-400 group-hover:text-[#ED1C24] shadow-sm"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <DeptIcon id={dept.id} />
                          </svg>
                        </div>
                        <span className="relative z-10 leading-snug">
                          {dept.shortName}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
          )}

          {/* Mobile Navigation */}
          {!searchTerm && (
            <div className="lg:hidden">
              <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide -mx-4 px-4 snap-x">
                {favorites.length > 0 && (
                  <button
                    onClick={() => scrollToSection("FAV")}
                    className="flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    ★ รายการโปรด
                  </button>
                )}
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => scrollToSection(dept.id)}
                    className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                      activeSection === dept.id
                        ? "bg-[#ED1C24] text-white border-[#ED1C24] shadow-md shadow-red-200"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {dept.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-12 pb-20">
            {isLoading && (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-red-200 border-t-[#ED1C24] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">กำลังโหลดข้อมูลระบบงาน...</p>
              </div>
            )}

            {!isLoading && filteredDepartments.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <SearchIcon />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  ไม่พบระบบงานที่ค้นหา
                </h3>
                <p className="text-gray-500">
                  ลองตรวจสอบคำสะกด หรือค้นหาด้วยคำสำคัญอื่น
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-[#ED1C24] font-bold hover:underline"
                >
                  ล้างคำค้นหา
                </button>
              </div>
            )}

            {/* FAVORITES SECTION */}
            {!searchTerm && favoriteSystemsList.length > 0 && (
              <section
                id="FAV"
                className="scroll-mt-36 group/section border-b-2 border-gray-100 pb-8"
              >
                <div className="flex items-center gap-4 mb-6 pb-2">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center bg-yellow-50 shadow-sm border border-yellow-100 text-yellow-500">
                    <svg
                      className="w-6 h-6 md:w-7 md:h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <DeptIcon id="FAV" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-none mb-2">
                      รายการโปรดของคุณ
                    </h2>
                    <p className="text-sm text-gray-500 font-normal border-l-2 border-yellow-200 pl-3">
                      ระบบงานที่คุณใช้งานบ่อย
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {favoriteSystemsList.map((system, idx) => (
                    <div key={`fav-${idx}`} className="relative group">
                      <a
                        href={system.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-white rounded-xl p-5 border border-yellow-100 shadow-[0_2px_8px_rgba(250,204,21,0.1)] hover:shadow-[0_8px_16px_rgba(250,204,21,0.2)] hover:border-yellow-300 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between min-h-[80px]"
                      >
                        <div className="flex items-center gap-3.5 pr-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></div>
                          <span className="font-bold text-gray-700 text-base md:text-lg group-hover:text-yellow-600 transition-colors leading-tight">
                            {system.name}
                          </span>
                        </div>
                      </a>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(system.name);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-400 z-10 transition-colors"
                      >
                        <StarIcon filled={true} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!isLoading &&
              filteredDepartments.map((dept) => (
                <section
                  key={dept.id}
                  id={dept.id}
                  className="scroll-mt-36 group/section"
                >
                  <div className="flex items-start md:items-end gap-4 mb-6 pb-2">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center bg-white shadow-sm border border-gray-100 text-[#ED1C24]">
                      <svg
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <DeptIcon id={dept.id} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-none mb-2">
                        {dept.name}
                      </h2>
                      <p className="text-sm text-gray-500 font-normal border-l-2 border-gray-200 pl-3">
                        {dept.desc}
                      </p>
                    </div>
                  </div>

                  {dept.systems.length === 0 ? (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <p className="text-gray-400 text-sm font-medium">
                        ยังไม่มีระบบงานในส่วนนี้
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {dept.systems.map((system, idx) => {
                        const isFav = favorites.includes(system.name);
                        return (
                          <div key={idx} className="relative group">
                            <a
                              href={system.href}
                              target="_blank"
                              rel="noreferrer"
                              className="block bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_16px_rgba(237,28,36,0.08)] hover:border-red-100 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between min-h-[80px]"
                            >
                              <div className="flex items-center gap-3.5 pr-10">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 flex-shrink-0 ${
                                    isFav
                                      ? "bg-yellow-400"
                                      : "bg-gray-200 group-hover:bg-[#ED1C24]"
                                  }`}
                                ></div>
                                <span className="font-bold text-gray-700 text-base md:text-lg group-hover:text-[#ED1C24] transition-colors leading-tight">
                                  {system.name}
                                </span>
                              </div>
                            </a>

                            {/* Favorite Button Overlay */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(system.name);
                              }}
                              className="absolute top-4 right-3 p-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-50 z-10 transition-all"
                              title={
                                isFav ? "ลบจากรายการโปรด" : "เพิ่มในรายการโปรด"
                              }
                            >
                              <StarIcon filled={isFav} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
          </main>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
