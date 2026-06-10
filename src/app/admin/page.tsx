import { ROLE_LABELS } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { PlatformDashboard } from "@/components/admin/platform-dashboard";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Platform Control Center</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {session?.user?.name} · {session?.user?.role ? ROLE_LABELS[session.user.role] : "Admin"} · Real-time stats
        </p>
      </div>
      <PlatformDashboard />
    </div>
  );
}
