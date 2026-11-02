import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#0A164E",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  const title = isArabic
    ? "د. إسلام عبدالله كريمة | عيادة الأنف والأذن والحنجرة وجراحاتها"
    : "Dr. Eslam Abdallah Kareema | ENT Specialist Clinic";

  const description = isArabic
    ? "عيادة د. إسلام عبدالله كريمة - أخصائي الأنف والأذن والحنجرة وجراحاتها بأحدث طرق التشخيص والعلاج والمناظير الجراحية الدقيقة. احجز موعدك الآن عبر واتساب."
    : "Clinic of Dr. Eslam Abdallah Kareema - Specialist in Ear, Nose, Throat, and Precision Endoscopic Surgeries. Book your consultation directly via WhatsApp.";

  return {
    title,
    description,
    keywords: isArabic
      ? [
          "د. إسلام عبدالله كريمة",
          "دكتور أنف وأذن وحنجرة",
          "مناظير الأنف والجيوب الأنفية",
          "جراحات الأذن الميكروسكوبية",
          "استئصال اللوزتين واللحمية",
          "تجميل الأنف الوظيفي",
          "عيادة أنف وأذن",
          "حجز كشف أنف وأذن",
        ]
      : [
          "Dr. Eslam Abdallah Kareema",
          "ENT Clinic",
          "Otolaryngology",
          "Sinus Endoscopy",
          "Ear Surgery",
          "Tonsillectomy",
          "Functional Rhinoplasty",
          "ENT Doctor",
        ],
    authors: [{ name: "د. إسلام عبدالله كريمة" }],
    creator: "د. إسلام عبدالله كريمة",
    publisher: "د. إسلام عبدالله كريمة",
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    openGraph: {
      type: "website",
      locale: isArabic ? "ar_EG" : "en_US",
      url: "/",
      title,
      description,
      siteName: isArabic ? "د. إسلام عبدالله كريمة" : "Dr. Eslam Abdallah Kareema",
      images: [
        {
          url: "/profile-doctor.png",
          width: 1008,
          height: 1420,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/profile-doctor.png"],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

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
      <body className="min-h-full flex flex-col" dir={locale === "ar" ? "rtl" : "ltr"}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
