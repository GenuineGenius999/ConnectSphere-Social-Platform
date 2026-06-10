import { ReportsManagement } from "@/components/admin/reports-management";

export default function AdminReportsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Reports & Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review user reports, take action, and manage platform safety
        </p>
      </div>
      <ReportsManagement />
    </div>
  );
}
