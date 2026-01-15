"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // --- Global Loading State (SPLASH SCREEN) ---
  const [isSiteReady, setIsSiteReady] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // --- State ---
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // --- State Dashboard ---
  const [activeDashboard, setActiveDashboard] = useState<"income" | "fuze">(
    "income"
  );

  // --- State News (Tabs & Carousel) ---
  const [activeNewsTab, setActiveNewsTab] = useState<"general" | "pr">(
    "general"
  );
  const newsContainerRef = useRef<HTMLDivElement>(null);

  // --- State สำหรับข้อมูลเอกสาร ---
  const [circularLetters, setCircularLetters] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // --- State สำหรับ Filter & Pagination ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- State Login & Session ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [session, setSession] = useState<any>(null);

  // --- Dashboard Data ---
  const dashboardLinks = {
    income:
      "https://lookerstudio.google.com/embed/reporting/a62bac56-8834-440c-a05f-b3e71adcd5da/page/ZZcEF",
    fuze: "https://lookerstudio.google.com/embed/reporting/8075cc55-994d-43ec-b8cf-629553056285/page/PF2SF",
  };

  // --- Departments List ---
  const departments = ["รป.", "ทข.", "ตล.", "บค.", "อบ.", "กง.", "ทพ."];

  // --- Helper: Format Thai Date ---
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
    const yearTh = (y + 543).toString().slice(-2);
    const dayTh = d < 10 ? `0${d}` : d;
    return `${dayTh} ${months[m - 1]} ${yearTh}`;
  };

  // --- Helper: Get Color by Type ---
  const getTypeColor = (type: string) => {
    switch (type) {
      case "ประกาศ":
        return "bg-red-500";
      case "ขอความร่วมมือ":
        return "bg-blue-500";
      case "คำสั่ง":
        return "bg-amber-500";
      case "แจ้งเวียน":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  // --- Helper: Get Department Badge Style ---
  const getDeptBadgeStyle = (dept: string) => {
    const styles: Record<string, string> = {
      "รป.": "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      "ทข.":
        "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
      "ตล.":
        "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      "บค.": "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
      "อบ.": "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
      "กง.":
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      "ทพ.": "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    };
    return (
      styles[dept] ||
      "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
    );
  };

  // --- Helper: Get News Cover Image (SVG) ---
  const getNewsCover = (id: number) => {
    const colors = [
      { bg: "#F0F9FF", main: "#0EA5E9" },
      { bg: "#FFFBEB", main: "#D97706" },
      { bg: "#FEF2F2", main: "#EF4444" },
      { bg: "#F5F3FF", main: "#8B5CF6" },
    ];
    const c = colors[id % colors.length];

    return (
      <svg
        className="w-full h-full"
        viewBox="0 0 400 250"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="400" height="250" fill={c.bg} />
        <circle cx="350" cy="50" r="100" fill={c.main} fillOpacity="0.1" />
        <circle cx="50" cy="200" r="80" fill={c.main} fillOpacity="0.1" />
        <path
          d="M150 100 L250 150 M150 150 L250 100"
          stroke={c.main}
          strokeWidth="3"
          opacity="0.2"
        />
      </svg>
    );
  };

  // --- Check Session on Mount ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Fetch Documents ---
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoadingDocs(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("status", "published")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
      } else if (data) {
        const formattedData = data.map((doc, index) => ({
          id: doc.id,
          no: index + 1,
          title: doc.title,
          date: formatThaiDate(doc.date),
          dept: doc.dept,
          bookNo: doc.book_no,
          type: doc.type,
          statusColor: getTypeColor(doc.type),
          phone: doc.phone || "-",
          details: doc.details,
          links: doc.links || [],
          files: doc.files || [],
        }));
        setCircularLetters(formattedData);
      }
      setIsLoadingDocs(false);
    };

    fetchDocuments();
  }, []);

  // --- LOGIC: Handle Site Ready (Splash Screen) ---
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!isSiteReady) {
        console.warn("Forcing site load due to timeout");
        setIsSiteReady(true);
      }
    }, 10000);
    if (!isLoadingDocs && iframeLoaded) {
      const smoothDelay = setTimeout(() => {
        setIsSiteReady(true);
        clearTimeout(safetyTimeout);
      }, 800);
      return () => clearTimeout(smoothDelay);
    }
    return () => clearTimeout(safetyTimeout);
  }, [isLoadingDocs, iframeLoaded]);

  // --- Filter Logic ---
  const filteredDocs = circularLetters.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const detailsMatch = doc.details
      ? doc.details.toLowerCase().includes(term)
      : false;
    const matchesSearch =
      doc.title.toLowerCase().includes(term) ||
      doc.bookNo.toLowerCase().includes(term) ||
      detailsMatch;
    const matchesDept = filterDept ? doc.dept === filterDept : true;
    return matchesSearch && matchesDept;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDept]);

  // --- Login Logic ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      console.error("Login Error:", error.message);
      setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    } else {
      console.log("Login Success:", data);
      router.push("/dashboard");
    }
  };

  // --- Scroll Listener ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Scroll & Nav Handler ---
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: any
  ) => {
    if (item.dropdown) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (item.name === "ติดต่อเรา") {
      setIsContactOpen(true);
    } else if (item.name === "Admin") {
      if (session) {
        router.push("/dashboard");
      } else {
        setIsLoginOpen(true);
      }
    } else if (item.href.startsWith("#")) {
      const targetId = item.href.substring(1);
      const elem = document.getElementById(targetId);
      if (elem) {
        const headerOffset = 80;
        const elementPosition = elem.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    } else {
      window.location.href = item.href;
    }
  };

  // --- Carousel Scroll Logic ---
  const scrollNews = (direction: "left" | "right") => {
    if (newsContainerRef.current) {
      const scrollAmount = 350;
      const currentScroll = newsContainerRef.current.scrollLeft;
      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      newsContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // --- Data ---
  const navItems = [
    { name: "หน้าหลัก", href: "/", active: true },
    { name: "News Update", href: "#news", active: false },
    { name: "Dashboard", href: "#dashboard", active: false },
    { name: "หนังสือเวียน", href: "#circular", active: false },
    {
      name: "ระบบรายงานผลประจำวัน",
      href: "#",
      active: false,
      dropdown: [
        {
          name: "รายงานสถานะการเงินและการเบิกเงิน/ส่งเงินธนาคาร",
          href: "#",
        },
        { name: "รายงาน Shopee", href: "#" },
      ],
    },
    {
      name: "รายงานผลประจำเดือน",
      href: "#",
      active: false,
      dropdown: [
        { name: "รายงาน รส.5", href: "#" },
        { name: "รายงาน ป.70/ป.80", href: "#" },
        {
          name: "รายงานการใช้น้ำมันเชื้อเพลิงด้วยบัตรเครดิตน้ำมัน",
          href: "#",
        },
        { name: "รายงานลูกค้ารายใหญ่", href: "#" },
      ],
    },
    {
      name: "Download เอกสาร",
      href: "#",
      active: false,
      dropdown: [
        { name: "คู่มือการใช้ IDM", href: "#" },
        { name: "คู่มือ New CA POS", href: "#" },
        { name: "เอกสารแบบพิมพ์ตามส่วนงาน", href: "#" },
      ],
    },
    { name: "ติดต่อเรา", href: "#", active: false },
    { name: "Admin", href: "#", active: false },
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

  // --- NEWS DATA (Separated) ---
  const generalNewsItems = [
    {
      id: 1,
      date: "14",
      month: "ธ.ค.",
      title: "ประกาศนโยบายคุณภาพ ปณท ประจำปี 2568",
      excerpt: "ยกระดับมาตรฐานการให้บริการด้วยหัวใจ ไปรษณีย์ไทยเพื่อคนไทย...",
      author: "ส่วนกลาง",
    },
    {
      id: 2,
      date: "10",
      month: "ธ.ค.",
      title: "แจ้งเปลี่ยนแปลงระเบียบการเบิกจ่ายสวัสดิการ",
      excerpt:
        "อัปเดตข้อมูลระเบียบการเบิกจ่ายค่ารักษาพยาบาลและสวัสดิการอื่นๆ...",
      author: "ทรัพยากรบุคคล",
    },
    {
      id: 3,
      date: "05",
      month: "ธ.ค.",
      title: "โครงการไปรษณีย์ไทยใสสะอาด",
      excerpt: "ร่วมรณรงค์ต่อต้านการทุจริตและประพฤติมิชอบในองค์กร...",
      author: "ตรวจสอบภายใน",
    },
    {
      id: 4,
      date: "01",
      month: "ธ.ค.",
      title: "สรุปผลการดำเนินงานครึ่งปีหลัง",
      excerpt: "รายงานสรุปภาพรวมความสำเร็จและเป้าหมายในอนาคต...",
      author: "แผนกแผนงาน",
    },
  ];

  const prNewsItems = [
    {
      id: 101,
      date: "14",
      month: "ธ.ค.",
      title: "ประชุมสรุปผลการดำเนินงาน ประจำไตรมาสที่ 4/2567",
      excerpt:
        "ขอเชิญหัวหน้าส่วนงานทุกท่านเข้าร่วมประชุมเพื่อติดตามผลการปฏิบัติงานและวางแผนกลยุทธ์ประจำปี...",
      author: "แผนกอำนวยการ",
    },
    {
      id: 102,
      date: "12",
      month: "ธ.ค.",
      title: "เปิดรับสมัครสอบเลื่อนระดับพนักงาน ประจำปี 2568",
      excerpt:
        "รายละเอียดหลักเกณฑ์และคุณสมบัติผู้มีสิทธิสอบเลื่อนระดับ สามารถดาวน์โหลดเอกสารแนบได้ที่นี่...",
      author: "ส่วนบุคคล",
    },
    {
      id: 103,
      date: "09",
      month: "ธ.ค.",
      title: 'กิจกรรม "ไปรษณีย์ไทย...เพื่อสังคม" มอบทุนการศึกษา',
      excerpt:
        "ภาพบรรยากาศกิจกรรมมอบทุนการศึกษาและอุปกรณ์กีฬาให้กับโรงเรียนในพื้นที่ห่างไกล...",
      author: "ประชาสัมพันธ์",
    },
    {
      id: 104,
      date: "01",
      month: "ธ.ค.",
      title: "Big Cleaning Day ประจำปี",
      excerpt: "รวมพลังชาว ปข.6 ร่วมใจทำความสะอาดสำนักงาน...",
      author: "ส่วนอาคารฯ",
    },
  ];

  const currentNewsData =
    activeNewsTab === "general" ? generalNewsItems : prNewsItems;

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-gray-800 font-sans selection:bg-red-500 selection:text-white flex flex-col overflow-x-hidden relative">
      {/* 🟢 SPLASH SCREEN */}
      <div
        className={`fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          isSiteReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="mb-8 relative">
          <img
            src="/loading_1.jpg"
            alt="Loading Logo"
            className="w-80 md:w-[500px] h-auto object-contain rounded-2xl shadow-2xl"
          />
        </div>
        <h2 className="mt-6 text-3xl font-black text-gray-900 tracking-tight">
          กำลังเข้าสู่ระบบ...
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-medium tracking-widest uppercase">
          Thailand Post Sector 6
        </p>
        <div className="w-80 md:w-96 h-2 bg-gray-100 rounded-full mt-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-full bg-[#ED1C24] origin-left animate-[shimmer_2s_infinite]"></div>
          <div className="absolute top-0 left-0 h-full w-1/3 bg-white/30 blur-sm animate-[dash-flow_1.5s_infinite]"></div>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          {iframeLoaded ? "ข้อมูลพร้อมใช้งาน" : "กำลังโหลด Dashboard..."}
        </p>
      </div>

      {/* GLOBAL STYLES & ANIMATIONS */}
      <style jsx global>{`
        .bg-grid-slate {
          background-size: 40px 40px;
          background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px
            ),
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
        @keyframes float-card {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float-card-1 {
          animation: float-card 5s ease-in-out infinite;
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-out infinite alternate;
        }
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.15) translate(-1%, -1%);
          }
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
        .delay-500 {
          animation-delay: 0.4s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-md py-2"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6"
        }`}
      >
        <div className="w-full px-6 md:px-10 h-16 flex justify-between items-center">
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
                className={`font-black text-xl md:text-2xl leading-none tracking-tight transition-colors duration-300 ${
                  isScrolled
                    ? "text-gray-900 group-hover:text-[#ED1C24]"
                    : "text-white drop-shadow-md"
                }`}
              >
                สำนักงานไปรษณีย์เขต 6
              </span>
              <span
                className={`text-[11px] font-bold tracking-[0.15em] uppercase mt-0.5 transition-colors duration-300 ${
                  isScrolled
                    ? "text-gray-500 group-hover:text-red-400"
                    : "text-gray-200 group-hover:text-white"
                }`}
              >
                Thailand Post Sector 6
              </span>
            </div>
          </Link>

          <div
            className={`hidden md:flex items-center px-1 py-1 rounded-full border shadow-sm transition-all duration-500 ${
              isScrolled
                ? "bg-white/50 backdrop-blur-sm border-gray-200/50"
                : "bg-black/20 backdrop-blur-md border-white/10"
            }`}
          >
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
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
        </div>
      </nav>

      {/* ✅ HERO SECTION (UPDATED: Not Full Screen) */}
      <section className="relative w-full h-[550px] md:h-[750px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_img3.jpg"
            alt="Regional Postal Bureau Region 6 Office"
            className="w-full h-full object-cover object-[center_40%] animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="container relative z-20 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center space-y-8 mt-16">
          <div className="animate-fade-in-up delay-100 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl cursor-default transition-transform hover:scale-105 hover:bg-white/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ED1C24]"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-widest uppercase drop-shadow-md">
              Thailand Post Sector 6
            </span>
          </div>

          <div className="space-y-2 animate-fade-in-up delay-200">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              ขับเคลื่อนอนาคต <br />
              <span className="text-white">Information</span> <br />
              <span className="text-white">Logistics</span>
            </h1>
          </div>

          <p className="animate-fade-in-up delay-300 text-lg md:text-xl text-white font-medium max-w-2xl leading-relaxed drop-shadow-lg">
            ยกระดับการบริหารงานไปรษณีย์ด้วยนวัตกรรมดิจิทัล{" "}
            <br className="hidden md:block" />
            เชื่อมโยงข้อมูล ผสานเครือข่าย เพื่อบริการที่เหนือกว่า
          </p>

          <div className="absolute bottom-10 animate-bounce delay-500 opacity-80">
            <svg
              className="w-10 h-10 text-white drop-shadow-md"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ✅ SECTION: NEWS UPDATE (Above Dashboard) */}
      <section
        id="news"
        className="py-20 px-4 md:px-6 bg-white border-b border-gray-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-[#ED1C24] text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]"></span>
                Updates
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 tracking-tight">
                News Update
              </h2>
              <p className="text-gray-500 mt-2 font-medium">
                ติดตามข่าวสารและความเคลื่อนไหวล่าสุด
              </p>
            </div>

            {/* Tabs Selector */}
            <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-1 self-start md:self-end">
              <button
                onClick={() => setActiveNewsTab("general")}
                className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeNewsTab === "general"
                    ? "bg-white text-[#ED1C24] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ข่าวประชาสัมพันธ์ทั่วไป ปณท
              </button>
              <button
                onClick={() => setActiveNewsTab("pr")}
                className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeNewsTab === "pr"
                    ? "bg-white text-[#ED1C24] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ประชาสัมพันธ์
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative group">
            {/* Scroll Buttons */}
            <button
              onClick={() => scrollNews("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#ED1C24] hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
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
            <button
              onClick={() => scrollNews("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#ED1C24] hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
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

            {/* Slider Track */}
            <div
              ref={newsContainerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2"
            >
              {currentNewsData.map((news, idx) => (
                <article
                  key={idx}
                  className="min-w-[85%] md:min-w-[350px] lg:min-w-[380px] snap-center bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-red-100 transition-all duration-300 flex flex-col h-full hover:-translate-y-2 select-none"
                >
                  <div className="h-48 bg-gray-50 relative overflow-hidden">
                    {getNewsCover(news.id)}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-center shadow-md border border-white/50">
                      <span className="block text-lg font-black text-[#ED1C24] leading-none">
                        {news.date}
                      </span>
                      <span className="block text-[10px] font-bold text-gray-800 uppercase tracking-wide">
                        {news.month}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {news.author}
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#ED1C24] transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                      {news.excerpt}
                    </p>
                    <div className="pt-4 border-t border-gray-50 flex justify-end">
                      <span className="text-xs font-bold text-[#ED1C24] flex items-center gap-1 cursor-pointer">
                        อ่านต่อ
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
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ SECTION: DASHBOARD */}
      <section
        id="dashboard"
        className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Performance
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                Dashboard สรุปผลการดำเนินงาน
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
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-10 p-4 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-4"></div>
                <p className="text-sm text-gray-500 font-medium">
                  กำลังโหลด...
                </p>
              </div>
            )}
            <iframe
              key={activeDashboard}
              src={dashboardLinks[activeDashboard]}
              onLoad={() => {
                console.log("Iframe Loaded");
                setIframeLoaded(true);
              }}
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                iframeLoaded ? "opacity-100" : "opacity-0"
              }`}
            ></iframe>
          </div>
        </div>
      </section>

      {/* SECTION: CIRCULAR LETTERS */}
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
            <div className="p-5 md:p-6 bg-gray-50 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 w-full lg:w-3/4">
                <div className="relative w-full md:w-2/3">
                  <label htmlFor="search-docs" className="sr-only">
                    ค้นหาเอกสาร
                  </label>
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
                    id="search-docs"
                    type="text"
                    placeholder="พิมพ์คำค้นหา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-2.5 w-full bg-white border border-gray-300 text-gray-900 rounded-xl text-sm font-medium placeholder:text-gray-500 focus:border-[#ED1C24] focus:ring-4 focus:ring-red-50 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="relative w-full md:w-1/3">
                  <label htmlFor="filter-dept" className="sr-only">
                    เลือกส่วนงาน
                  </label>
                  <select
                    id="filter-dept"
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

            <div className="relative min-h-[400px] bg-transparent p-2 md:p-4 rounded-b-3xl">
              {isLoadingDocs ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 gap-4 rounded-3xl">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-[#ED1C24] rounded-full animate-spin"></div>
                  </div>
                  <span className="text-gray-500 font-medium animate-pulse text-sm">
                    กำลังโหลดข้อมูล...
                  </span>
                </div>
              ) : filteredDocs.length === 0 ? (
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
                    ไม่พบเอกสาร
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
                          onClick={() => setSelectedDocument(doc)}
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
                              <div className="flex flex-col gap-1.5">
                                <h4 className="text-base font-bold text-gray-800 group-hover:text-[#ED1C24] transition-colors line-clamp-2 leading-relaxed">
                                  {doc.title}
                                </h4>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                    {doc.bookNo}
                                  </span>
                                  {(doc.files.length > 0 ||
                                    doc.links.length > 0) && (
                                    <span className="flex items-center gap-1 text-[10px] text-[#ED1C24] font-bold bg-red-50 px-2 py-0.5 rounded-full">
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
                                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                        />
                                      </svg>
                                      มีเอกสาร
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="bg-white p-4 align-middle text-center shadow-sm group-hover:shadow-lg transition-all">
                            <div className="flex flex-col items-center justify-center gap-2">
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
                                  className={`w-1.5 h-1.5 rounded-full ${doc.statusColor}`}
                                ></span>
                                {doc.type}
                              </span>
                              <span className="text-xs font-semibold text-gray-500">
                                {doc.date}
                              </span>
                            </div>
                          </td>
                          <td className="bg-white p-4 align-middle text-center shadow-sm group-hover:shadow-lg transition-all">
                            <span
                              className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black ${getDeptBadgeStyle(
                                doc.dept
                              )}`}
                            >
                              {doc.dept}
                            </span>
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
                                title={`ดาวน์โหลด: ${doc.files[0].name}`}
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
                              <span className="text-gray-300 font-bold">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

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
                    Thailand Post Sector 6
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
      {(isContactOpen || selectedDocument || isLoginOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsContactOpen(false);
              setSelectedDocument(null);
              setIsLoginOpen(false);
            }}
          ></div>

          {/* LOGIN OVERLAY */}
          {isLoginOpen && (
            <div className="fixed inset-0 z-[110] bg-[#FAFAFA] flex items-center justify-center animate-fade-in-up">
              <div className="absolute inset-0 bg-grid-slate [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>

              <button
                onClick={() => setIsLoginOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-colors z-50 shadow-sm"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative z-20 m-4">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="mb-8">
                    <div className="w-12 h-12 bg-[#ED1C24] text-white flex items-center justify-center rounded-xl shadow-lg shadow-red-200 mb-4">
                      <svg
                        className="w-7 h-7"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 8l8 5 8-5V19H4V8zM20 6H4l8 5 8-5z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                      เข้าสู่ระบบ
                    </h2>
                    <p className="text-gray-500 text-sm">
                      ระบบบริหารจัดการภายใน สำนักงานไปรษณีย์เขต 6
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse">
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
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {loginError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                        รหัสพนักงาน / Username
                      </label>
                      <input
                        type="email"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#ED1C24] focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm font-medium text-gray-900"
                        placeholder="admin@post6.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                        รหัสผ่าน / Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#ED1C24] focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm font-medium text-gray-900"
                        placeholder="•••••••• (1234)"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded text-[#ED1C24] focus:ring-red-500"
                        />
                        <span className="text-gray-500">จำการเข้าสู่ระบบ</span>
                      </label>
                      <a
                        href="#"
                        className="text-[#ED1C24] font-bold hover:underline"
                      >
                        ลืมรหัสผ่าน?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 bg-[#ED1C24] text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2
                        ${
                          isLoading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:shadow-red-300 hover:-translate-y-1"
                        }
                      `}
                    >
                      {isLoading ? (
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
                          กำลังตรวจสอบ...
                        </>
                      ) : (
                        "เข้าสู่ระบบ"
                      )}
                    </button>
                  </form>
                </div>

                <div className="hidden md:flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden p-12 text-center">
                  <div className="absolute inset-0 bg-grid-slate opacity-50"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                  <div className="relative z-10">
                    <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl mb-6 animate-float-card-1">
                      <svg
                        className="w-16 h-16 text-[#ED1C24]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Secure Access
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                      ระบบรักษาความปลอดภัยข้อมูลสารสนเทศ <br />
                      มาตรฐานสากล เพื่อความปลอดภัยสูงสุด
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT MODAL */}
          {!isLoginOpen && selectedDocument && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => {
                    setIsContactOpen(false);
                    setSelectedDocument(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                </button>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6 pt-8 pb-4">
                <span className="inline-block px-2 py-1 bg-red-50 text-[#ED1C24] text-[10px] font-bold rounded uppercase mb-2">
                  {selectedDocument.type}
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {selectedDocument.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  เลขที่หนังสือ:{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedDocument.bookNo}
                  </span>
                </p>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="block text-gray-400 text-xs uppercase mb-1">
                      ลงวันที่
                    </span>
                    <span className="font-semibold text-gray-800">
                      {selectedDocument.date}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-xs uppercase mb-1">
                      ส่วนงาน
                    </span>
                    <span className="font-semibold text-gray-800">
                      {selectedDocument.dept}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-xs uppercase mb-1">
                      เบอร์โทรศัพท์
                    </span>
                    <span className="font-semibold text-[#ED1C24]">
                      {selectedDocument.phone}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 border-l-4 border-[#ED1C24] pl-3">
                    รายละเอียด
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {selectedDocument.details}
                  </p>
                </div>

                {selectedDocument.links &&
                  selectedDocument.links.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172a4 4 0 105.656-5.656l-1.172 1.172a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.172 1.172a4 4 0 105.656 5.656l1.172-1.172z"
                          />
                        </svg>
                        ลิงก์แนบ
                      </h4>
                      <ul className="space-y-2">
                        {selectedDocument.links.map((link: any, i: number) => (
                          <li key={i}>
                            <a
                              href={link.url}
                              target="_blank"
                              className="flex items-center gap-2 text-sm text-[#ED1C24] hover:underline font-medium p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                              {link.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedDocument.files &&
                  selectedDocument.files.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                        ไฟล์เอกสาร
                      </h4>
                      <div className="space-y-2">
                        {selectedDocument.files.map((file: any, i: number) => (
                          <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-red-200 hover:shadow-sm transition-all group cursor-pointer block"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#ED1C24] group-hover:text-white transition-colors">
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
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="text-sm font-medium text-gray-700 truncate group-hover:text-[#ED1C24] transition-colors">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {file.size}
                                </span>
                              </div>
                            </div>
                            <svg
                              className="w-5 h-5 text-gray-300 group-hover:text-[#ED1C24]"
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
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* CONTACT MODAL */}
          {!isLoginOpen && !selectedDocument && isContactOpen && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setIsContactOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
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
        </div>
      )}
    </div>
  );
}
