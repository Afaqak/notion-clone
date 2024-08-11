import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";

import Providers from "@/providers/query-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { Toaster } from "@/components/ui/sonner";

const WorkSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400",'500', "600", "700",'800','900'],
});

export const metadata: Metadata = {
  title: "notion clone",
  description: "A minimalist notion clone",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html  lang="en" suppressHydrationWarning>
      <Providers>
        <body className={`${WorkSans.className}`}>
          {/* <Sidebar user={user} /> */}
          <ModalProvider />
          <div>{children}</div>
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
