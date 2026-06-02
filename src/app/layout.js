import { Geist, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/next/react";
import "./globals.css";

const APP_NAME = "Plant Care V1";
const APP_SHORT_NAME = "Plant Care V1";
const APP_DESCRIPTION = "AI powered Plant Care Assistant";
const APP_THEME_COLOR = "#4ADE80";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  theme_color: APP_THEME_COLOR,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  opensGraph: {
    type: "website",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SerwistProvider swUrl="/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  );
}
