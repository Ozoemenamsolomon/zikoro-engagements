import { Suspense } from "react";

import { InlineIcon } from "@iconify/react/dist/iconify.js";
import RootLayout from "./_components/RootLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center  justify-center">
          <InlineIcon
            fontSize={40}
            icon="tabler:loader-2"
            color="#001fcc"
            className="animate-spin"
          />
        </div>
      }
    >
      <main className=" w-full h-full">
        <RootLayout>{children}</RootLayout>
      </main>
    </Suspense>
  );
}
