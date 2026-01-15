import type { Metadata } from "next";
import { Kanit } from "next/font/google"; // หรือ font ที่คุณใช้
import "./globals.css";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "สำนักงานไปรษณีย์เขต 6",
  description: "Developed by Megamind :P",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      {/* ✅ เติม suppressHydrationWarning={true} ลงใน body */}
      <body className={kanit.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
