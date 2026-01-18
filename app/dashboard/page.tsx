"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

export default function DashboardPage() {
  const router = useRouter();

  // --- Auth & UI States ---
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userDept, setUserDept] = useState("");
  const [isDeptSelectionOpen, setIsDeptSelectionOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("circular"); // circular, news, systems, overview
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // --- Data & Selection States ---
  const [docList, setDocList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [systemList, setSystemList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // --- Modal States ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isViewNewsModalOpen, setIsViewNewsModalOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Progress Bar States (NEW) ---
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");

  // --- Edit States ---
  const [isEditing, setIsEditing] = useState(false);
  const [editDocId, setEditDocId] = useState<number | null>(null);
  const [editNewsId, setEditNewsId] = useState<number | null>(null);
  const [editSystemId, setEditSystemId] = useState<number | null>(null);

  // --- Toast ---
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // --- Helpers ---
  const getTodayDate = () => new Date().toISOString().split("T")[0];
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
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "คำสั่ง":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ประกาศ":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ขอความร่วมมือ":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ข่าวประชาสัมพันธ์":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ข่าวสารทั่วไป":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-teal-50 text-teal-700 border-teal-200";
    }
  };

  const departments = ["รป.", "ทข.", "ตล.", "บค.", "อบ.", "กง.", "ทพ."];
  const departmentFullNames: Record<string, string> = {
    "รป.": "ส่วนระบบไปรษณีย์และสารสนเทศ",
    "ทข.": "ส่วนทีมขายและดูแลลูกค้า",
    "ตล.": "ส่วนการตลาดและบริการลูกค้า",
    "บค.": "ส่วนบริการหลังการขายและคุณภาพ",
    "อบ.": "ส่วนอำนวยการและบุคคล",
    "กง.": "ส่วนการเงินและบัญชี",
    "ทพ.": "ส่วนทรัพย์สินและพัสดุ",
  };

  // --- Form Data ---
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

  const [newsFormData, setNewsFormData] = useState({
    type: "ข่าวประชาสัมพันธ์",
    date: getTodayDate(),
    title: "",
    details: "",
    status: "published",
  });
  const [newsCoverImage, setNewsCoverImage] = useState<File | null>(null);
  const [existingCoverImage, setExistingCoverImage] = useState<any>(null);
  const [newsGalleryImages, setNewsGalleryImages] = useState<File[]>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<any[]>([]);

  const [systemFormData, setSystemFormData] = useState({
    name: "",
    url: "",
    dept: "",
    status: "published",
  });

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
      if (!userDept) setIsDeptSelectionOpen(true);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (!userDept) return;
    if (activeTab === "circular") fetchDocuments();
    else if (activeTab === "news") fetchNews();
    else if (activeTab === "systems") fetchSystems();
  }, [activeTab, userDept]);

  useEffect(() => {
    resetFilter();
    setSelectedIds([]);
  }, [activeTab]);

  // --- DB Functions ---
  const fetchDocuments = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("dept", userDept)
      .order("id", { ascending: false });
    if (error) console.error(error);
    else setDocList(data || []);
    setIsLoadingData(false);
  };

  const fetchNews = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("id", { ascending: false });
    if (error) console.error(error);
    else setNewsList(data || []);
    setIsLoadingData(false);
  };

  const fetchSystems = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from("postal_systems")
      .select("*")
      .eq("dept", userDept)
      .order("id", { ascending: false });
    if (error) console.error(error);
    else setSystemList(data || []);
    setIsLoadingData(false);
  };

  const uploadFileSingle = async (file: File, bucket: string = "documents") => {
    let fileToUpload = file;
    // Compress Image if needed
    if (file.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        fileToUpload = new File([compressedFile], file.name, {
          type: file.type,
        });
      } catch (error) {
        console.warn("Image compression failed", error);
      }
    }
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return {
      name: file.name,
      url: data.publicUrl,
      size: (fileToUpload.size / 1024 / 1024).toFixed(2) + " MB",
    };
  };

  // --- Handlers ---

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemFormData.name || !systemFormData.url || !userDept) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกข้อมูลให้ครบ",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // Start Progress (Fake for System as no files)
    setIsSubmitting(true);
    setShowProgressModal(true);
    setUploadProgress(10);
    setCurrentTask("กำลังบันทึกข้อมูล...");

    try {
      setUploadProgress(50);
      const payload = {
        ...systemFormData,
        dept: userDept,
        status_color:
          systemFormData.status === "published"
            ? "bg-green-500"
            : "bg-gray-400",
      };

      if (isEditing && editSystemId) {
        await supabase
          .from("postal_systems")
          .update(payload)
          .eq("id", editSystemId);
      } else {
        await supabase.from("postal_systems").insert([payload]);
      }

      setUploadProgress(100);
      setCurrentTask("เสร็จสิ้น!");
      await new Promise((r) => setTimeout(r, 500)); // Show 100% briefly

      Toast.fire({ icon: "success", title: "บันทึกระบบงานเรียบร้อย" });
      setIsSystemModalOpen(false);
      resetSystemForm();
      fetchSystems();
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    } finally {
      setIsSubmitting(false);
      setShowProgressModal(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalTitle = newsFormData.title;
    if (newsFormData.type === "ข่าวสารทั่วไป" && !finalTitle.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกหัวข้อข่าว",
        confirmButtonColor: "#f59e0b",
      });
      return;
    } else if (newsFormData.type !== "ข่าวสารทั่วไป") {
      finalTitle = `ประชาสัมพันธ์วันที่ ${formatThaiDate(newsFormData.date)}`;
    }
    if (!newsFormData.details.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกรายละเอียด",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setIsSubmitting(true);
    setShowProgressModal(true);
    setUploadProgress(0);
    setCurrentTask("กำลังเตรียมข้อมูล...");

    try {
      // Calculate Total Steps: 1 (Init) + Cover(1) + Gallery(N) + 1 (Save DB)
      const hasCover = !!newsCoverImage;
      const galleryCount = newsGalleryImages.length;
      const totalSteps = 1 + (hasCover ? 1 : 0) + galleryCount + 1;
      let stepCount = 0;

      const updateProgress = (task: string) => {
        stepCount++;
        const pct = (stepCount / totalSteps) * 100;
        setUploadProgress(pct);
        setCurrentTask(task);
      };

      // Step 1: Init
      updateProgress("เริ่มกระบวนการอัปโหลด...");

      // Step 2: Cover Image
      let coverData = existingCoverImage;
      if (newsCoverImage) {
        setCurrentTask("กำลังอัปโหลดรูปปก...");
        coverData = await uploadFileSingle(newsCoverImage, "documents");
        updateProgress("อัปโหลดรูปปกเสร็จสิ้น");
      }

      // Step 3: Gallery Images
      const newGalleryData = [];
      if (newsFormData.type === "ข่าวสารทั่วไป" && galleryCount > 0) {
        for (let i = 0; i < galleryCount; i++) {
          const file = newsGalleryImages[i];
          setCurrentTask(`กำลังอัปโหลดรูปประกอบ (${i + 1}/${galleryCount})...`);
          const uploaded = await uploadFileSingle(file, "documents");
          newGalleryData.push(uploaded);
          updateProgress(`รูปประกอบ ${i + 1} เรียบร้อย`);
        }
      }
      const finalGalleryData = [...existingGalleryImages, ...newGalleryData];

      // Step 4: Save to DB
      setCurrentTask("กำลังบันทึกลงฐานข้อมูล...");
      const payload = {
        ...newsFormData,
        title: finalTitle,
        cover_image: coverData,
        gallery_images:
          newsFormData.type === "ข่าวสารทั่วไป" ? finalGalleryData : [],
        status_color:
          newsFormData.status === "published" ? "bg-green-500" : "bg-gray-400",
      };

      if (isEditing && editNewsId)
        await supabase.from("news").update(payload).eq("id", editNewsId);
      else
        await supabase
          .from("news")
          .insert([{ ...payload, created_at: new Date() }]);

      updateProgress("เสร็จสิ้น!");
      await new Promise((r) => setTimeout(r, 500));

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "บันทึกข้อมูลข่าวสารเรียบร้อยแล้ว",
        confirmButtonColor: "#ED1C24",
      });
      setIsNewsModalOpen(false);
      resetNewsForm();
      fetchNews();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        confirmButtonColor: "#ED1C24",
      });
    } finally {
      setIsSubmitting(false);
      setShowProgressModal(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- ปรับปรุงการเช็คข้อมูลตรงนี้ (เพิ่ม phone) ---
    if (
      !formData.book_no.trim() ||
      !formData.title.trim() ||
      !formData.date ||
      !userDept ||
      !formData.details.trim() ||
      !formData.phone.trim() // <-- บังคับเช็คเบอร์โทร
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบทุกช่อง",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    // ------------------------------------------

    setIsSubmitting(true);
    setShowProgressModal(true);
    setUploadProgress(0);
    setCurrentTask("กำลังเตรียมข้อมูล...");

    try {
      // ... (โค้ดส่วนการอัปโหลดไฟล์เหมือนเดิม ไม่ต้องแก้) ...
      // Logic for Documents: Total Files + 1 (Save DB)
      const totalFiles = selectedFiles.length;
      const totalSteps = totalFiles + 1;
      let stepCount = 0;

      const updateProgress = (pct: number, task: string) => {
        setUploadProgress(pct);
        setCurrentTask(task);
      };

      const newUploadedFiles = [];
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const startPct = (i / totalSteps) * 100;
        updateProgress(
          startPct,
          `กำลังอัปโหลดไฟล์: ${file.name} (${i + 1}/${totalFiles})`,
        );

        try {
          const result = await uploadFileSingle(file, "documents");
          newUploadedFiles.push(result);
        } catch (err: any) {
          console.error(`Failed to upload ${file.name}`, err);
          Toast.fire({ icon: "error", title: `Failed: ${file.name}` });
        }

        stepCount++;
      }

      const finalFiles = isEditing
        ? [...existingFiles, ...newUploadedFiles]
        : newUploadedFiles;

      // Save to DB
      const dbStartPct = (stepCount / totalSteps) * 100;
      updateProgress(dbStartPct, "กำลังบันทึกลงฐานข้อมูล...");

      const payload = {
        ...formData,
        dept: userDept,
        links: linkList,
        files: finalFiles,
        status_color:
          formData.status === "published" ? "bg-green-500" : "bg-gray-400",
      };

      if (isEditing && editDocId)
        await supabase.from("documents").update(payload).eq("id", editDocId);
      else await supabase.from("documents").insert([payload]);

      if (formData.phone) {
        localStorage.setItem("last_contact_phone", formData.phone);
      }

      updateProgress(100, "เสร็จสิ้น!");
      await new Promise((r) => setTimeout(r, 500));

      await Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "บันทึกข้อมูลเรียบร้อยแล้ว",
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
      setShowProgressModal(false);
    }
  };
  // --- Actions & Utils (Existing Code) ---
  const handleToggleStatus = async (
    table: "documents" | "news" | "postal_systems",
    item: any,
  ) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    if (table === "documents")
      setDocList((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: newStatus } : d)),
      );
    else if (table === "news")
      setNewsList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, status: newStatus } : n)),
      );
    else if (table === "postal_systems")
      setSystemList((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: newStatus } : s)),
      );

    const { error } = await supabase
      .from(table)
      .update({
        status: newStatus,
        status_color:
          newStatus === "published" ? "bg-green-500" : "bg-gray-400",
      })
      .eq("id", item.id);
    if (error) {
      Swal.fire("Error", "เปลี่ยนสถานะไม่สำเร็จ", "error");
      if (table === "documents") fetchDocuments();
      else if (table === "news") fetchNews();
      else fetchSystems();
    } else
      Toast.fire({
        icon: "success",
        title: `สถานะ: ${newStatus === "published" ? "เผยแพร่" : "แบบร่าง"}`,
      });
  };

  const handleDeleteItem = async (
    table: "documents" | "news" | "postal_systems",
    id: number,
  ) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) Swal.fire("Error", error.message, "error");
      else {
        await Swal.fire("Deleted!", "ลบข้อมูลเรียบร้อยแล้ว", "success");
        if (table === "documents") fetchDocuments();
        else if (table === "news") fetchNews();
        else fetchSystems();
      }
    }
  };

  const handleBulkDelete = async (table: "documents" | "news") => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: `ลบ ${selectedIds.length} รายการ?`,
      text: "ยืนยันการลบ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
      const { error } = await supabase
        .from(table)
        .delete()
        .in("id", selectedIds);
      if (error) Swal.fire("Error", error.message, "error");
      else {
        await Swal.fire("Deleted!", "ลบข้อมูลเรียบร้อยแล้ว", "success");
        if (table === "documents") fetchDocuments();
        else fetchNews();
        setSelectedIds([]);
      }
    }
  };

  const handleBulkStatusChange = async (
    table: "documents" | "news",
    newStatus: "published" | "draft",
  ) => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase
      .from(table)
      .update({
        status: newStatus,
        status_color:
          newStatus === "published" ? "bg-green-500" : "bg-gray-400",
      })
      .in("id", selectedIds);
    if (error) Swal.fire("Error", error.message, "error");
    else {
      Toast.fire({ icon: "success", title: `เปลี่ยนสถานะเรียบร้อย` });
      if (table === "documents") fetchDocuments();
      else fetchNews();
      setSelectedIds([]);
    }
  };

  const handleSelectAll = (
    e: React.ChangeEvent<HTMLInputElement>,
    list: any[],
  ) => {
    e.target.checked
      ? setSelectedIds(list.map((i) => i.id))
      : setSelectedIds([]);
  };
  const handleSelectOne = (id: number) => {
    selectedIds.includes(id)
      ? setSelectedIds(selectedIds.filter((sid) => sid !== id))
      : setSelectedIds([...selectedIds, id]);
  };

  const handleEditDoc = (doc: any) => {
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
  const handleEditNews = (item: any) => {
    setIsEditing(true);
    setEditNewsId(item.id);
    setNewsFormData({
      type: item.type,
      date: item.date,
      title: item.title,
      details: item.details || "",
      status: item.status,
    });
    setExistingCoverImage(item.cover_image);
    setExistingGalleryImages(item.gallery_images || []);
    setNewsCoverImage(null);
    setNewsGalleryImages([]);
    setIsNewsModalOpen(true);
  };
  const handleEditSystem = (item: any) => {
    setIsEditing(true);
    setEditSystemId(item.id);
    setSystemFormData({
      name: item.name,
      url: item.url,
      dept: item.dept,
      status: item.status,
    });
    setIsSystemModalOpen(true);
  };

  const handleViewDoc = (doc: any) => {
    setSelectedDoc(doc);
    setIsViewModalOpen(true);
  };
  const handleViewNews = (news: any) => {
    setSelectedNews(news);
    setIsViewNewsModalOpen(true);
  };

  const resetForm = () => {
    const savedPhone =
      typeof window !== "undefined"
        ? localStorage.getItem("last_contact_phone") || ""
        : "";
    setFormData({
      title: "",
      book_no: "",
      date: getTodayDate(),
      dept: userDept,
      type: "บันทึกข้อความ",
      details: "",
      phone: savedPhone,
      status: "published",
    });
    setLinkList([]);
    setSelectedFiles([]);
    setExistingFiles([]);
    setIsEditing(false);
    setEditDocId(null);
  };
  const resetNewsForm = () => {
    setNewsFormData({
      type: "ข่าวประชาสัมพันธ์",
      date: getTodayDate(),
      title: "",
      details: "",
      status: "published",
    });
    setNewsCoverImage(null);
    setExistingCoverImage(null);
    setNewsGalleryImages([]);
    setExistingGalleryImages([]);
    setIsEditing(false);
    setEditNewsId(null);
  };
  const resetSystemForm = () => {
    setSystemFormData({
      name: "",
      url: "",
      dept: userDept,
      status: "published",
    });
    setIsEditing(false);
    setEditSystemId(null);
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
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "ออกจากระบบ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ED1C24",
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
      await supabase.auth.signOut();
      router.replace("/");
    }
  };

  // --- Filter Logic ---
  const filteredDocs = docList.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.book_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStartDate = filterStartDate
      ? doc.date >= filterStartDate
      : true;
    const matchesEndDate = filterEndDate ? doc.date <= filterEndDate : true;
    return matchesSearch && matchesStartDate && matchesEndDate;
  });
  const filteredNews = newsList.filter((news) => {
    const matchesSearch = news.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterDept ? news.type === filterDept : true;
    const matchesStartDate = filterStartDate
      ? news.date >= filterStartDate
      : true;
    const matchesEndDate = filterEndDate ? news.date <= filterEndDate : true;
    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });
  const filteredSystems = systemList.filter((sys) =>
    sys.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isAuthChecking)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-red-200 border-t-[#ED1C24] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans selection:bg-red-100 selection:text-red-600 relative">
      {/* --- PROGRESS BAR MODAL OVERLAY --- */}
      {showProgressModal && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#ED1C24"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * uploadProgress) / 100}
                  className="transition-all duration-300 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-gray-700">
                {Math.round(uploadProgress)}%
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                กำลังดำเนินการ
              </h3>
              <p className="text-gray-500 text-sm animate-pulse">
                {currentTask}
              </p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ED1C24] to-orange-500 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* --- DEPT SELECTION --- */}
      {isDeptSelectionOpen && (
        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-gray-50 via-white to-red-50 flex flex-col items-center justify-center p-6 animate-fade-in-up">
          <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#ED1C24_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
            <div className="mb-10 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white text-[#ED1C24] rounded-full shadow-2xl shadow-red-200 mb-2 border-4 border-red-50">
                <UserIcon size={48} />
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                  Welcome to Dashboard
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">
                  สวัสดี, <span className="text-[#ED1C24]">{userEmail}</span>
                </h1>
              </div>
              <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                กรุณาเลือก{" "}
                <span className="font-bold text-gray-800">ส่วนงาน</span>{" "}
                ที่คุณต้องการดำเนินการเพื่อเข้าสู่ระบบจัดการข้อมูล
              </p>
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setUserDept(dept);
                    setIsDeptSelectionOpen(false);
                  }}
                  className="group relative flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-red-100/50 hover:border-red-100 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-[#ED1C24] flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="text-4xl font-black text-gray-300 mb-3 group-hover:text-[#ED1C24] group-hover:scale-110 transition-all duration-300">
                    {dept}
                  </span>
                  <span className="text-xs text-center text-gray-400 font-bold group-hover:text-gray-600 transition-colors line-clamp-2">
                    {departmentFullNames[dept]}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ED1C24] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="mt-12 text-sm font-bold text-gray-400 hover:text-[#ED1C24] transition-colors flex items-center gap-2"
            >
              <LogoutIcon /> ออกจากระบบ
            </button>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl border-r border-gray-100 z-50 transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-20"} hidden md:flex flex-col`}
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
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === "overview" ? "bg-red-50 text-[#ED1C24]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <div
              className={`transition-colors ${activeTab === "overview" ? "text-[#ED1C24]" : "text-gray-400 group-hover:text-gray-600"}`}
            >
              <HomeIcon />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-sm whitespace-nowrap">
                ภาพรวม (Overview)
              </span>
            )}
          </button>
          <div className="text-xs font-bold text-gray-400 uppercase px-4 py-2 mt-6 tracking-wider">
            {isSidebarOpen ? "Management" : "..."}
          </div>
          <button
            onClick={() => setActiveTab("circular")}
            className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === "circular" ? "bg-red-50 text-[#ED1C24]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <div
              className={`transition-colors ${activeTab === "circular" ? "text-[#ED1C24]" : "text-gray-400 group-hover:text-gray-600"}`}
            >
              <DocIcon />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-sm whitespace-nowrap">
                จัดการบันทึกข้อความ
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === "news" ? "bg-red-50 text-[#ED1C24]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <div
              className={`transition-colors ${activeTab === "news" ? "text-[#ED1C24]" : "text-gray-400 group-hover:text-gray-600"}`}
            >
              <NewsIcon />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-sm whitespace-nowrap">
                จัดการข่าวสาร
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("systems")}
            className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === "systems" ? "bg-red-50 text-[#ED1C24]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <div
              className={`transition-colors ${activeTab === "systems" ? "text-[#ED1C24]" : "text-gray-400 group-hover:text-gray-600"}`}
            >
              <SystemIcon />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-sm whitespace-nowrap">
                จัดการระบบงาน
              </span>
            )}
          </button>
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

      {/* --- MAIN CONTENT --- */}
      <main
        className={`transition-all duration-300 ${isSidebarOpen ? "md:ml-72" : "md:ml-20"} min-h-screen flex flex-col`}
      >
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm shadow-gray-100/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <MenuIcon />
            </button>
            <h1 className="text-xl font-black text-gray-800 capitalize tracking-tight">
              {activeTab === "circular"
                ? "จัดการบันทึกข้อความ"
                : activeTab === "news"
                  ? "จัดการข่าวสาร"
                  : activeTab === "systems"
                    ? "จัดการระบบงานไปรษณีย์"
                    : "ภาพรวม (Overview)"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {userDept && (
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-red-50 text-[#ED1C24] rounded-full border border-red-100">
                <span className="w-2 h-2 bg-[#ED1C24] rounded-full animate-pulse"></span>
                <span className="text-xs font-bold">
                  กำลังจัดการในนาม: {userDept}
                </span>
              </div>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{userEmail}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {userDept || "No Dept Selected"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border-2 border-white shadow-md"></div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {activeTab === "overview" && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-300 animate-fade-in-up">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                <SettingIcon size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-400">
                อยู่ระหว่างการพัฒนา
              </h3>
              <p className="text-sm">ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้</p>
            </div>
          )}

          {activeTab === "systems" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-700 hidden md:block">
                    ระบบงานของ: {userDept}
                  </h2>
                  <button
                    onClick={() => {
                      resetSystemForm();
                      setIsSystemModalOpen(true);
                    }}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#ED1C24] to-red-600 text-white rounded-xl shadow-lg shadow-red-200 text-sm font-bold hover:shadow-red-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusIcon /> เพิ่มระบบงาน
                  </button>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative group w-full md:w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อระบบงาน..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-100 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              {isLoadingData ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-red-100 border-t-[#ED1C24] rounded-full animate-spin"></div>
                  <span className="text-gray-400 font-medium">
                    กำลังโหลดข้อมูล...
                  </span>
                </div>
              ) : filteredSystems.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <SystemIcon />
                  </div>
                  <p>ไม่พบรายการระบบงานของ {userDept}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSystems.map((sys) => (
                    <div
                      key={sys.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow relative group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border ${sys.status === "published" ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                        >
                          {sys.status === "published" ? "เผยแพร่" : "ซ่อน"}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditSystem(sys)}
                            className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteItem("postal_systems", sys.id)
                            }
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus("postal_systems", sys)
                            }
                            className={`p-1.5 rounded-lg transition-colors ${sys.status === "published" ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                          >
                            {sys.status === "published" ? (
                              <ToggleOnIcon />
                            ) : (
                              <ToggleOffIcon />
                            )}
                          </button>
                        </div>
                      </div>
                      <h3
                        className="font-bold text-gray-800 text-lg mb-1 truncate"
                        title={sys.name}
                      >
                        {sys.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">
                        {departmentFullNames[sys.dept] || sys.dept}
                      </p>
                      <a
                        href={sys.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-[#ED1C24] font-medium hover:underline bg-red-50 p-2 rounded-lg w-fit"
                      >
                        <LinkIcon /> ไปที่ระบบ
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "circular" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-700 hidden md:block">
                    เอกสารของส่วนงาน: {userDept}
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
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาเลขที่, หัวข้อ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-100 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                    />
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
                        onClick={() =>
                          handleBulkStatusChange("documents", "published")
                        }
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                      >
                        เผยแพร่
                      </button>
                      <button
                        onClick={() =>
                          handleBulkStatusChange("documents", "draft")
                        }
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg text-xs font-bold hover:bg-gray-500 transition-colors"
                      >
                        ซ่อน
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        onClick={() => handleBulkDelete("documents")}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <TrashIcon /> ลบที่เลือก
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    <p>ไม่พบข้อมูลเอกสารในส่วนงานของคุณ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500">
                        <tr>
                          <th className="p-5 w-10 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-red-600 rounded border-gray-300"
                              onChange={(e) => handleSelectAll(e, filteredDocs)}
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
                            className={`group transition-colors ${selectedIds.includes(doc.id) ? "bg-red-50/40" : "hover:bg-red-50/30"}`}
                          >
                            <td className="p-5 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-red-600 rounded border-gray-300 cursor-pointer"
                                checked={selectedIds.includes(doc.id)}
                                onChange={() => handleSelectOne(doc.id)}
                              />
                            </td>
                            <td className="p-5 pl-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${doc.status === "published" ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${doc.status === "published" ? "bg-green-500" : "bg-gray-400"}`}
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
                                className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getTypeBadgeColor(doc.type)}`}
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
                                onClick={() =>
                                  handleToggleStatus("documents", doc)
                                }
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${doc.status === "published" ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                              >
                                {doc.status === "published" ? (
                                  <ToggleOnIcon />
                                ) : (
                                  <ToggleOffIcon />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditDoc(doc)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                onClick={() => handleViewDoc(doc)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteItem("documents", doc.id)
                                }
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
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
          )}

          {activeTab === "news" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-700 hidden md:block">
                    รายการข่าวสารทั้งหมด
                  </h2>
                  <button
                    onClick={() => {
                      resetNewsForm();
                      setIsNewsModalOpen(true);
                    }}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#ED1C24] to-red-600 text-white rounded-xl shadow-lg shadow-red-200 text-sm font-bold hover:shadow-red-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusIcon /> เพิ่มข่าวสาร
                  </button>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative group w-full md:w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#ED1C24] transition-colors">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาหัวข้อข่าว..."
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
                      <option value="">ทุกประเภท</option>
                      <option value="ข่าวประชาสัมพันธ์">
                        ข่าวประชาสัมพันธ์
                      </option>
                      <option value="ข่าวสารทั่วไป">ข่าวสารทั่วไป</option>
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
                        onClick={() =>
                          handleBulkStatusChange("news", "published")
                        }
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                      >
                        เผยแพร่
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange("news", "draft")}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg text-xs font-bold hover:bg-gray-500 transition-colors"
                      >
                        ซ่อน
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        onClick={() => handleBulkDelete("news")}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <TrashIcon /> ลบที่เลือก
                      </button>
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                  {isLoadingData ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-red-100 border-t-[#ED1C24] rounded-full animate-spin"></div>
                      <span className="text-gray-400 font-medium">
                        กำลังโหลดข้อมูล...
                      </span>
                    </div>
                  ) : filteredNews.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center text-gray-400 gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <NewsIcon />
                      </div>
                      <p>ไม่พบรายการข่าวสาร</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500">
                          <tr>
                            <th className="p-5 w-10 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-red-600 rounded border-gray-300"
                                onChange={(e) =>
                                  handleSelectAll(e, filteredNews)
                                }
                                checked={
                                  filteredNews.length > 0 &&
                                  selectedIds.length === filteredNews.length
                                }
                              />
                            </th>
                            <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-24 pl-2">
                              รูปปก
                            </th>
                            <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-32">
                              สถานะ
                            </th>
                            <th className="p-5 text-xs font-extrabold uppercase tracking-wider">
                              หัวข้อข่าว
                            </th>
                            <th className="p-5 text-xs font-extrabold uppercase tracking-wider w-40">
                              ประเภท
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
                          {filteredNews.map((item) => (
                            <tr
                              key={item.id}
                              className={`group transition-colors ${selectedIds.includes(item.id) ? "bg-red-50/40" : "hover:bg-red-50/30"}`}
                            >
                              <td className="p-5 text-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-red-600 rounded border-gray-300 cursor-pointer"
                                  checked={selectedIds.includes(item.id)}
                                  onChange={() => handleSelectOne(item.id)}
                                />
                              </td>
                              <td className="p-5 pl-2">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                  {item.cover_image?.url ? (
                                    <img
                                      src={item.cover_image.url}
                                      alt="cover"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <FileIcon />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${item.status === "published" ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${item.status === "published" ? "bg-green-500" : "bg-gray-400"}`}
                                  ></span>
                                  {item.status === "published"
                                    ? "Published"
                                    : "Draft"}
                                </span>
                              </td>
                              <td className="p-5">
                                <div className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {item.details}
                                </div>
                              </td>
                              <td className="p-5">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getTypeBadgeColor(item.type)}`}
                                >
                                  {item.type === "ข่าวสารทั่วไป"
                                    ? "ข่าวทั่วไป"
                                    : "ประชาสัมพันธ์"}
                                </span>
                              </td>
                              <td className="p-5 text-sm text-gray-500 font-medium">
                                {formatThaiDate(item.date)}
                              </td>
                              <td className="p-5 pr-8 text-right flex justify-end gap-2 items-center">
                                <button
                                  onClick={() =>
                                    handleToggleStatus("news", item)
                                  }
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.status === "published" ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                                >
                                  {item.status === "published" ? (
                                    <ToggleOnIcon />
                                  ) : (
                                    <ToggleOffIcon />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleEditNews(item)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                                >
                                  <PencilIcon />
                                </button>
                                <button
                                  onClick={() => handleViewNews(item)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                >
                                  <EyeIcon />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteItem("news", item.id)
                                  }
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
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
            </div>
          )}
        </div>
      </main>

      {/* --- ADD/EDIT SYSTEM MODAL --- */}
      {isSystemModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsSystemModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 animate-fade-in-up flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl">
              <h3 className="text-xl font-black text-gray-800">
                {isEditing ? "แก้ไขระบบงาน" : "เพิ่มระบบงาน"} ({userDept})
              </h3>
              <button
                onClick={() => setIsSystemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSystemSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  ชื่อระบบงาน
                </label>
                <input
                  type="text"
                  placeholder="เช่น ระบบติดตามพัสดุภายใน"
                  value={systemFormData.name}
                  onChange={(e) =>
                    setSystemFormData({
                      ...systemFormData,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  URL (ลิงก์เข้าระบบ)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={systemFormData.url}
                  onChange={(e) =>
                    setSystemFormData({
                      ...systemFormData,
                      url: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-red-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  ส่วนงานเจ้าของระบบ
                </label>
                <input
                  type="text"
                  value={`${userDept} - ${departmentFullNames[userDept]}`}
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">สถานะ</label>
                <select
                  value={systemFormData.status}
                  onChange={(e) =>
                    setSystemFormData({
                      ...systemFormData,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                >
                  <option value="published">เผยแพร่</option>
                  <option value="draft">ซ่อน (Draft)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#ED1C24] text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* --- ADD/EDIT DOCUMENT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl relative z-10 animate-fade-in-up flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  {isEditing ? "แก้ไขบันทึกข้อความ" : "เพิ่มบันทึกข้อความ"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleAddSubmit}
              className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8"
            >
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ข้อมูลทั่วไป
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      เลขที่หนังสือ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="book_no"
                      required // <-- บังคับ
                      value={formData.book_no}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      ลงวันที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      required // <-- บังคับ
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
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
                    required // <-- บังคับ
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      ส่วนงาน
                    </label>
                    <input
                      type="text"
                      value={userDept}
                      disabled
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      ประเภท <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
                    >
                      <option value="บันทึกข้อความ">บันทึกข้อความ</option>
                      <option value="ประกาศ">ประกาศ</option>
                      <option value="คำสั่ง">คำสั่ง</option>
                      <option value="ขอความร่วมมือ">ขอความร่วมมือ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      required // <-- บังคับ
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="เช่น 02-xxx-xxxx"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    รายละเอียด <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="details"
                    required // <-- บังคับ
                    rows={3}
                    value={formData.details}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:bg-white focus:border-red-500 transition-colors"
                  ></textarea>
                </div>
              </section>
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ไฟล์แนบ
                </h4>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-all cursor-pointer relative group">
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-red-400">
                    <CloudUploadIcon />
                    <span className="text-sm font-medium">คลิกอัปโหลด</span>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 p-2 rounded-lg text-xs flex justify-between"
                      >
                        {f.name}{" "}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedFiles((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
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
                      className="w-1/3 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => {
                        const n = [...linkList];
                        n[idx].url = e.target.value;
                        setLinkList(n);
                      }}
                      className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const n = [...linkList];
                        n.splice(idx, 1);
                        setLinkList(n);
                      }}
                      className="text-red-400 p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <section className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.status === "published" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}
                  >
                    {formData.status === "published" ? (
                      <EyeIcon />
                    ) : (
                      <EyeOffIcon />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">สถานะ</p>
                    <p className="text-xs text-gray-500">
                      {formData.status === "published" ? "แสดงผล" : "ซ่อน"}
                    </p>
                  </div>
                </div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  <option value="published">เผยแพร่</option>
                  <option value="draft">ไม่เผยแพร่</option>
                </select>
              </section>
            </form>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-white transition-all"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#ED1C24] text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT NEWS MODAL --- */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsNewsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl relative z-10 animate-fade-in-up flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-xl font-black text-gray-800">
                  {isEditing ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสาร"}
                </h3>
              </div>
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 transition-colors"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleNewsSubmit}
              className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8"
            >
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ข้อมูลทั่วไป
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      ประเภท
                    </label>
                    <select
                      value={newsFormData.type}
                      onChange={(e) =>
                        setNewsFormData({
                          ...newsFormData,
                          type: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    >
                      <option value="ข่าวประชาสัมพันธ์">
                        ข่าวประชาสัมพันธ์
                      </option>
                      <option value="ข่าวสารทั่วไป">ข่าวสารทั่วไป</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      วันที่
                    </label>
                    <input
                      type="date"
                      value={newsFormData.date}
                      onChange={(e) =>
                        setNewsFormData({
                          ...newsFormData,
                          date: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    หัวข้อข่าว
                  </label>
                  <input
                    type="text"
                    value={newsFormData.title}
                    onChange={(e) =>
                      setNewsFormData({
                        ...newsFormData,
                        title: e.target.value,
                      })
                    }
                    disabled={newsFormData.type === "ข่าวประชาสัมพันธ์"}
                    className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none ${newsFormData.type === "ข่าวประชาสัมพันธ์" ? "opacity-50" : ""}`}
                    placeholder={
                      newsFormData.type === "ข่าวประชาสัมพันธ์"
                        ? "(สร้างอัตโนมัติ)"
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    รายละเอียด
                  </label>
                  <textarea
                    rows={4}
                    value={newsFormData.details}
                    onChange={(e) =>
                      setNewsFormData({
                        ...newsFormData,
                        details: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none"
                  ></textarea>
                </div>
              </section>
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  รูปภาพ
                </h4>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    รูปปก
                  </label>
                  {newsCoverImage ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                      <FileIcon />
                      <span className="truncate flex-1">
                        {newsCoverImage.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewsCoverImage(null)}
                        className="text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0])
                            setNewsCoverImage(e.target.files[0]);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <CloudUploadIcon />
                      <span className="text-sm text-gray-400">อัปโหลดรูป</span>
                    </div>
                  )}
                </div>
                {newsFormData.type === "ข่าวสารทั่วไป" && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      รูปประกอบเพิ่มเติม
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files)
                            setNewsGalleryImages((prev) => [
                              ...prev,
                              ...Array.from(e.target.files!),
                            ]);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <CloudUploadIcon />
                      <span className="text-sm text-gray-400">
                        อัปโหลดรูปประกอบ
                      </span>
                    </div>
                    {newsGalleryImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {newsGalleryImages.map((f, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 p-2 rounded flex justify-between text-xs"
                          >
                            {f.name}{" "}
                            <button
                              type="button"
                              onClick={() =>
                                setNewsGalleryImages((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                              className="text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
              <section className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${newsFormData.status === "published" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}
                  >
                    {newsFormData.status === "published" ? (
                      <EyeIcon />
                    ) : (
                      <EyeOffIcon />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">สถานะ</p>
                    <p className="text-xs text-gray-500">
                      {newsFormData.status === "published" ? "แสดงผล" : "ซ่อน"}
                    </p>
                  </div>
                </div>
                <select
                  value={newsFormData.status}
                  onChange={(e) =>
                    setNewsFormData({ ...newsFormData, status: e.target.value })
                  }
                  className="p-2 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  <option value="published">เผยแพร่</option>
                  <option value="draft">ไม่เผยแพร่</option>
                </select>
              </section>
            </form>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-white transition-all"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleNewsSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#ED1C24] text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
              >
                {isSubmitting ? "..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODALS (Same as before) --- */}
      {isViewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsViewModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 animate-scale-in overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100 flex justify-between items-start">
              <div className="space-y-3 flex-1 mr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${selectedDoc.status === "published" ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                  >
                    {selectedDoc.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs font-bold text-[#ED1C24] bg-red-50 px-2 py-0.5 rounded-md">
                    {selectedDoc.book_no}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 leading-snug">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="group w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all shadow-sm"
              >
                <span className="text-xl font-bold group-hover:scale-110 transition-transform">
                  ×
                </span>
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    ส่วนงาน
                  </p>
                  <p className="font-bold text-gray-800 text-sm">
                    {selectedDoc.dept}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    ประเภท
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTypeBadgeColor(selectedDoc.type)}`}
                  >
                    {selectedDoc.type}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    วันที่
                  </p>
                  <p className="font-bold text-gray-800 text-sm">
                    {formatThaiDate(selectedDoc.date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    โทรศัพท์
                  </p>
                  <p className="font-bold text-gray-800 text-sm">
                    {selectedDoc.phone || "-"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#ED1C24] rounded-full"></span>{" "}
                  รายละเอียด
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-gray-100">
                  {selectedDoc.details || "-"}
                </p>
              </div>
              <div className="space-y-6 pt-4 border-t border-gray-100">
                {selectedDoc.links?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1 h-4 bg-blue-500 rounded-full"></span>{" "}
                      ลิงก์แนบ
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedDoc.links.map((link: any, i: number) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <LinkIcon />
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">
                            {link.name || link.url}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDoc.files?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1 h-4 bg-orange-500 rounded-full"></span>{" "}
                      ไฟล์เอกสาร
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedDoc.files.map((file: any, i: number) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                            <FileIcon />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-gray-700 truncate group-hover:text-orange-700">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {file.size || "Unknown size"}
                            </span>
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
      {isViewNewsModalOpen && selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsViewNewsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 animate-scale-in flex flex-col max-h-[90vh] overflow-hidden">
            <div className="relative bg-gray-100">
              {selectedNews.cover_image?.url ? (
                <div className="w-full h-64 sm:h-80 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                  <img
                    src={selectedNews.cover_image.url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setIsViewNewsModalOpen(false)}
                    className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all"
                  >
                    <span className="text-xl font-bold">×</span>
                  </button>
                </div>
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="text-gray-300">
                    <NewsIcon />
                  </div>
                  <button
                    onClick={() => setIsViewNewsModalOpen(false)}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <span className="text-xl font-bold">×</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="space-y-6">
                <div className="space-y-3 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">
                      {formatThaiDate(selectedNews.date)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md border ${getTypeBadgeColor(selectedNews.type)}`}
                    >
                      {selectedNews.type === "ข่าวประชาสัมพันธ์ภายใน ปข.6"
                        ? "ข่าวสารทั่วไป"
                        : "ข่าวประชาสัมพันธ์"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md uppercase ${selectedNews.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {selectedNews.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">
                    {selectedNews.title}
                  </h3>
                </div>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {selectedNews.details || "ไม่มีรายละเอียด"}
                  </p>
                </div>
                {selectedNews.gallery_images?.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1 h-4 bg-[#ED1C24] rounded-full"></span>{" "}
                      แกลเลอรีรูปภาพ
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedNews.gallery_images.map(
                        (img: any, i: number) => (
                          <div
                            key={i}
                            className="group relative rounded-xl overflow-hidden border border-gray-100 shadow-sm aspect-[4/3] cursor-zoom-in"
                          >
                            <img
                              src={img.url}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              alt={`Gallery ${i}`}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                          </div>
                        ),
                      )}
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

// Icons
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
const UserIcon = ({ size = 20 }: { size?: number }) => (
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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"
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
const SystemIcon = () => (
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
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);
