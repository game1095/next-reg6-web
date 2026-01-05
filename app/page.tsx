"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [selectedHub, setSelectedHub] = useState<any>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // --- Scroll Listener ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Scroll Handler ---
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: any
  ) => {
    e.preventDefault();
    if (item.name === "ติดต่อเรา") {
      setIsContactOpen(true);
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

  // --- Data ---
  const navItems = [
    { name: "หน้าหลัก", href: "/", active: true },
    { name: "หนังสือเวียน", href: "#circular", active: false },
    { name: "บริการภายใน", href: "#hub-links", active: false },
    { name: "ข่าวสาร", href: "#news", active: false },
    { name: "ติดต่อเรา", href: "#", active: false },
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

  const hubItems = [
    {
      code: "อบ.",
      name: "ส่วนอำนวยการและบริหาร",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      bg: "bg-rose-100 text-rose-600",
      links: [
        { title: "ระบบจองห้องประชุม", url: "#" },
        { title: "ระบบจองยานพาหนะ", url: "#" },
        { title: "งานสารบรรณกลาง", url: "#" },
        { title: "เบิกจ่ายวัสดุสำนักงาน", url: "#" },
      ],
    },
    {
      code: "รป.",
      name: "ส่วนระบบปฏิบัติการ",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      bg: "bg-blue-100 text-blue-600",
      links: [
        { title: "ระบบติดตามรถขนส่ง (GPS)", url: "#" },
        { title: "รายงานคุณภาพนำจ่าย", url: "#" },
        { title: "ตารางเวลาเดินรถ", url: "#" },
      ],
    },
    {
      code: "ทพ.",
      name: "ส่วนทรัพย์สินและพัสดุ",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      bg: "bg-amber-100 text-amber-600",
      links: [
        { title: "ทะเบียนทรัพย์สิน", url: "#" },
        { title: "แบบฟอร์มจัดซื้อจัดจ้าง", url: "#" },
        { title: "แจ้งซ่อมอาคารสถานที่", url: "#" },
      ],
    },
    {
      code: "กง.",
      name: "ส่วนการเงินและบัญชี",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bg: "bg-emerald-100 text-emerald-600",
      links: [
        { title: "ระบบเบิกค่ารักษาพยาบาล", url: "#" },
        { title: "ดาวน์โหลดหนังสือรับรองเงินเดือน", url: "#" },
        { title: "ตรวจสอบสถานะการเบิกจ่าย", url: "#" },
      ],
    },
    {
      code: "ทข.",
      name: "ส่วนเทคโนโลยีและข้อมูล",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      bg: "bg-indigo-100 text-indigo-600",
      links: [
        { title: "แจ้งซ่อมคอมพิวเตอร์ (Helpdesk)", url: "#" },
        { title: "ขอใช้บริการ VPN", url: "#" },
        { title: "คลังซอฟต์แวร์", url: "#" },
      ],
    },
    {
      code: "ตล.",
      name: "ส่วนการตลาดและการขาย",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      bg: "bg-purple-100 text-purple-600",
      links: [
        { title: "สื่อประชาสัมพันธ์โปรโมชั่น", url: "#" },
        { title: "ข้อมูลลูกค้าองค์กร (CRM)", url: "#" },
        { title: "ขออนุมัติส่วนลดพิเศษ", url: "#" },
      ],
    },
    {
      code: "บค.",
      name: "ส่วนทรัพยากรบุคคล",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      bg: "bg-teal-100 text-teal-600",
      links: [
        { title: "ระบบลางานออนไลน์ (ESS)", url: "#" },
        { title: "ประเมินผลการปฏิบัติงาน (KPI)", url: "#" },
        { title: "สมัครอบรมภายใน", url: "#" },
      ],
    },
  ];

  const circularLetters = [
    {
      id: 1,
      no: 1,
      title: "ประกาศวันหยุดตามประเพณี ประจำปี พ.ศ. 2568",
      date: "02 ม.ค. 68",
      dept: "ส่วนบุคคล",
      bookNo: "ปข.6/ว.001",
      type: "ประกาศ",
      statusColor: "bg-red-500",
      phone: "0-2831-XXXX",
      details:
        "แจ้งกำหนดการวันหยุดตามประเพณี เพื่อให้พนักงานวางแผนการปฏิบัติงานล่วงหน้า โดยมีรายละเอียดวันหยุดรวมทั้งสิ้น 17 วัน...",
      links: [
        { name: "ปฏิทินวันหยุด 2568 (Google Calendar)", url: "#" },
        { name: "ระเบียบการลาหยุด", url: "#" },
      ],
      files: [
        { name: "ประกาศ_วันหยุด2568.pdf", size: "1.2 MB" },
        { name: "ตารางเวรปฏิบัติงาน.xlsx", size: "500 KB" },
      ],
    },
    {
      id: 2,
      no: 2,
      title: "ขอความร่วมมือมาตรการประหยัดพลังงานภายในสำนักงาน",
      date: "05 ม.ค. 68",
      dept: "ส่วนอำนวยการ",
      bookNo: "ปข.6/ว.005",
      type: "ขอความร่วมมือ",
      statusColor: "bg-blue-500",
      phone: "0-2831-XXXX",
      details:
        "เนื่องด้วยสภาวะค่าไฟฟ้าที่ปรับตัวสูงขึ้น จึงขอความร่วมมือทุกส่วนงาน ปิดไฟและเครื่องปรับอากาศในช่วงพักเที่ยง และถอดปลั๊กอุปกรณ์ไฟฟ้าเมื่อเลิกใช้งาน...",
      links: [],
      files: [{ name: "มาตรการประหยัดพลังงาน.pdf", size: "850 KB" }],
    },
    {
      id: 3,
      no: 3,
      title: "การปรับปรุงระบบเครือข่ายอินเทอร์เน็ต (Maintenance)",
      date: "08 ม.ค. 68",
      dept: "ส่วนเทคโนโลยี",
      bookNo: "ปข.6/ว.012",
      type: "แจ้งเพื่อทราบ",
      statusColor: "bg-amber-500",
      phone: "0-2831-XXXX",
      details:
        "จะทำการปิดปรับปรุงระบบเครือข่าย Core Network ในวันที่ 15 มกราคม 2568 เวลา 02:00 - 04:00 น. ส่งผลให้ไม่สามารถใช้งานระบบสารบรรณได้ชั่วคราว",
      links: [{ name: "ตรวจสอบสถานะระบบ", url: "#" }],
      files: [],
    },
    {
      id: 4,
      no: 4,
      title: "เชิญชวนร่วมกิจกรรม 'ไปรษณีย์ไทย ห่วงใยสุขภาพ'",
      date: "10 ม.ค. 68",
      dept: "ประชาสัมพันธ์",
      bookNo: "ปข.6/ป.003",
      type: "กิจกรรม",
      statusColor: "bg-green-500",
      phone: "0-2831-XXXX",
      details:
        "ขอเชิญพนักงานทุกท่านเข้าร่วมตรวจสุขภาพประจำปี และร่วมกิจกรรมเดิน-วิ่ง การกุศล ในวันที่ 20 มกราคม นี้ ณ สวนสาธารณะ...",
      links: [
        { name: "แบบฟอร์มลงทะเบียน", url: "#" },
        { name: "รายละเอียดเส้นทางวิ่ง", url: "#" },
      ],
      files: [
        { name: "โปสเตอร์กิจกรรม.jpg", size: "2.5 MB" },
        { name: "ตารางตรวจสุขภาพ.pdf", size: "600 KB" },
      ],
    },
  ];

  const newsItems = [
    {
      id: 1,
      date: "14",
      month: "ธ.ค.",
      title: "ประชุมสรุปผลการดำเนินงาน ประจำไตรมาสที่ 4/2567",
      excerpt:
        "ขอเชิญหัวหน้าส่วนงานทุกท่านเข้าร่วมประชุมเพื่อติดตามผลการปฏิบัติงานและวางแผนกลยุทธ์ประจำปี...",
      author: "แผนกอำนวยการ",
    },
    {
      id: 2,
      date: "12",
      month: "ธ.ค.",
      title: "เปิดรับสมัครสอบเลื่อนระดับพนักงาน ประจำปี 2568",
      excerpt:
        "รายละเอียดหลักเกณฑ์และคุณสมบัติผู้มีสิทธิสอบเลื่อนระดับ สามารถดาวน์โหลดเอกสารแนบได้ที่นี่...",
      author: "ส่วนบุคคล",
    },
    {
      id: 3,
      date: "09",
      month: "ธ.ค.",
      title: 'กิจกรรม "ไปรษณีย์ไทย...เพื่อสังคม" มอบทุนการศึกษา',
      excerpt:
        "ภาพบรรยากาศกิจกรรมมอบทุนการศึกษาและอุปกรณ์กีฬาให้กับโรงเรียนในพื้นที่ห่างไกล...",
      author: "ประชาสัมพันธ์",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-gray-800 font-sans selection:bg-red-500 selection:text-white flex flex-col overflow-x-hidden">
      {/* --------------------------------------------------------------------------------
         GLOBAL STYLES & ANIMATIONS
      -------------------------------------------------------------------------------- */}
      <style jsx global>{`
        /* Grid Background Pattern */
        .bg-grid-slate {
          background-size: 40px 40px;
          background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }

        /* Data Flow Lines Animation */
        @keyframes dash-flow {
          to {
            stroke-dashoffset: -100;
          }
        }
        .animate-dash-flow {
          animation: dash-flow 2s linear infinite;
        }

        /* Floating Cards Animation */
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
        .animate-float-card-2 {
          animation: float-card 6s ease-in-out infinite 1s;
        }
        .animate-float-card-3 {
          animation: float-card 7s ease-in-out infinite 0.5s;
        }

        /* Pulse Ring */
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        /* Gradient Text Shimmer */
        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        .text-shimmer {
          background-size: 200% auto;
          animation: shimmer 5s linear infinite;
        }
      `}</style>

      {/* --------------------------------------------------------------------------------
         NAVBAR
      -------------------------------------------------------------------------------- */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-2"
            : "bg-transparent border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#ED1C24] text-white flex items-center justify-center rounded-lg shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 8l8 5 8-5V19H4V8zM20 6H4l8 5 8-5z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 leading-none">
                ปข.6
              </span>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase">
                Internal Portal
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center bg-white/50 backdrop-blur-sm px-1 py-1 rounded-full border border-gray-200/50 shadow-sm">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  item.active
                    ? "bg-[#ED1C24] text-white shadow-md shadow-red-200"
                    : "text-gray-500 hover:text-[#ED1C24] hover:bg-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* --------------------------------------------------------------------------------
         NEW HERO SECTION: Information Logistics Theme
      -------------------------------------------------------------------------------- */}
      <section className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden pt-24 pb-12">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[#FAFAFA]">
          <div className="absolute inset-0 bg-grid-slate [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
          {/* Ambient Glow */}
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="container relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content: Text & Vision */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm transition-transform hover:scale-105 cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ED1C24]"></span>
              </span>
              <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">
                Thailand Post Sector 6
              </span>
              <span className="w-px h-4 bg-gray-300 mx-1"></span>
              <span className="text-xs font-bold text-[#ED1C24]">
                Digital Transformation
              </span>
            </div>

            {/* Headlines */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                ขับเคลื่อนอนาคต <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ED1C24] via-rose-500 to-[#ED1C24] text-shimmer">
                  Information
                </span>{" "}
                <br />
                <span className="text-gray-800">Logistics</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-500 font-medium max-w-lg leading-relaxed">
              ก้าวสู่การเป็นศูนย์กลางโลจิสติกส์สารสนเทศที่แข็งแกร่ง
              ผสานความยั่งยืน {/* เปลี่ยนสี Sustainability เป็นแดง */}
              <span className="text-[#ED1C24] font-semibold">
                (Sustainability)
              </span>{" "}
              กับนวัตกรรมดิจิทัล เชื่อมโยงคนไทยและเศรษฐกิจด้วยบริการครบวงจร
            </p>

            {/* ลบปุ่มออก และ ลบ Stats ออก ตามที่ขอ */}
          </div>

          {/* Right Content: 3D Tech Visualization */}
          <div className="relative h-[600px] w-full flex items-center justify-center perspective-[1000px]">
            {/* Central Hub Node */}
            <div className="relative w-40 h-40 z-20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-[#ED1C24] rounded-3xl transform rotate-45 shadow-2xl shadow-red-500/40 flex items-center justify-center animate-float">
                <svg
                  className="w-16 h-16 text-white transform -rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              {/* Pulse Effects */}
              <div className="absolute inset-0 border-2 border-red-500/30 rounded-3xl transform rotate-45 animate-pulse-ring"></div>
              <div className="absolute inset-0 border border-red-500/20 rounded-3xl transform rotate-45 animate-pulse-ring delay-300"></div>
            </div>

            {/* Connection Lines (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 600 600"
            >
              {/* Line to Top Right */}
              <path
                d="M300 300 L450 150"
                stroke="#E5E7EB"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="450" cy="150" r="3" fill="#ED1C24" />

              {/* Line to Bottom Left (Sustainability) - เปลี่ยนเป็นสีแดง */}
              <path
                d="M300 300 L150 450"
                stroke="#E5E7EB"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="150" cy="450" r="3" fill="#ED1C24" />

              {/* Line to Bottom Right */}
              <path
                d="M300 300 L450 400"
                stroke="#E5E7EB"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="450" cy="400" r="3" fill="#3B82F6" />

              {/* Animated Flow Lines */}
              <path
                d="M300 300 L450 150"
                stroke="#ED1C24"
                strokeWidth="2"
                strokeDasharray="10 100"
                className="animate-dash-flow opacity-50"
              />
              {/* เส้น Sustainability ไหลเป็นสีแดง */}
              <path
                d="M150 450 L300 300"
                stroke="#ED1C24"
                strokeWidth="2"
                strokeDasharray="10 100"
                className="animate-dash-flow opacity-50"
              />
            </svg>

            {/* Floating Card 1: Sustainability (เปลี่ยนเป็นสีแดงทั้งหมด) */}
            <div className="absolute top-20 right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 animate-float-card-1 z-30 max-w-[180px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#ED1C24]">
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
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Sustainability
                </span>
              </div>
              <div className="text-sm font-bold text-gray-800">
                Green Logistics
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                ลดการปล่อยคาร์บอน
              </div>
            </div>

            {/* Floating Card 2: Digital Services (Blue) */}
            <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 animate-float-card-2 z-30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
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
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Innovation
                </span>
              </div>
              <div className="text-sm font-bold text-gray-800">
                Smart Hub 6.0
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 w-3/4 h-full rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Floating Card 3: Network (Red/Brand) */}
            <div className="absolute bottom-24 right-0 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border-l-4 border-[#ED1C24] animate-float-card-3 z-20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-gray-700">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         SECTION: CIRCULAR LETTERS (หนังสือเวียน) - UNIFIED HEADER
      -------------------------------------------------------------------------------- */}
      <section
        id="circular"
        className="py-24 px-6 bg-white border-t border-gray-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#ED1C24] text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]"></span>
                E-Document
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 tracking-tight">
                หนังสือเวียน
              </h2>
              <p className="text-gray-500 mt-2 font-medium max-w-lg">
                ประกาศ คำสั่ง และหนังสือขอความร่วมมือล่าสุด
              </p>
            </div>
            <button className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:border-red-200 hover:text-[#ED1C24] hover:shadow-sm transition-all">
              ดูทั้งหมด
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider text-left w-24">
                      ลำดับ
                    </th>
                    <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
                      หัวข้อเรื่อง
                    </th>
                    <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-left w-40">
                      ลงวันที่
                    </th>
                    <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-left w-48">
                      ส่วนงาน
                    </th>
                    <th className="py-5 px-8 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-32">
                      รายละเอียด
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {circularLetters.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className="group hover:bg-white transition-all duration-300 relative"
                    >
                      <td className="py-6 px-8">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                          {doc.no}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 w-2 h-2 rounded-full ${doc.statusColor} shrink-0`}
                          ></div>
                          <div>
                            <div className="text-base font-bold text-gray-800 group-hover:text-[#ED1C24] transition-colors leading-snug mb-1">
                              {doc.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                                {doc.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                เลขที่: {doc.bookNo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                          <svg
                            className="w-4 h-4 text-gray-300"
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
                          {doc.date}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-gray-600">
                            {doc.dept}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        {/* Eye Icon Button */}
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#ED1C24] hover:border-[#ED1C24] hover:shadow-md transition-all duration-300 transform group-hover:scale-110 ml-auto"
                          title="ดูรายละเอียด"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         SECTION: SERVICES (GRID) - UNIFIED HEADER
      -------------------------------------------------------------------------------- */}
      <section
        id="hub-links"
        className="py-24 px-6 bg-[#FAFAFA] border-t border-gray-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#ED1C24] text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]"></span>
                Internal Services
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 tracking-tight">
                บริการภายในเขต 6
              </h2>
              <p className="text-gray-500 mt-2 font-medium max-w-lg">
                ระบบสารสนเทศเพื่อการบริหารและการปฏิบัติงาน
                เชื่อมโยงทุกส่วนงานเข้าด้วยกัน
              </p>
            </div>
            <button className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:border-red-200 hover:text-[#ED1C24] hover:shadow-sm transition-all">
              ดูทั้งหมด
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hubItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedHub(item)}
                className="cursor-pointer group bg-white border border-gray-100 hover:border-red-100 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(237,28,36,0.15)] hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${item.bg} bg-opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className={item.bg.split(" ")[1]}>{item.icon}</div>
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-[#ED1C24] transition-colors">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-400 font-medium">{item.code}</p>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center text-xs font-bold text-gray-300 group-hover:text-red-400 transition-colors">
                  <span>เลือกรายการ</span>
                  <svg
                    className="w-4 h-4 ml-auto transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         SECTION: NEWS - UNIFIED HEADER
      -------------------------------------------------------------------------------- */}
      <section
        id="news"
        className="py-24 px-6 bg-white border-t border-gray-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#ED1C24] text-[10px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED1C24]"></span>
                Update & Activities
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 tracking-tight">
                ข่าวสารล่าสุด
              </h2>
              <p className="text-gray-500 mt-2 font-medium max-w-lg">
                อัปเดตข้อมูลข่าวสาร กิจกรรม และความเคลื่อนไหว
              </p>
            </div>
            <Link
              href="#"
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:border-red-200 hover:text-[#ED1C24] hover:shadow-sm transition-all"
            >
              ดูทั้งหมด
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((news, idx) => (
              <article
                key={idx}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1"
              >
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12 opacity-30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#ED1C24]"></span>
                      {news.author}
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-center shadow-lg">
                    <span className="block text-xl font-black text-[#ED1C24] leading-none">
                      {news.date}
                    </span>
                    <span className="block text-[10px] font-bold text-gray-800 uppercase tracking-wide">
                      {news.month}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#ED1C24] transition-colors cursor-pointer">
                    {news.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                    {news.excerpt}
                  </p>
                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <span className="text-xs font-bold text-gray-400 group-hover:text-[#ED1C24] flex items-center gap-1 transition-colors cursor-pointer">
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
      </section>

      {/* --------------------------------------------------------------------------------
         FOOTER
      -------------------------------------------------------------------------------- */}
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
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#ED1C24] hover:text-white transition-all hover:scale-110 shadow-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#ED1C24] hover:text-white transition-all hover:scale-110 shadow-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
              </div>
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
                <li>
                  <a
                    href="#"
                    className="hover:text-[#ED1C24] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-500 transition-colors"></span>{" "}
                    ค้นหาไปรษณีย์ไทย
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#ED1C24] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-500 transition-colors"></span>{" "}
                    Intranet ส่วนกลาง
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
                    เลขที่ 123 ถนนราชวิถี ตำบลพระปฐมเจดีย์ <br />{" "}
                    อำเภอเมืองนครปฐม จังหวัดนครปฐม 73000
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
                    0-3425-XXXX{" "}
                    <span className="text-xs text-gray-400 font-normal block">
                      (งานอำนวยการ)
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

      {/* --------------------------------------------------------------------------------
         MODALS (DOCUMENTS, HUB & CONTACT)
      -------------------------------------------------------------------------------- */}
      {(selectedHub || isContactOpen || selectedDocument) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setSelectedHub(null);
              setIsContactOpen(false);
              setSelectedDocument(null);
            }}
          ></div>

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => {
                  setSelectedHub(null);
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

            {/* 1. DOCUMENT MODAL (หนังสือเวียน) */}
            {selectedDocument && (
              <>
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

                  {/* Links */}
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
                          {selectedDocument.links.map(
                            (link: any, i: number) => (
                              <li key={i}>
                                <a
                                  href={link.url}
                                  className="flex items-center gap-2 text-sm text-[#ED1C24] hover:underline font-medium p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                  {link.name}
                                </a>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Files */}
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
                          {selectedDocument.files.map(
                            (file: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-red-200 hover:shadow-sm transition-all group cursor-pointer"
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
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}

            {/* 2. CONTACT MODAL */}
            {isContactOpen && (
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
            )}

            {/* 3. HUB LINKS MODAL */}
            {selectedHub && (
              <div className="p-6">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 ${
                      selectedHub.bg
                    } bg-opacity-20 text-${
                      selectedHub.bg.split("-")[2]
                    }-600 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <div className="w-8 h-8">{selectedHub.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">
                    {selectedHub.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {selectedHub.code}
                  </p>
                  <div className="space-y-2">
                    {selectedHub.links.map((link: any, i: number) => (
                      <a
                        key={i}
                        href={link.url}
                        className="block w-full p-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-colors text-sm flex justify-between items-center group"
                      >
                        {link.title}
                        <svg
                          className="w-4 h-4 text-gray-300 group-hover:text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
