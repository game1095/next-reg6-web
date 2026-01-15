/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blizptuzyhhnryvccfqd.supabase.co", // 🔴 นี่คือ Hostname ของ Supabase คุณตาม Error
        port: "",
        pathname: "/storage/v1/object/public/**", // อนุญาตเฉพาะ public bucket
      },
    ],
  },
};

module.exports = nextConfig;
