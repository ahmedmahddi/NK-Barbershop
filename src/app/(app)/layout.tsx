export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Salon Naim Kchao | Coiffures et Soins à Sfax",
  icons: "/images/LogoNK.png",
  description:
    "Visitez le Salon Naim Kchao à Sfax pour des coiffures expertes, des tailles de barbe et des services de soin haut de gamme. Réservez votre rendez-vous aujourd'hui !",
  keywords: [
    "salon de coiffure",
    "coiffures",
    "soins",
    "taille de barbe",
    "Sfax",
    "Naim Kchao",
    "Tunisie",
    "barbershop",
    "haircuts",
    "grooming",
    "beard trim",
  ],
  openGraph: {
    title: "Salon Naim Kchao | Services de Soin à Sfax",
    description:
      "Coiffures et soins haut de gamme au Salon Naim Kchao à Sfax, Tunisie. Réservez maintenant pour un look frais !",
    url: "https://www.naimkchaobarbershop.com",
    siteName: "Naim Kchao Barbershop",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-zinc-900/90`}>
        <TRPCReactProvider>
          {children}
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
