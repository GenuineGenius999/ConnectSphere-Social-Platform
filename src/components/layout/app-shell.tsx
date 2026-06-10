import { Suspense } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { RightPanel } from "./right-panel";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="flex flex-1 gap-6 px-4 lg:px-6 py-4 max-w-[1400px] mx-auto w-full">
            <main className="flex-1 min-w-0 pb-20 lg:pb-6">{children}</main>
            <Suspense fallback={null}>
              <RightPanel />
            </Suspense>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
