"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// --- Icons Components ---
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
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function Home() {
  const router = useRouter();

  // --- Global Loading State (SPLASH SCREEN) ---
  const [isSiteReady, setIsSiteReady] = useState(false);

  // --- State ---
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ State สำหรับ Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Data States (From Supabase) ---
  const [circularLetters, setCircularLetters] = useState<any[]>([]); // เอกสาร
  const [newsList, setNewsList] = useState<any[]>([]); // ข่าวสาร

  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // --- Dashboard State ---
  const [activeDashboard, setActiveDashboard] = useState<"income" | "fuze">(
    "income",
  );

  // --- News State ---
  const [activeNewsTab, setActiveNewsTab] = useState<
    "ทั่วไป" | "ประชาสัมพันธ์"
  >("ประชาสัมพันธ์");
  const newsContainerRef = useRef<HTMLDivElement>(null);

  // --- Loading States ---
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- Filter & Pagination (Documents) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Login State ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [session, setSession] = useState<any>(null);

  const dashboardLinks = {
    income:
      "https://lookerstudio.google.com/embed/reporting/a62bac56-8834-440c-a05f-b3e71adcd5da/page/ZZcEF",
    fuze: "https://lookerstudio.google.com/embed/reporting/8075cc55-994d-43ec-b8cf-629553056285/page/PF2SF",
  };

  const departments = ["รป.", "ทข.", "ตล.", "บค.", "อบ.", "กง.", "ทพ."];

  // --- Helpers ---
  const formatThaiDate = (dateString: string) => {
    if (!dateString) return "-";
    const [y, m, d] = dateString.split("-").map(Number);
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    return `${d} ${months[m - 1]} ${(y + 543).toString().slice(-2)}`;
  };

  const getDeptBadgeStyle = (dept: string) => {
    const styles: Record<string, string> = {
      "รป.": "bg-blue-50 text-blue-700 border-blue-200",
      "ทข.": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "ตล.": "bg-purple-50 text-purple-700 border-purple-200",
      "บค.": "bg-teal-50 text-teal-700 border-teal-200",
      "อบ.": "bg-rose-50 text-rose-700 border-rose-200",
      "กง.": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "ทพ.": "bg-amber-50 text-amber-700 border-amber-200",
    };
    return styles[dept] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // --- Check Session ---
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  // --- Fetch Data (Optimized Parallel Fetching) ---
  useEffect(() => {
    const fetchData = async () => {
      const docsPromise = supabase
        .from("documents")
        .select("*")
        .eq("status", "published")
        .order("id", { ascending: false });

      const newsPromise = supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: false });

      const [docsResult, newsResult] = await Promise.all([
        docsPromise,
        newsPromise,
      ]);

      if (docsResult.data) {
        setCircularLetters(
          docsResult.data.map((doc, i) => ({
            ...doc,
            no: i + 1,
            dateFormatted: formatThaiDate(doc.date),
            bookNo: doc.book_no,
          })),
        );
      }

      if (newsResult.data) {
        setNewsList(
          newsResult.data.map((item) => ({
            ...item,
            dateFormatted: formatThaiDate(item.date),
            category:
              item.type === "ข่าวประชาสัมพันธ์" ? "ประชาสัมพันธ์" : "ทั่วไป",
            d: item.date.split("-")[2],
            m: [
              "ม.ค.",
              "ก.พ.",
              "มี.ค.",
              "เม.ย.",
              "พ.ค.",
              "มิ.ย.",
              "ก.ค.",
              "ส.ค.",
              "ก.ย.",
              "ต.ค.",
              "พ.ย.",
              "ธ.ค.",
            ][parseInt(item.date.split("-")[1]) - 1],
          })),
        );
      }
      setIsDataLoaded(true);
    };
    fetchData();
  }, []);

  // --- Splash Screen Logic ---
  useEffect(() => {
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        setIsSiteReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);

  // --- Filter Logic ---
  const filteredDocs = circularLetters.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.title?.toLowerCase().includes(term) ||
      doc.book_no?.toLowerCase().includes(term) ||
      (doc.details && doc.details.toLowerCase().includes(term));

    const matchesDept = filterDept ? doc.dept === filterDept : true;
    return matchesSearch && matchesDept;
  });

  const filteredNews = newsList.filter((news) => {
    if (activeNewsTab === "ทั่วไป") return news.type === "ข่าวสารทั่วไป";
    if (activeNewsTab === "ประชาสัมพันธ์")
      return news.type === "ข่าวประชาสัมพันธ์";
    return false;
  });

  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingLogin(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) {
      setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setIsLoadingLogin(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: any,
  ) => {
    if (item.dropdown) {
      e.preventDefault();
      return;
    }

    // ✅ ปิดเมนูมือถือเมื่อกดลิงก์
    setIsMobileMenuOpen(false);

    // ✅ 2. ถ้าเป็นลิงก์ที่มี target="_blank" ให้ Return เลย (ปล่อยให้ Browser เปิดแท็บใหม่เอง)
    if (item.target === "_blank") {
      return;
    }

    e.preventDefault();
    if (item.name === "ติดต่อเรา") setIsContactOpen(true);
    else if (item.name === "เข้าสู่ระบบ") {
      session ? router.push("/dashboard") : setIsLoginOpen(true);
    } else if (item.href.startsWith("#")) {
      const targetId = item.href.substring(1);
      const elem = document.getElementById(targetId);
      if (elem) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = elem.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    } else {
      router.push(item.href);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // --- Data Arrays ---
  const navItems = [
    { name: "หน้าหลัก", href: "/", active: true },
    { name: "ข่าวประชาสัมพันธ์", href: "#news", active: false },
    { name: "สรุปผลการดำเนินงาน", href: "#dashboard", active: false },
    { name: "หนังสือเวียน", href: "#circular", active: false },
    {
      name: "รวมระบบไปรษณีย์/คู่มือ", // ✅ แก้ไขชื่อตามต้องการ
      href: "/postal-systems",
      active: false,
      target: "_blank",
    },
    // ❌ ลบเมนู "Download เอกสาร" ออกแล้ว
    { name: "ติดต่อเรา", href: "#", active: false },
    { name: "เข้าสู่ระบบ", href: "#", active: false },
  ];

  const contactList = [
    { name: "ฝปข.6", phone: "098-9999999" },
    { name: "ผช.ฝปข.6 (ป)", phone: "098-9999999" },
    { name: "ผช.ฝปข.6 (ธ)", phone: "098-9999999" },
    { name: "หรป.", phone: "098-9999999" },
    { name: "งานรับฝากและส่งต่อ", phone: "098-9999999" },
    { name: "หทข.", phone: "098-9999999" },
    { name: "หตล.", phone: "098-9999999" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-gray-800 font-sans selection:bg-red-500 selection:text-white flex flex-col overflow-x-hidden relative">
      {/* 🟢 SPLASH SCREEN */}
      <div
        className={`fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          isSiteReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="mb-8 relative">
          <Image
            src="/loading_1.jpg"
            alt="Loading Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="w-80 md:w-[500px] h-auto object-contain rounded-2xl shadow-2xl"
            priority
          />
        </div>
        <h2 className="mt-6 text-3xl font-black text-gray-900 tracking-tight">
          กำลังเข้าสู่ระบบ...
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-medium tracking-widest uppercase">
          REGIONAL POSTAL BUREAU (REGION 6)
        </p>
        <div className="w-80 md:w-96 h-2 bg-gray-100 rounded-full mt-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-full bg-[#ED1C24] origin-left animate-[shimmer_2s_infinite]"></div>
          <div className="absolute top-0 left-0 h-full w-1/3 bg-white/30 blur-sm animate-[dash-flow_1.5s_infinite]"></div>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          {isDataLoaded ? "พร้อมใช้งาน" : "กำลังโหลดข้อมูล..."}
        </p>
      </div>

      <style jsx global>{`
        .bg-grid-slate {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }
        @keyframes dash-flow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        .animate-dash-flow {
          animation: dash-flow 2s linear infinite;
        }
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.15) translate(-1%, -1%);
          }
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-out infinite alternate;
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ✅ NAVBAR (Responsive: Show Full Menu on XL, Hamburger on LG and below) */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-md py-2"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6"
        }`}
      >
        <div className="w-full px-6 md:px-10 h-16 flex justify-between items-center">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-4 group flex-shrink-0"
          >
            <div className="relative">
              <div
                className={`absolute inset-0 bg-red-500 rounded-xl blur opacity-20 transition-opacity duration-300 ${
                  !isScrolled
                    ? "group-hover:opacity-60"
                    : "group-hover:opacity-40"
                }`}
              ></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#ED1C24] to-rose-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-red-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ring-2 ring-white/20">
                <svg
                  className="w-7 h-7 drop-shadow-md"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 8l8 5 8-5V19H4V8zM20 6H4l8 5 8-5z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-black text-lg md:text-xl xl:text-2xl leading-none tracking-tight transition-colors duration-300 ${
                  isScrolled
                    ? "text-gray-900 group-hover:text-[#ED1C24]"
                    : "text-white drop-shadow-md"
                }`}
              >
                สำนักงานไปรษณีย์เขต 6
              </span>
              <span
                className={`text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase mt-0.5 transition-colors duration-300 ${
                  isScrolled
                    ? "text-gray-500 group-hover:text-red-400"
                    : "text-gray-200 group-hover:text-white"
                }`}
              >
                REGIONAL POSTAL BUREAU (REGION 6)
              </span>
            </div>
          </Link>

          {/* ✅ Desktop Menu */}
          <div
            className={`hidden xl:flex items-center px-1 py-1 rounded-full border shadow-sm transition-all duration-500 ${
              isScrolled
                ? "bg-white/50 backdrop-blur-sm border-gray-200/50"
                : "bg-black/20 backdrop-blur-md border-white/10"
            }`}
          >
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                <Link
                  href={item.href || "#"}
                  onClick={(e) => handleNavClick(e, item)}
                  // ✅ 3. ใส่ target ลงใน Link (Desktop)
                  target={item.target}
                  rel={
                    item.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    item.active
                      ? "bg-[#ED1C24] text-white shadow-md shadow-red-900/20"
                      : isScrolled
                        ? "text-gray-600 hover:text-[#ED1C24] hover:bg-white"
                        : "text-gray-100 hover:text-white hover:bg-white/20"
                  }`}
                >
                  {item.name}
                  {item.dropdown && (
                    <svg
                      className="w-3 h-3 opacity-70 group-hover:translate-y-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
                {item.dropdown && (
                  <div className="absolute top-full left-0 mt-2 w-max min-w-[220px] max-w-[320px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                    <div className="py-2">
                      {item.dropdown.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className="block px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-[#ED1C24] text-sm font-bold border-b border-gray-50 last:border-0 transition-colors whitespace-normal leading-relaxed"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`xl:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* ✅ Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <span className="text-xl font-black text-gray-900">เมนูหลัก</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Mobile Links */}
          <div className="flex-1 overflow-y-auto py-4 px-6 space-y-2">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-50 last:border-0 pb-2"
              >
                <Link
                  href={item.href || "#"}
                  onClick={(e) => handleNavClick(e, item)}
                  // ✅ 3. ใส่ target ลงใน Link (Mobile)
                  target={item.target}
                  rel={
                    item.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  className={`flex items-center justify-between py-3 text-lg font-bold ${
                    item.active
                      ? "text-[#ED1C24]"
                      : "text-gray-700 hover:text-[#ED1C24]"
                  }`}
                >
                  {item.name}
                  {item.dropdown && (
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
                {/* Mobile Dropdown Items */}
                {item.dropdown && (
                  <div className="pl-4 mt-1 space-y-2 border-l-2 border-red-100 ml-1">
                    {item.dropdown.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 text-sm text-gray-500 font-medium hover:text-[#ED1C24]"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative w-full h-[550px] md:h-[750px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_img3.jpg"
            alt="Regional Postal Bureau Region 6 Office"
            fill
            className="object-cover object-[center_40%] animate-ken-burns"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>
        <div className="container relative z-20 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center space-y-8 mt-16">
          <div className="animate-fade-in-up delay-100 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl cursor-default transition-transform hover:scale-105 hover:bg-white/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ED1C24]"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-widest uppercase drop-shadow-md">
              REGIONAL POSTAL BUREAU (REGION 6)
            </span>
          </div>
          <div className="space-y-2 animate-fade-in-up delay-200">
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight"
              style={{
                textShadow:
                  "0 4px 20px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.6)",
              }}
            >
              ขับเคลื่อนอนาคต <br /> Information <br /> Logistics
            </h1>
          </div>
          <p className="animate-fade-in-up delay-300 text-lg md:text-xl text-white font-medium max-w-2xl leading-relaxed drop-shadow-lg opacity-90">
            ยกระดับการบริหารงานไปรษณีย์ด้วยนวัตกรรมดิจิทัล{" "}
            <br className="hidden md:block" />
            เชื่อมโยงข้อมูล ผสานเครือข่าย เพื่อบริการที่เหนือกว่า
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/60 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* SECTION: NEWS UPDATE */}
      <section
        id="news"
        className="py-20 px-4 md:px-6 bg-white border-b border-gray-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#ED1C24] text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]"></span>
                Updates
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 tracking-tight">
                ข่าวประชาสัมพันธ์
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                ติดตามข่าวสารและความเคลื่อนไหวล่าสุด
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-1 self-start md:self-end">
              <button
                onClick={() => setActiveNewsTab("ทั่วไป")}
                className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeNewsTab === "ทั่วไป"
                    ? "bg-white text-[#ED1C24] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ข่าวสารทั่วไป
              </button>
              <button
                onClick={() => setActiveNewsTab("ประชาสัมพันธ์")}
                className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeNewsTab === "ประชาสัมพันธ์"
                    ? "bg-white text-[#ED1C24] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ข่าวประชาสัมพันธ์
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative group">
            {/* Left Button */}
            <button
              onClick={() => {
                if (newsContainerRef.current) {
                  const scrollAmount = 344;
                  newsContainerRef.current.scrollBy({
                    left: -scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-30 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#ED1C24] hover:scale-110 hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Right Button */}
            <button
              onClick={() => {
                if (newsContainerRef.current) {
                  const scrollAmount = 344;
                  newsContainerRef.current.scrollBy({
                    left: scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-30 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#ED1C24] hover:scale-110 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Gradient Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/50 to-transparent z-20 pointer-events-none md:block hidden" />

            {/* Scrollable Area */}
            <div
              ref={newsContainerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-8 px-2 items-center cursor-grab active:cursor-grabbing"
              style={{ scrollBehavior: "smooth" }}
            >
              {filteredNews.length === 0 ? (
                <div className="w-full py-10 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  {isDataLoaded
                    ? "ไม่พบข่าวสารในหมวดหมู่นี้"
                    : "กำลังโหลดข่าวสาร..."}
                </div>
              ) : (
                filteredNews.map((news, idx) => (
                  <article
                    key={idx}
                    className={`snap-center bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-red-100 transition-all duration-300 flex flex-col select-none flex-shrink-0 relative
                      w-[320px] h-[480px] md:w-[360px] md:h-[500px]
                    `}
                    onClick={() => setSelectedNews(news)}
                  >
                    {/* Image Section */}
                    <div
                      className={`w-full relative overflow-hidden bg-gray-200 
                      ${
                        activeNewsTab === "ประชาสัมพันธ์" ? "h-full" : "h-[45%]"
                      }`}
                    >
                      {news.cover_image?.url ? (
                        <>
                          <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <Image
                              src={news.cover_image.url}
                              alt="blur-bg"
                              fill
                              className="object-cover blur-lg scale-125 opacity-100 brightness-75"
                            />
                          </div>
                          <Image
                            src={news.cover_image.url}
                            alt="cover"
                            fill
                            className="relative z-10 object-contain shadow-md transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 z-10">
                          <span className="text-sm font-medium">
                            ไม่มีรูปภาพ
                          </span>
                        </div>
                      )}

                      {activeNewsTab === "ทั่วไป" && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-center shadow-lg border border-white/50 z-20">
                          <span className="block text-lg font-black text-[#ED1C24] leading-none">
                            {news.d}
                          </span>
                          <span className="block text-[10px] font-bold text-gray-800 uppercase tracking-wide">
                            {news.m}
                          </span>
                        </div>
                      )}

                      {activeNewsTab === "ประชาสัมพันธ์" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all z-20">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
                            <svg
                              className="w-6 h-6 text-white"
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
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    {activeNewsTab !== "ประชาสัมพันธ์" && (
                      <div className="h-[55%] flex flex-col p-6 bg-white relative z-20">
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-3 leading-snug group-hover:text-[#ED1C24] transition-colors h-[5rem] overflow-hidden">
                            {news.title}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                            {news.details}
                          </p>
                        </div>
                        <div className="pt-3 mt-auto border-t border-gray-50 flex justify-end">
                          <span className="text-xs font-bold text-[#ED1C24] flex items-center gap-1 cursor-pointer hover:underline bg-red-50 px-3 py-1.5 rounded-lg transition-colors group-hover:bg-[#ED1C24] group-hover:text-white">
                            อ่านเพิ่มเติม
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
              <div className="w-2 flex-shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: DASHBOARD */}
      <section
        id="dashboard"
        className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#ED1C24] text-xs font-bold tracking-widest uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-[#ED1C24] animate-pulse"></span>
                Performance
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                สรุปผลการดำเนินงาน
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:self-end">
              <a
                href={dashboardLinks[activeDashboard]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:text-[#ED1C24] hover:border-red-200 transition-all shadow-sm whitespace-nowrap"
              >
                <span>เปิดเต็มจอ</span>
                <svg
                  className="w-3 h-3"
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
              </a>
              <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-gray-200 shadow-sm">
                <button
                  onClick={() => setActiveDashboard("income")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeDashboard === "income"
                      ? "bg-[#ED1C24] text-white shadow-md shadow-red-200"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  รายได้ - รายจ่าย
                </button>
                <button
                  onClick={() => setActiveDashboard("fuze")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeDashboard === "fuze"
                      ? "bg-[#ED1C24] text-white shadow-md shadow-red-200"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  FUZE Post
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative w-full h-[500px] md:h-[650px] transition-all duration-300">
            <iframe
              key={activeDashboard}
              src={dashboardLinks[activeDashboard]}
              loading="lazy"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* SECTION: OFFICIAL DOCUMENTS */}
      <section
        id="circular"
        className="py-24 px-6 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#ED1C24] text-xs font-bold tracking-widest uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ED1C24] animate-pulse"></span>
              Official Documents
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              หนังสือเวียนและคำสั่ง
            </h2>
            <p className="text-gray-600 mt-2 font-medium text-lg max-w-xl">
              ค้นหาและดาวน์โหลดเอกสารประกาศ คำสั่ง เพื่อการปฏิบัติงาน
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
            {/* Search & Filter Bar */}
            <div className="p-5 md:p-6 bg-gray-50 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 w-full lg:w-3/4">
                <div className="relative w-full md:w-2/3">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาจาก หัวข้อ, เลขที่หนังสือ หรือ รายละเอียด..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-2.5 w-full bg-white border border-gray-300 text-gray-900 rounded-xl text-sm font-medium placeholder:text-gray-500 focus:border-[#ED1C24] focus:ring-4 focus:ring-red-50 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="relative w-full md:w-1/3">
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl text-sm font-medium focus:border-[#ED1C24] focus:ring-4 focus:ring-red-50 outline-none appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">ทุกส่วนงาน</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-auto flex justify-end">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white border border-gray-200 text-sm font-bold text-gray-600 shadow-sm whitespace-nowrap">
                  พบข้อมูล{" "}
                  <span className="text-[#ED1C24] mx-1.5">
                    {filteredDocs.length}
                  </span>{" "}
                  รายการ
                </span>
              </div>
            </div>

            {/* Table Content */}
            <div className="relative min-h-[400px] bg-transparent p-2 md:p-4 rounded-b-3xl">
              {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-10 h-10 text-gray-300"
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
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isDataLoaded ? "ไม่พบเอกสาร" : "กำลังโหลดข้อมูล..."}
                  </h3>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterDept("");
                    }}
                    className="mt-6 px-6 py-2.5 bg-[#ED1C24] text-white text-sm rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                  >
                    ล้างคำค้นหาทั้งหมด
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto pb-4 px-1">
                  <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
                    <thead className="hidden md:table-header-group">
                      <tr>
                        <th className="py-4 px-6 text-sm font-black text-gray-900 uppercase tracking-wider text-left pl-8 bg-gray-100 rounded-l-xl border-y border-l border-gray-200/50">
                          หัวข้อเรื่อง / รายละเอียด
                        </th>
                        <th className="py-4 px-6 text-sm font-black text-gray-900 uppercase tracking-wider text-center w-40 bg-gray-100 border-y border-gray-200/50">
                          ประเภท / วันที่
                        </th>
                        <th className="py-4 px-6 text-sm font-black text-gray-900 uppercase tracking-wider text-center w-28 bg-gray-100 border-y border-gray-200/50">
                          ส่วนงาน
                        </th>
                        <th className="py-4 px-6 text-sm font-black text-gray-900 uppercase tracking-wider text-center w-28 bg-gray-100 rounded-r-xl border-y border-r border-gray-200/50">
                          ดาวน์โหลด
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDocs.map((doc, index) => (
                        <tr
                          key={doc.id}
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsDetailsExpanded(false); // ✅ เพิ่มบรรทัดนี้: รีเซ็ตให้ย่อทุกครั้งที่เปิดใหม่
                          }}
                          className="group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                        >
                          <td className="bg-white p-6 rounded-l-2xl shadow-sm group-hover:shadow-lg transition-all relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ED1C24] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1 hidden sm:block">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-[#ED1C24] transition-colors duration-300">
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
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 w-full">
                                <h4 className="text-base font-bold text-gray-800 group-hover:text-[#ED1C24] transition-colors line-clamp-2 leading-relaxed">
                                  {doc.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2">
                                  {doc.bookNo && (
                                    <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                      {doc.bookNo}
                                    </span>
                                  )}

                                  {doc.files && doc.files.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
                                      <FileIcon />
                                      {doc.files.length} ไฟล์
                                    </span>
                                  )}

                                  {doc.links && doc.links.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap">
                                      {doc.links.length} ลิงก์
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="bg-white p-4 align-middle text-center shadow-sm group-hover:shadow-lg transition-all">
                            <div className="flex flex-col items-center justify-center gap-2">
                              {doc.type && (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                                    doc.type === "ประกาศ"
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : doc.type === "คำสั่ง"
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : "bg-blue-50 text-blue-600 border-blue-100"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full bg-current`}
                                  ></span>
                                  {doc.type}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-gray-500">
                                {doc.dateFormatted}
                              </span>
                            </div>
                          </td>

                          <td className="bg-white p-4 align-middle text-center shadow-sm group-hover:shadow-lg transition-all">
                            {doc.dept ? (
                              <span
                                className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black ${getDeptBadgeStyle(
                                  doc.dept,
                                )}`}
                              >
                                {doc.dept}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs font-medium">
                                -
                              </span>
                            )}
                          </td>

                          <td className="bg-white p-4 align-middle text-center rounded-r-2xl shadow-sm group-hover:shadow-lg transition-all">
                            {doc.files && doc.files.length > 0 ? (
                              <a
                                href={doc.files[0].url}
                                download={doc.files[0].name}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-10 h-10 rounded-xl bg-red-50 text-[#ED1C24] hover:bg-[#ED1C24] hover:text-white transition-all duration-300 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 border border-red-100 hover:border-red-500"
                                title={`ดาวน์โหลดด่วน: ${doc.files[0].name}`}
                              >
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                              </a>
                            ) : (
                              <span className="text-gray-300 font-bold select-none">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-between items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:border-[#ED1C24] hover:text-[#ED1C24] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  ก่อนหน้า
                </button>
                <span className="text-xs font-bold text-gray-500">
                  หน้า {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:border-[#ED1C24] hover:text-[#ED1C24] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-gray-600 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#ED1C24] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-gray-900 leading-none tracking-tight">
                    สำนักงานไปรษณีย์เขต 6
                  </span>
                  <span className="text-xs text-[#ED1C24] font-bold tracking-widest uppercase mt-1">
                    REGIONAL POSTAL BUREAU (REGION 6)
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-7 mb-8 max-w-sm">
                ศูนย์กลางการบริหารงานไปรษณีย์ พื้นที่ภาคกลางตอนล่าง
                มุ่งมั่นให้บริการด้วยมาตรฐานสากล
                เพื่อขับเคลื่อนเศรษฐกิจไทยและคุณภาพชีวิตที่ดีของสังคม
              </p>
            </div>
            <div className="md:col-span-3">
              <h4 className="font-bold text-gray-900 text-lg mb-6">
                ลิงก์ที่เกี่ยวข้อง
              </h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#ED1C24] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-500 transition-colors"></span>{" "}
                    เว็บไซต์ไปรษณีย์ไทย
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#ED1C24] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-500 transition-colors"></span>{" "}
                    ระบบติดตามพัสดุ
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h4 className="font-bold text-gray-900 text-lg mb-6">
                ติดต่อเรา
              </h4>
              <ul className="space-y-5 text-sm text-gray-500">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#ED1C24] flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="leading-relaxed mt-1">
                    54/17 หมู่ 1 ถนนพหลโยธิน ตำบลนครสวรรค์ออก <br />{" "}
                    อำเภอเมืองนครสวรรค์ จังหวัดนครสวรรค์ 60000
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#ED1C24] flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-800 text-lg">
                    056-255262{" "}
                    <span className="text-xs text-gray-400 font-normal block">
                      (ส่วนอำนวยการและบุคคล)
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
            <span>
              &copy; {new Date().getFullYear()} สำนักงานไปรษณีย์เขต 6 บริษัท
              ไปรษณีย์ไทย จำกัด
            </span>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <svg
                className="w-4 h-4 text-[#ED1C24] animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span>
                by FAG<sup>2</sup>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {(isContactOpen || selectedDocument || isLoginOpen || selectedNews) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsContactOpen(false);
              setSelectedDocument(null);
              setIsLoginOpen(false);
              setSelectedNews(null);
            }}
          ></div>

          {/* LOGIN OVERLAY (GRAND DESIGN) */}
          {isLoginOpen && (
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl relative z-10 animate-fade-in-up overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
              {/* LEFT SIDE: VISUAL & BRANDING (ซ่อนในมือถือ แสดงในจอใหญ่) */}
              <div className="relative w-full md:w-5/12 hidden md:flex flex-col items-center justify-center p-12 text-white overflow-hidden bg-gray-900">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/hero_img3.jpg" // ใช้รูปเดียวกับ Hero Banner เพื่อความคุมโทน
                    alt="Login Background"
                    fill
                    className="object-cover opacity-60 scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#ED1C24]/90 via-[#ED1C24]/80 to-red-900/80 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-8 transform rotate-3 ring-4 ring-white/20 backdrop-blur-sm">
                    <svg
                      className="w-14 h-14 text-[#ED1C24]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 8l8 5 8-5V19H4V8zM20 6H4l8 5 8-5z" />
                    </svg>
                  </div>

                  <h2 className="text-4xl font-black tracking-tight mb-2 drop-shadow-md">
                    Information
                    <br />
                    Logistics
                  </h2>
                  <div className="w-16 h-1.5 bg-white/50 rounded-full mb-6"></div>
                  <p className="text-red-100 font-medium text-lg leading-relaxed max-w-xs drop-shadow-sm">
                    ระบบบริหารจัดการงานไปรษณีย์ <br /> สำนักงานไปรษณีย์เขต 6
                  </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-12 right-12 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl mix-blend-overlay"></div>
              </div>

              {/* RIGHT SIDE: LOGIN FORM */}
              <div className="w-full md:w-7/12 bg-white relative flex flex-col justify-center p-8 md:p-16">
                {/* Close Button */}
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                >
                  <CloseIcon />
                </button>

                <div className="max-w-md mx-auto w-full">
                  <div className="mb-10">
                    {/* Mobile Logo Show (แสดงเฉพาะมือถือ) */}
                    <div className="md:hidden w-16 h-16 bg-[#ED1C24] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 mb-6 text-white">
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 8l8 5 8-5V19H4V8zM20 6H4l8 5 8-5z" />
                      </svg>
                    </div>

                    <h3 className="text-3xl font-black text-gray-900 mb-2">
                      เข้าสู่ระบบ
                    </h3>
                    <p className="text-gray-500">
                      กรุณากรอกข้อมูลเพื่อยืนยันตัวตนก่อนเข้าใช้งาน
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    {loginError && (
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-lg flex items-center gap-3 shadow-sm animate-pulse">
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        {loginError}
                      </div>
                    )}

                    <div className="space-y-5">
                      {/* Username */}
                      <div className="relative group">
                        <input
                          type="email"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="peer w-full px-5 pt-6 pb-2 rounded-xl bg-gray-50 border-2 border-transparent text-gray-900 font-bold placeholder-transparent focus:bg-white focus:border-[#ED1C24] outline-none transition-all shadow-sm"
                          placeholder="Username"
                        />
                        <label
                          htmlFor="username"
                          className="absolute left-5 top-4 text-gray-400 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-normal peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#ED1C24] peer-focus:font-bold peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:font-bold"
                        >
                          อีเมลผู้ใช้งาน (Username)
                        </label>
                        <div className="absolute right-4 top-4 text-gray-300 peer-focus:text-[#ED1C24] transition-colors">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="relative group">
                        <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="peer w-full px-5 pt-6 pb-2 rounded-xl bg-gray-50 border-2 border-transparent text-gray-900 font-bold placeholder-transparent focus:bg-white focus:border-[#ED1C24] outline-none transition-all shadow-sm"
                          placeholder="Password"
                        />
                        <label
                          htmlFor="password"
                          className="absolute left-5 top-4 text-gray-400 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-normal peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#ED1C24] peer-focus:font-bold peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:font-bold"
                        >
                          รหัสผ่าน (Password)
                        </label>
                        <div className="absolute right-4 top-4 text-gray-300 peer-focus:text-[#ED1C24] transition-colors">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[#ED1C24] focus:ring-[#ED1C24]"
                        />
                        <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                          จำการเข้าสู่ระบบ
                        </span>
                      </label>
                      <a
                        href="#"
                        className="font-bold text-[#ED1C24] hover:text-red-700 hover:underline"
                      >
                        ลืมรหัสผ่าน?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoadingLogin}
                      className="w-full py-4 bg-gradient-to-r from-[#ED1C24] to-rose-600 text-white rounded-xl font-black text-lg shadow-lg shadow-red-200 hover:shadow-red-400 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isLoadingLogin ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>กำลังเข้าสู่ระบบ...</span>
                        </>
                      ) : (
                        <>
                          เข้าสู่ระบบ
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                      มีปัญหาการใช้งาน?{" "}
                      <a
                        href="#"
                        className="font-bold text-gray-600 hover:text-[#ED1C24]"
                      >
                        ติดต่อผู้ดูแลระบบ (Admin)
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT MODAL */}
          {selectedDocument && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative z-10 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8 pb-6 pr-14">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-block px-2.5 py-1 bg-red-50 text-[#ED1C24] text-[11px] font-bold rounded uppercase tracking-wide border border-red-100">
                    {selectedDocument.type}
                  </span>
                  <span className="text-gray-400 text-sm">|</span>
                  <span className="text-gray-500 text-sm font-medium">
                    เลขที่:{" "}
                    <span className="text-gray-900 font-bold">
                      {selectedDocument.book_no ||
                        selectedDocument.bookNo ||
                        "-"}
                    </span>
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-snug">
                  {selectedDocument.title}
                </h3>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
                {/* Meta Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        ลงวันที่
                      </span>
                      <span className="font-bold text-gray-800 text-sm">
                        {selectedDocument.dateFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        ส่วนงานเจ้าของเรื่อง
                      </span>
                      <span className="font-bold text-gray-800 text-sm">
                        {selectedDocument.dept}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        เบอร์โทรศัพท์
                      </span>
                      <span className="font-bold text-[#ED1C24] text-sm">
                        {selectedDocument.phone || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details (with Expand/Collapse) */}
                <div className="mb-8">
                  <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ED1C24] rounded-full"></span>
                    รายละเอียด
                  </h4>

                  <div className="relative">
                    <div
                      className={`text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap transition-all duration-300 ${
                        isDetailsExpanded
                          ? ""
                          : "line-clamp-4 max-h-[100px] overflow-hidden"
                      }`}
                    >
                      {selectedDocument.details || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </div>

                    {/* ปุ่มกดแสดงเพิ่มเติม จะแสดงก็ต่อเมื่อมีข้อความ */}
                    {selectedDocument.details &&
                      selectedDocument.details.length > 100 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDetailsExpanded(!isDetailsExpanded);
                          }}
                          className="mt-2 text-xs font-bold text-[#ED1C24] hover:text-red-700 flex items-center gap-1 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
                        >
                          {isDetailsExpanded ? (
                            <>
                              ย่อรายละเอียด
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </>
                          ) : (
                            <>
                              อ่านทั้งหมด
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                  </div>
                </div>

                {/* Attachments & Links */}
                {(selectedDocument.files?.length > 0 ||
                  selectedDocument.links?.length > 0) && (
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      เอกสารแนบและลิงก์ที่เกี่ยวข้อง
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Files */}
                      {selectedDocument.files?.map((file: any, i: number) => (
                        <a
                          key={`file-${i}`}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/30 hover:shadow-md transition-all group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform">
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
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-gray-800 truncate group-hover:text-[#ED1C24] transition-colors">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              ดาวน์โหลดเอกสาร
                            </span>
                          </div>
                        </a>
                      ))}

                      {/* Links */}
                      {selectedDocument.links?.map((link: any, i: number) => (
                        <a
                          key={`link-${i}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md transition-all group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
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
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                              {link.title || link.url}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              เปิดลิงก์ภายนอก
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTACT MODAL */}
          {isContactOpen && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setIsContactOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    เบอร์โทรศัพท์ติดต่อ
                  </h3>
                  <div className="space-y-3 text-left">
                    {contactList.map((c, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group"
                      >
                        <span className="font-bold text-gray-700 text-sm group-hover:text-red-700">
                          {c.name}
                        </span>
                        <a
                          href={`tel:${c.phone}`}
                          className="text-[#ED1C24] font-bold text-sm bg-white px-3 py-1 rounded-lg shadow-sm"
                        >
                          {c.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NEWS MODAL */}
          {selectedNews && (
            <div
              className={`bg-white w-full ${
                selectedNews.category === "ประชาสัมพันธ์"
                  ? "max-w-5xl bg-transparent shadow-none"
                  : "max-w-3xl rounded-2xl shadow-2xl"
              } relative z-10 overflow-hidden max-h-[95vh] flex flex-col animate-fade-in-up`}
            >
              {/* 1. กรณีข่าวประชาสัมพันธ์ */}
              {selectedNews.category === "ประชาสัมพันธ์" ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="absolute -top-10 right-0 text-white hover:text-red-400"
                  >
                    <CloseIcon />
                  </button>
                  {selectedNews.cover_image?.url && (
                    <div className="relative max-w-full max-h-[85vh] w-auto h-auto">
                      <img
                        src={selectedNews.cover_image.url}
                        alt="Full PR"
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                      />
                    </div>
                  )}
                </div>
              ) : (
                // 2. กรณีข่าวทั่วไป
                <>
                  <div className="relative h-64 md:h-80 bg-gray-100">
                    {selectedNews.cover_image?.url && (
                      <Image
                        src={selectedNews.cover_image.url}
                        alt="News Cover"
                        fill
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-red-600 transition-all z-20"
                    >
                      <CloseIcon />
                    </button>
                    <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                      <span className="px-2 py-1 bg-red-600 text-[10px] font-bold rounded uppercase mb-2 inline-block">
                        {selectedNews.category}
                      </span>
                      <h3 className="text-2xl font-black leading-tight">
                        {selectedNews.title}
                      </h3>
                      <p className="text-sm opacity-80 mt-1">
                        {selectedNews.dateFormatted}
                      </p>
                    </div>
                  </div>
                  <div className="p-8 overflow-y-auto bg-white custom-scrollbar">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
                      {selectedNews.details}
                    </p>
                    {selectedNews.gallery_images?.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="w-1 h-5 bg-red-600 rounded-full"></span>{" "}
                          รูปภาพเพิ่มเติม
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedNews.gallery_images.map(
                            (img: any, i: number) => (
                              <div
                                key={i}
                                className="rounded-xl overflow-hidden aspect-[4/3] cursor-pointer hover:opacity-90 transition-opacity border border-gray-100 shadow-sm relative"
                              >
                                <Image
                                  src={img.url}
                                  alt={`Gallery ${i}`}
                                  fill
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                  onClick={() => window.open(img.url, "_blank")}
                                />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
