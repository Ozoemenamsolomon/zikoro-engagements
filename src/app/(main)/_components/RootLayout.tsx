import { SideBarLayout } from "@/components/SideNav";

export default function RootLayout({children}:{children: React.ReactNode}) {
    return (
        <div className="bg-basePrimary-100 w-full h-full " >
        <SideBarLayout>{children}</SideBarLayout>
      </div>
    )
}