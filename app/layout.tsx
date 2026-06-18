import "./globals.css";
import { Roboto, Geist } from "next/font/google";
import { Work_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" });

export const metadata = {
  title: {
    default: "Sima Malla| Portfolio",
    template: "%s | Sima Malla | Portfolio",
  },
  description: "This is my portfolio website",
  keywords: ["portfolio", "website", "nextjs", "react"],
  icons: {
    icon: "/globe.svg",
  },
};

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("font-sans", geist.variable)}>
      <body className={`${workSans.variable} ${roboto.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
