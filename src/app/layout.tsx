import type { Metadata } from "next";
import { montserrat } from "../utils/fonts";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Zikoro - Engagements",
  description:
    "Engage your Audience with interactive Polls, Quizzes & Q&A. Perfect for meetings, classrooms and events to engage and connect with your audience",

  openGraph: {
    type: "website",
    url: "https://engagements.zikoro.com/logo.png",
    title: "Zikoro - Engagements",
    description:
      "Engage your Audience with interactive Polls, Quizzes & Q&A. Perfect for meetings, classrooms and events to engage and connect with your audience",
    images: [
      {
        url: "https://engagements.zikoro.com/logo.png",
        width: 115,
        height: 40,
        alt: "",
      },
    ],
  },

  // Additional SEO fields (optional)
  keywords:
    "Interactive app, audience engagement, live quizzes, polls, Q&A, events, meetings, classrooms, real-time collaboration, engagement app, education tools, interactive learning, interactive tools, live polls, audience interaction, event solution",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className}  antialiased`}>
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
