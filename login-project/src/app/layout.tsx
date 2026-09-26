import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: "NovaCart | Everyday, upgraded", template: "%s | NovaCart" },
  description: "Thoughtful finds for the way you live, work and move.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={manrope.variable}>
        <div className="announcement">A little more joy in every delivery <span>·</span> Free shipping over ₹2,500</div>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}