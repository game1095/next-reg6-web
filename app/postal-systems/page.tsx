"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

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
    className={`w-5 h-5 transition-all duration-300 ${
      filled
        ? "text-yellow-400 fill-yellow-400 scale-110"
        : "text-gray-300 hover:text-gray-400"
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

const ArrowUpIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 10l7-7m0 0l7 7m-7-7v18"
    />
  </svg>
);

// --- Type Icons ---
const FileIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const EmptyIcon = () => (
  <svg
    className="w-12 h-12 text-gray-300 mb-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

// --- Skeleton Component ---
const CardSkeleton = () => (
  <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
    <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0"></div>
    <div className="flex-1 space-y-2 min-w-0">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
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

// Department Icons
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

type FilterType = "all" | "web" | "doc";

export default function PostalSystemsPage() {
  const [activeSection, setActiveSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [dbSystems, setDbSystems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false); // State for Scroll To Top

  useEffect(() => {
    const savedFavorites = localStorage.getItem("postalFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    const fetchSystems = async () => {
      // Simulate slight delay to show off skeleton loading (optional, remove in production if too slow)
      // await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const { data, error } = await supabase
          .from("postal_systems")
          .select("*")
          .eq("status", "published")
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

  // --- Scroll to Top Logic ---
  useEffect(() => {
    const handleScrollButtonVisibility = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScrollButtonVisibility);
    return () =>
      window.removeEventListener("scroll", handleScrollButtonVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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

  const departments = useMemo(() => {
    return departmentConfig.map((dept) => ({
      ...dept,
      systems: dbSystems
        .filter((sys) => sys.dept === dept.id)
        .map((sys) => ({
          name: sys.name,
          href: sys.url,
          isFile:
            sys.url &&
            sys.url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i),
        })),
    }));
  }, [dbSystems]);

  const filteredDepartments = useMemo(() => {
    let result = departments;

    // Filter Type
    if (filterType !== "all") {
      result = result.map((dept) => ({
        ...dept,
        systems: dept.systems.filter((sys) => {
          if (filterType === "web") return !sys.isFile;
          if (filterType === "doc") return sys.isFile;
          return true;
        }),
      }));
    }

    // Search
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result
        .map((dept) => ({
          ...dept,
          systems: dept.systems.filter((sys) =>
            sys.name.toLowerCase().includes(lowerTerm),
          ),
        }))
        .filter((dept) => dept.systems.length > 0);
    }

    return result;
  }, [searchTerm, departments, filterType]);

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
  }, [departments]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#1A1A1A]">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-gray-100 to-transparent opacity-60 -z-10 pointer-events-none"></div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="h-1 w-full bg-[#ED1C24]"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="ค้นหาระบบงาน หรือ เอกสาร..."
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
          {/* Sidebar */}
          {!searchTerm && (
            <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
              <div className="sticky top-32 z-30">
                <nav className="flex flex-col gap-1">
                  {favorites.length > 0 && (
                    <button
                      onClick={() => scrollToSection("FAV")}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-all mb-4"
                    >
                      <StarIcon filled={true} /> รายการโปรด
                    </button>
                  )}
                  {departments.map((dept) => {
                    const isActive = activeSection === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => scrollToSection(dept.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                          isActive
                            ? "bg-[#ED1C24] text-white shadow-md shadow-red-200"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 flex items-center justify-center ${isActive ? "text-white" : "text-gray-400"}`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <DeptIcon id={dept.id} />
                          </svg>
                        </div>
                        {dept.shortName}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-10 pb-20">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 overflow-x-auto scrollbar-hide">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
                <FilterIcon /> กรองข้อมูล:
              </span>
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  filterType === "all"
                    ? "bg-gray-800 text-white shadow-md"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType("web")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  filterType === "web"
                    ? "bg-[#ED1C24] text-white shadow-md shadow-red-200"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <GlobeIcon /> ระบบงาน
              </button>
              <button
                onClick={() => setFilterType("doc")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  filterType === "doc"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <FileIcon /> คู่มือ
              </button>
            </div>

            {/* --- LOADING SKELETON --- */}
            {isLoading && (
              <div className="space-y-12">
                {/* Mock a section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...Array(9)].map((_, i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- FAVORITES --- */}
            {!isLoading &&
              !searchTerm &&
              filterType === "all" &&
              favoriteSystemsList.length > 0 && (
                <section id="FAV" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="text-yellow-400">
                      <StarIcon filled={true} />
                    </span>{" "}
                    รายการโปรด
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favoriteSystemsList.map((system, idx) => (
                      <div key={`fav-${idx}`} className="relative group">
                        <a
                          href={system.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-4 bg-white rounded-xl p-4 border border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50/20 hover:shadow-md transition-all group/card"
                        >
                          <div
                            className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                              system.isFile
                                ? "bg-blue-50 text-blue-600 group-hover/card:bg-blue-100"
                                : "bg-red-50 text-[#ED1C24] group-hover/card:bg-red-100"
                            }`}
                          >
                            {system.isFile ? <FileIcon /> : <GlobeIcon />}
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <h4 className="font-bold text-gray-700 text-sm truncate group-hover/card:text-gray-900">
                              {system.name}
                            </h4>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              {system.isFile ? (
                                <>
                                  <DownloadIcon /> ดาวน์โหลด
                                </>
                              ) : (
                                <>
                                  <ExternalLinkIcon /> เข้าสู่ระบบ
                                </>
                              )}
                            </p>
                          </div>
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(system.name);
                          }}
                          className="absolute top-2 right-2 p-1.5 text-yellow-400 hover:scale-110 transition-transform"
                        >
                          <StarIcon filled={true} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* --- CONTENT LIST --- */}
            {!isLoading && filteredDepartments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-gray-300 mb-4">
                  <SearchIcon />
                </div>
                <h3 className="text-lg font-bold text-gray-400">ไม่พบข้อมูล</h3>
                <p className="text-gray-400 text-sm">
                  ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง
                </p>
              </div>
            )}

            {!isLoading &&
              filteredDepartments.map((dept) => {
                const webSystems = dept.systems.filter((s) => !s.isFile);
                const documents = dept.systems.filter((s) => s.isFile);
                const isEmpty =
                  webSystems.length === 0 && documents.length === 0;

                if (filterType !== "all" && isEmpty) return null;

                return (
                  <section
                    key={dept.id}
                    id={dept.id}
                    className="scroll-mt-32 group/section pt-4 border-t border-gray-100 first:border-0 first:pt-0"
                  >
                    {/* Department Header */}
                    <div className="flex items-start gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm border border-gray-100 text-[#ED1C24]">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <DeptIcon id={dept.id} />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-none mb-2">
                          {dept.name}
                        </h2>
                        <p className="text-gray-500 text-sm">{dept.desc}</p>
                      </div>
                    </div>

                    {/* Empty State */}
                    {isEmpty && filterType === "all" && (
                      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 text-center">
                        <EmptyIcon />
                        <p className="text-gray-400 font-medium">
                          ยังไม่มีข้อมูลในหมวดนี้
                        </p>
                      </div>
                    )}

                    {/* 1. Web Systems Grid */}
                    {webSystems.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <GlobeIcon /> ระบบงาน (Applications)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {webSystems.map((system, idx) => {
                            const isFav = favorites.includes(system.name);
                            return (
                              <div
                                key={`web-${idx}`}
                                className="relative group"
                              >
                                <a
                                  href={system.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:border-red-200 hover:bg-red-50/30 hover:shadow-md transition-all group/card"
                                >
                                  <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-red-50 text-[#ED1C24] flex items-center justify-center group-hover/card:bg-red-100 transition-colors">
                                    <GlobeIcon />
                                  </div>
                                  <div className="flex-1 min-w-0 pr-6">
                                    <h4 className="font-bold text-gray-700 text-sm truncate group-hover/card:text-[#ED1C24]">
                                      {system.name}
                                    </h4>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                      <ExternalLinkIcon /> เข้าสู่ระบบ
                                    </p>
                                  </div>
                                </a>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleFavorite(system.name);
                                  }}
                                  className={`absolute top-2 right-2 p-1.5 ${
                                    isFav
                                      ? "text-yellow-400"
                                      : "text-transparent group-hover:text-gray-300 hover:!text-yellow-400"
                                  }`}
                                >
                                  <StarIcon filled={isFav} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. Documents Grid */}
                    {documents.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <FileIcon /> คู่มือ/เอกสาร (Documents)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {documents.map((doc, idx) => {
                            const isFav = favorites.includes(doc.name);
                            return (
                              <div
                                key={`doc-${idx}`}
                                className="relative group"
                              >
                                <a
                                  href={doc.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md transition-all group/card"
                                >
                                  <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover/card:bg-blue-100 transition-colors">
                                    <FileIcon />
                                  </div>
                                  <div className="flex-1 min-w-0 pr-6">
                                    <h4 className="font-bold text-gray-700 text-sm truncate group-hover/card:text-blue-700">
                                      {doc.name}
                                    </h4>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                      <DownloadIcon /> ดาวน์โหลด
                                    </p>
                                  </div>
                                </a>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleFavorite(doc.name);
                                  }}
                                  className={`absolute top-2 right-2 p-1.5 ${
                                    isFav
                                      ? "text-yellow-400"
                                      : "text-transparent group-hover:text-gray-300 hover:!text-yellow-400"
                                  }`}
                                >
                                  <StarIcon filled={isFav} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
          </main>
        </div>
      </div>

      {/* --- SCROLL TO TOP BUTTON --- */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[#ED1C24] text-white shadow-lg hover:bg-red-700 transition-all duration-300 transform ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0"
        }`}
      >
        <ArrowUpIcon />
      </button>

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
