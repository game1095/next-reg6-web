"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const router = useRouter();

  // --- Auth & UI States ---
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("circular");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // --- Data & Selection States ---
  const [docList, setDocList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // --- Modal States ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Edit States ---
  const [isEditing, setIsEditing] = useState(false);
  const [editDocId, setEditDocId] = useState<number | null>(null);

  // --- Helper: Get Today Date (YYYY-MM-DD) ---
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

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
    return `${d} ${months[m - 1]} ${y + 543}`;
  };

  // --- Helper: Get Color based on Type ---
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "คำสั่ง":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ประกาศ":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ขอความร่วมมือ":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default: // บันทึกข้อความ
        return "bg-teal-50 text-teal-700 border-teal-200";
    }
  };

  // --- Departments List ---
  const departments = ["รป.", "ทข.", "ตล.", "บค.", "อบ.", "กง.", "ทพ."];

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    book_no: "",
    date: getTodayDate(),
    dept: "",
    type: "บันทึกข้อความ",
    details: "",
    phone: "",
    status: "published",
  });

  const [linkList, setLinkList] = useState<{ name: string; url: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);

  // --- Init ---
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
        return;
      }
      setUserEmail(user.email || "Admin");
      setIsAuthChecking(false);
      fetchDocuments();
    };
    init();
  }, [router]);

  // --- Database Functions ---
  const fetchDocuments = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("id", { ascending: false });

    if (error) console.error("Error fetching docs:", error);
    else setDocList(data || []);
    setIsLoadingData(false);
    setSelectedIds([]);
  };

  const uploadFilesToStorage = async () => {
    const uploadedFiles = [];
    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (error) {
        Swal.fire({
          icon: "error",
          title: "อัปโหลดล้มเหลว",
          text: `ไฟล์ ${file.name}: ${error.message}`,
          confirmButtonColor: "#ED1C24",
        });
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      uploadedFiles.push({
        name: file.name,
        url: publicUrlData.publicUrl,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      });
    }
    return uploadedFiles;
  };

  const handleToggleStatus = async (doc: any) => {
    const newStatus = doc.status === "published" ? "draft" : "published";
    setDocList((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: newStatus } : d))
    );

    const { error } = await supabase
      .from("documents")
      .update({ status: newStatus })
      .eq("id", doc.id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "เปลี่ยนสถานะไม่สำเร็จ: " + error.message,
        confirmButtonColor: "#ED1C24",
      });
      fetchDocuments();
    }
  };

  // --- Bulk Actions Functions ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredDocs.map((doc) => doc.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `ลบ ${selectedIds.length} รายการ?`,
      text: "คุณแน่ใจหรือไม่ที่จะลบเอกสารที่เลือกทั้งหมด การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("documents")
        .delete()
        .in("id", selectedIds);

      if (error) {
        Swal.fire("Error", error.message, "error");
      } else {
        Swal.fire("Deleted!", "ลบข้อมูลเรียบร้อยแล้ว", "success");
        fetchDocuments();
        setSelectedIds([]);
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: "published" | "draft") => {
    if (selectedIds.length === 0) return;

    const statusText = newStatus === "published" ? "เผยแพร่" : "ซ่อน (Draft)";

    const { error } = await supabase
      .from("documents")
      .update({
        status: newStatus,
        status_color:
          newStatus === "published" ? "bg-green-500" : "bg-gray-400",
      })
      .in("id", selectedIds);

    if (error) {
      Swal.fire("Error", error.message, "error");
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "success",
        title: `เปลี่ยนสถานะเป็น "${statusText}" เรียบร้อยแล้ว`,
      });
      fetchDocuments();
      setSelectedIds([]);
    }
  };

  const handleEditClick = (doc: any) => {
    setIsEditing(true);
    setEditDocId(doc.id);
    setFormData({
      title: doc.title,
      book_no: doc.book_no,
      date: doc.date,
      dept: doc.dept,
      type: doc.type,
      details: doc.details || "",
      phone: doc.phone || "",
      status: doc.status,
    });
    setLinkList(doc.links || []);
    setExistingFiles(doc.files || []);
    setSelectedFiles([]);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.book_no.trim() ||
      !formData.title.trim() ||
      !formData.date ||
      !formData.dept ||
      !formData.details.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลให้ครบทุกช่อง (ยกเว้นไฟล์และลิงก์)",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newUploadedFiles = await uploadFilesToStorage();
      const finalFiles = isEditing
        ? [...existingFiles, ...newUploadedFiles]
        : newUploadedFiles;

      const payload = {
        ...formData,
        links: linkList,
        files: finalFiles,
        status_color:
          formData.status === "published" ? "bg-green-500" : "bg-gray-400",
      };

      let error;
      if (isEditing && editDocId) {
        const { error: updateError } = await supabase
          .from("documents")
          .update(payload)
          .eq("id", editDocId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("documents")
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: isEditing
          ? "แก้ไขข้อมูลเรียบร้อยแล้ว"
          : "เพิ่มเอกสารใหม่เรียบร้อยแล้ว",
        confirmButtonColor: "#ED1C24",
        confirmButtonText: "ตกลง",
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        confirmButtonColor: "#ED1C24",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoc = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบเอกสารนี้ใช่ไหม การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบเอกสาร",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) {
        Swal.fire({
          icon: "error",
          title: "ลบไม่สำเร็จ",
          text: error.message,
          confirmButtonColor: "#ED1C24",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "ลบเรียบร้อย",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchDocuments();
      }
    }
  };

  // --- Helpers & Reset ---
  const handleViewDoc = (doc: any) => {
    setSelectedDoc(doc);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      book_no: "",
      date: getTodayDate(),
      dept: "",
      type: "บันทึกข้อความ",
      details: "",
      phone: "",
      status: "published",
    });
    setLinkList([]);
    setSelectedFiles([]);
    setExistingFiles([]);
    setIsEditing(false);
    setEditDocId(null);
  };

  const resetFilter = () => {
    setSearchTerm("");
    setFilterDept("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "ออกจากระบบ?",
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ED1C24",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      await supabase.auth.signOut();
      router.replace("/");
    }
  };

  const filteredDocs = docList.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(term) ||
      doc.book_no.toLowerCase().includes(term) ||
      (doc.details && doc.details.toLowerCase().includes(term));

    const matchesDept = filterDept ? doc.dept === filterDept : true;
    const matchesStartDate = filterStartDate
      ? doc.date >= filterStartDate
      : true;
    const matchesEndDate = filterEndDate ? doc.date <= filterEndDate : true;

    return matchesSearch && matchesDept && matchesStartDate && matchesEndDate;
  });

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-red-200 border-t-[#ED1C24] rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Components (Sidebar) ---
  const Sidebar = () => (
    <aside
      className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl border-r border-gray-100 z-50 transition-all duration-300 ${
        isSidebarOpen ? "w-72" : "w-20"
      } hidden md:flex flex-col`}
    >
      <div className="h-20 flex items-center justify-center border-b border-gray-100">
        <div className="flex items-center gap-3 font-black text-xl text-gray-800 tracking-tight">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ED1C24] to-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
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
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </div>
          {isSidebarOpen && (
            <span>
              Admin<span className="text-[#ED1C24]">Hub</span>
            </span>
          )}
        </div>
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-bold text-gray-400 uppercase px-4 py-2 mt-4 tracking-wider">
          {isSidebarOpen ? "Menu" : "..."}
        </div>
        <MenuItem
          icon={<HomeIcon />}
          label="ภาพรวม (Overview)"
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <div className="text-xs font-bold text-gray-400 uppercase px-4 py-2 mt-6 tracking-wider">
          {isSidebarOpen ? "Management" : "..."}
        </div>
        <MenuItem
          icon={<DocIcon />}
          label="จัดการบันทึกข้อความ"
          active={activeTab === "circular"}
          onClick={() => setActiveTab("circular")}
        />
        <MenuItem
          icon={<NewsIcon />}
          label="จัดการข่าวสาร"
          active={activeTab === "news"}
          onClick={() => setActiveTab("news")}
        />
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
        >
          <LogoutIcon />
          {isSidebarOpen && (
            <span className="font-bold text-sm">ออกจากระบบ</span>
          )}
        </button>
      </div>
    </aside>
  );

  const MenuItem = ({ icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-red-50 text-[#ED1C24]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <div
        className={`transition-colors ${
          active ? "text-[#ED1C24]" : "text-gray-400 group-hover:text-gray-600"
        }`}
      >
        {icon}
      </div>
      {isSidebarOpen && (
        <span className="font-bold text-sm whitespace-nowrap">{label}</span>
      )}
      {active && isSidebarOpen && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ED1C24]"></div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans selection:bg-red-100 selection:text-red-600">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? "md:ml-72" : "md:ml-20"
        } min-h-screen flex flex-col`}
      >
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm shadow-gray-100/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <MenuIcon />
            </button>
            <h1 className="text-xl font-black text-gray-800 capitalize tracking-tight">
              {activeTab === "circular" ? "จัดการบันทึกข้อความ" : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{userEmail}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Super Admin
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border-2 border-white shadow-md"></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1">
          {activeTab === "circular" ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* Toolbar & Filters */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-700 hidden md:block">
                    รายการเอกสารทั้งหมด
                  </h2>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsAddModalOpen(true);
                    }}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#ED1C24] to-red-600 text-white rounded-xl shadow-lg shadow-red-200 text-sm font-bold hover:shadow-red-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusIcon /> เพิ่มเอกสารใหม่
                  </button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative group w-full md:w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ED1C24] transition-colors">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาเลขที่, หัวข้อ, รายละเอียด..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-100 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                    />
                  </div>

                  <div className="w-full md:w-1/4">
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:border-red-100 focus:ring-4 focus:ring-red-50 outline-none cursor-pointer"
                    >
                      <option value="">ทุกส่วนงาน</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:border-red-100 focus:ring-4 focus:ring-red-50 outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:border-red-100 focus:ring-4 focus:ring-red-50 outline-none"
                    />
                  </div>

                  <button
                    onClick={resetFilter}
                    className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 hover:text-gray-700 transition-colors text-sm font-bold whitespace-nowrap"
                  >
                    ล้างตัวกรอง
                  </button>
                </div>

                {/* ✅ ส่วน Bulk Actions Bar */}
                {selectedIds.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#ED1C24] text-white text-xs font-bold px-2 py-1 rounded-full">
                        {selectedIds.length}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        รายการที่เลือก
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkStatusChange("published")}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                      >
                        เผยแพร่ (Publish)
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange("draft")}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg text-xs font-bold hover:bg-gray-500 transition-colors"
                      >
                        ซ่อน (Draft)
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <TrashIcon /> ลบที่เลือก
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                {isLoadingData ? (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-red-100 border-t-[#ED1C24] rounded-full animate-spin"></div>
                    <span className="text-gray-400 font-medium">
                      กำลังโหลดข้อมูล...
                    </span>
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center text-gray-400 gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <DocIcon size={40} />
                    </div>
                    <p>ไม่พบข้อมูลเอกสารตามเงื่อนไขที่กำหนด</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500">
                        <tr>
                          {/* ✅ Checkbox Select All */}
                          <th className="p-5 w-10 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                              onChange={handleSelectAll}
                              checked={
                                filteredDocs.length > 0 &&
                                selectedIds.length === filteredDocs.length
                              }
                            />
                          </th>
                          <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-32 pl-2">
                            สถานะ
                          </th>
                          <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-40">
                            เลขที่หนังสือ
                          </th>
                          <th className="p-5 text-xs font-extrabold uppercase tracking-wider">
                            เรื่อง / รายละเอียด
                          </th>
                          <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-32">
                            ประเภท
                          </th>
                          <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-48">
                            ส่วนงาน
                          </th>
                          <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-40">
                            วันที่
                          </th>
                          <th className="p-5 text-xs font-extrabold uppercase tracking-wider text-right w-36 pr-8">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredDocs.map((doc) => (
                          <tr
                            key={doc.id}
                            className={`group transition-colors ${
                              selectedIds.includes(doc.id)
                                ? "bg-red-50/40"
                                : "hover:bg-red-50/30"
                            }`}
                          >
                            {/* ✅ Checkbox รายแถว */}
                            <td className="p-5 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                                checked={selectedIds.includes(doc.id)}
                                onChange={() => handleSelectOne(doc.id)}
                              />
                            </td>
                            <td className="p-5 pl-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                  doc.status === "published"
                                    ? "bg-green-50 text-green-600 border-green-100"
                                    : "bg-gray-50 text-gray-500 border-gray-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    doc.status === "published"
                                      ? "bg-green-500"
                                      : "bg-gray-400"
                                  }`}
                                ></span>
                                {doc.status === "published"
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            </td>
                            <td className="p-5 text-sm font-bold text-gray-900 group-hover:text-[#ED1C24] transition-colors">
                              {doc.book_no}
                            </td>
                            <td className="p-5">
                              <div className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                                {doc.title}
                              </div>
                              <div className="flex gap-2">
                                {doc.files?.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    <FileIcon /> {doc.files.length} ไฟล์
                                  </span>
                                )}
                                {doc.links?.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    <LinkIcon /> {doc.links.length} ลิงก์
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-5">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getTypeBadgeColor(
                                  doc.type
                                )}`}
                              >
                                {doc.type}
                              </span>
                            </td>

                            <td className="p-5 text-sm font-medium text-gray-500">
                              {doc.dept}
                            </td>
                            <td className="p-5 text-sm text-gray-500 font-medium">
                              {formatThaiDate(doc.date)}
                            </td>
                            <td className="p-5 pr-8 text-right flex justify-end gap-2 items-center">
                              <button
                                onClick={() => handleToggleStatus(doc)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  doc.status === "published"
                                    ? "text-green-500 hover:bg-green-50"
                                    : "text-gray-400 hover:bg-gray-100"
                                }`}
                                title={
                                  doc.status === "published"
                                    ? "ซ่อน (Draft)"
                                    : "เผยแพร่ (Publish)"
                                }
                              >
                                {doc.status === "published" ? (
                                  <ToggleOnIcon />
                                ) : (
                                  <ToggleOffIcon />
                                )}
                              </button>

                              <button
                                onClick={() => handleEditClick(doc)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                                title="แก้ไข"
                              >
                                <PencilIcon />
                              </button>

                              <button
                                onClick={() => handleViewDoc(doc)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                title="ดูรายละเอียด"
                              >
                                <EyeIcon />
                              </button>

                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="ลบ"
                              >
                                <TrashIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-300">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                <SettingIcon size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-400">
                อยู่ระหว่างการพัฒนา
              </h3>
              <p className="text-sm">ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้</p>
            </div>
          )}
        </div>
      </main>

      {/* --- ADD/EDIT MODAL (✅ ปรับขนาดใหญ่ขึ้นตามที่ขอไว้) --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl relative z-10 animate-fade-in-up flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  {isEditing ? "แก้ไขบันทึกข้อความ" : "เพิ่มบันทึกข้อความ"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isEditing
                    ? "แก้ไขรายละเอียดเอกสาร"
                    : "กรอกรายละเอียดเอกสารเพื่อเผยแพร่ในระบบ"}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </div>

            <form
              onSubmit={handleAddSubmit}
              className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8"
            >
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-[1px] bg-gray-300"></span> ข้อมูลทั่วไป
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      เลขที่หนังสือ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="book_no"
                      required
                      value={formData.book_no}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                      placeholder="เช่น ปข.6/ว.001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      ลงวันที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    หัวข้อเรื่อง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      ส่วนงานเจ้าของ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="dept"
                        required
                        value={formData.dept}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">-- เลือกส่วนงาน --</option>
                        {departments.map((deptName) => (
                          <option key={deptName} value={deptName}>
                            {deptName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      ประเภท
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none appearance-none transition-all cursor-pointer"
                      >
                        <option value="บันทึกข้อความ">บันทึกข้อความ</option>
                        <option value="ประกาศ">ประกาศ</option>
                        <option value="คำสั่ง">คำสั่ง</option>
                        <option value="ขอความร่วมมือ">ขอความร่วมมือ</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    รายละเอียดโดยย่อ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="details"
                    rows={3}
                    value={formData.details}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-[1px] bg-gray-300"></span>{" "}
                  ไฟล์แนบและลิงก์
                </h4>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    อัปโหลดไฟล์{" "}
                    {isEditing && existingFiles.length > 0 && "(เพิ่มไฟล์ใหม่)"}
                  </label>

                  {/* แสดงไฟล์เดิมตอนแก้ไข */}
                  {isEditing && existingFiles.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <p className="text-xs text-gray-400 font-bold">
                        ไฟล์เดิมที่มีอยู่:
                      </p>
                      {existingFiles.map((file: any, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 p-2 rounded-lg border border-gray-200"
                        >
                          <FileIcon />
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="text-xs text-gray-400">
                            ({file.size})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              // ลบไฟล์จาก existingFiles
                              const n = [...existingFiles];
                              n.splice(idx, 1);
                              setExistingFiles(n);
                            }}
                            className="text-red-400 hover:text-red-600 px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 hover:border-red-200 transition-all relative group cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files)
                          setSelectedFiles((prev) => [
                            ...prev,
                            ...Array.from(e.target.files!),
                          ]);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-red-400 transition-colors">
                      <CloudUploadIcon />
                      <span className="text-sm font-medium">
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                      </span>
                    </div>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-2 pl-3 rounded-lg border border-gray-100"
                        >
                          <span className="text-xs font-medium text-gray-600 truncate">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const n = [...selectedFiles];
                              n.splice(idx, 1);
                              setSelectedFiles(n);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <span className="text-xs">✕</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">
                      ลิงก์ภายนอก
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setLinkList([...linkList, { name: "", url: "" }])
                      }
                      className="text-xs font-bold text-[#ED1C24] hover:underline flex items-center gap-1"
                    >
                      + เพิ่มลิงก์
                    </button>
                  </div>
                  {linkList.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ชื่อลิงก์"
                        value={link.name}
                        onChange={(e) => {
                          const n = [...linkList];
                          n[idx].name = e.target.value;
                          setLinkList(n);
                        }}
                        className="w-1/3 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-red-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="URL (https://...)"
                        value={link.url}
                        onChange={(e) => {
                          const n = [...linkList];
                          n[idx].url = e.target.value;
                          setLinkList(n);
                        }}
                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:border-red-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const n = [...linkList];
                          n.splice(idx, 1);
                          setLinkList(n);
                        }}
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      formData.status === "published"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {formData.status === "published" ? (
                      <EyeIcon />
                    ) : (
                      <EyeOffIcon />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      สถานะเอกสาร
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.status === "published"
                        ? "แสดงผลบนหน้าเว็บทันที"
                        : "ซ่อนไว้ (แบบร่าง)"}
                    </p>
                  </div>
                </div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="p-2 pr-8 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-red-500 outline-none cursor-pointer"
                >
                  <option value="published">เผยแพร่ (Public)</option>
                  <option value="draft">ไม่เผยแพร่ (Draft)</option>
                </select>
              </section>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#ED1C24] text-white rounded-xl text-sm font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <SaveIcon />
                )}
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW DETAIL MODAL (✅ ปรับขนาดใหญ่ขึ้นตามที่ขอไว้) --- */}
      {isViewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsViewModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 animate-fade-in-up flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedDoc.status === "published"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedDoc.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs font-bold text-[#ED1C24]">
                    {selectedDoc.book_no}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    ส่วนงานเจ้าของ
                  </p>
                  <p className="font-semibold text-gray-700">
                    {selectedDoc.dept}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    ลงวันที่
                  </p>
                  <p className="font-semibold text-gray-700">
                    {formatThaiDate(selectedDoc.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    ประเภท
                  </p>
                  <p className="font-semibold text-gray-700">
                    {selectedDoc.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    โทรศัพท์
                  </p>
                  <p className="font-semibold text-gray-700">
                    {selectedDoc.phone || "-"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                  รายละเอียด
                </p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selectedDoc.details || "-"}
                </p>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                {selectedDoc.links?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                      ลิงก์แนบ
                    </p>
                    <ul className="space-y-2">
                      {selectedDoc.links.map((link: any, i: number) => (
                        <li key={i}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-[#ED1C24] hover:underline font-medium p-2 bg-red-50/50 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <LinkIcon /> {link.name || link.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedDoc.files?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                      ไฟล์เอกสาร
                    </p>
                    <div className="space-y-2">
                      {selectedDoc.files.map((file: any, i: number) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-red-200 hover:shadow-sm transition-all group bg-white"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#ED1C24] group-hover:text-white transition-colors">
                              <FileIcon />
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="text-sm font-medium text-gray-700 truncate group-hover:text-[#ED1C24] transition-colors">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {file.size || "Unknown size"}
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Icons ---
const HomeIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);
const NewsIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
  </svg>
);
const DocIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const UserIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
const SettingIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const LogoutIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);
const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const CloudUploadIcon = () => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);
const SaveIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);
const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const EyeOffIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);
const FileIcon = () => (
  <svg
    width="12"
    height="12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
    />
  </svg>
);
const LinkIcon = () => (
  <svg
    width="12"
    height="12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.172a4 4 0 105.656-5.656l-1.172 1.172a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.172 1.172a4 4 0 105.656 5.656l1.172-1.172z"
    />
  </svg>
);
const PencilIcon = () => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const ToggleOnIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ToggleOffIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
