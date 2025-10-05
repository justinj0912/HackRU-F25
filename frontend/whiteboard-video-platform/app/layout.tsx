import type React from "react"
import type { Metadata } from "next"
import { Cinzel, Courier_Prime } from "next/font/google"
import "./globals.css"

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
})

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier",
  display: "swap",
})

export const metadata: Metadata = {
  title: "EduCapture - Whiteboard to Video",
  description: "Transform whiteboard lessons into professional educational videos",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${cinzel.variable} ${courierPrime.variable}`}>
      <body>{children}</body>
    </html>
  )
}
