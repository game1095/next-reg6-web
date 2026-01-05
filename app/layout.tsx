import type { Metadata } from "next";
import { Kanit } from "next/font/google"; // 1. import font
import "./globals.css";

// 2. กำหนดค่า font
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "600"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "สำนักงานไปรษณีย์เขต 6",
  description: "ศูนย์กลางการบริหารงานไปรษณีย์ ครอบคลุม รวดเร็ว แม่นยำ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      {/* 3. เรียกใช้ตัวแปร font ใน body */}
      <body className={kanit.className}>{children}</body>
    </html>
  );
}
