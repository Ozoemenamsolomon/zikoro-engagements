import type { Metadata } from "next";
import { montserrat } from "../utils/fonts";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Zikoro - Engagements",
  description:
    "Engage your Audience with interactive Polls, Quizzes & Q&A. Perfect for meetings, classrooms and events to engage and connect with your audience",
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
