import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "cn";
import { getLocale } from "next-intl/server";
import { Providers } from "@/shared/providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "د. إسلام عبدالله كريمة | عيادة الأنف والأذن والحنجرة",
  description: "أخصائي الأنف والأذن والحنجرة وجراحاتها بأحدث طرق التشخيص والعلاج والمناظير الجراحية الدقيقة.",
};

export const instant = false;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={cn("h-full", "antialiased", "scroll-smooth", cairo.variable, "font-sans", geistSans.variable, geistMono.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
