import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ALAYN — Administration Portal",
  description: "Internal Administration & Operations Platform for ALAYN",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#D3232A] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
