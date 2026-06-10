import { Suspense } from "react";
import { UserManagement } from "@/components/admin/user-management";
import { Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Users & Permissions</h1>
        <p className="text-muted-foreground mt-1">
          Manage user roles, ban accounts, and control what each user can do on the platform.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <UserManagement />
      </Suspense>
    </div>
  );
}
