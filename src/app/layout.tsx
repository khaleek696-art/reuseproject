import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RoleProvider } from "@/lib/roleContext";
import { AIChatDrawer } from "@/components/AIChatDrawer";

export const metadata: Metadata = {
  title: "RE:USE — Production Hyperlocal Circular Marketplace",
  description:
    "It’s not a shortage, it’s a matching failure. AI-assisted circular equipment sharing for cameras, tools, projectors, and gear.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#334155] selection:bg-emerald-600 selection:text-white pb-16 lg:pb-0">
        <RoleProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AIChatDrawer />
        </RoleProvider>
      </body>
    </html>
  );
}
