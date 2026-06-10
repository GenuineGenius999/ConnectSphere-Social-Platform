"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Eye, Trash2, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

type Report = {
  id: string;
  type: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reporter: { name: string; username: string };
  reviewer: { name: string; username: string } | null;
};

export function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, [filter]);

  const updateReport = async (id: string, status: string, action?: string) => {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        adminNote: notes[id] || undefined,
        action: action ?? "none",
      }),
    });
    if (res.ok) {
      toast.success(`Report ${status.toLowerCase()}`);
      fetchReports();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to update");
    }
  };

  if (loading && reports.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["PENDING", "REVIEWING", "RESOLVED", "DISMISSED", "ALL"].map((s) => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s}
          </Button>
        ))}
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No reports in this category.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id} className="border-border/40">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">{r.type}</Badge>
                      <Badge variant={r.status === "PENDING" ? "destructive" : "secondary"}>{r.status}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reported by @{r.reporter.username} · {formatRelativeTime(new Date(r.createdAt))}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{r.reason}</p>
                {r.details && <p className="text-sm text-muted-foreground">{r.details}</p>}
                <p className="text-xs text-muted-foreground">Target ID: {r.targetId}</p>
                <Textarea
                  placeholder="Admin note..."
                  value={notes[r.id] ?? r.adminNote ?? ""}
                  onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateReport(r.id, "REVIEWING")}>
                    <Eye className="h-3 w-3 mr-1" /> Review
                  </Button>
                  <Button size="sm" onClick={() => updateReport(r.id, "RESOLVED")}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateReport(r.id, "DISMISSED")}>
                    <XCircle className="h-3 w-3 mr-1" /> Dismiss
                  </Button>
                  {r.type === "POST" && (
                    <Button size="sm" variant="destructive" onClick={() => updateReport(r.id, "RESOLVED", "delete_post")}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete Post
                    </Button>
                  )}
                  {r.type === "COMMENT" && (
                    <Button size="sm" variant="destructive" onClick={() => updateReport(r.id, "RESOLVED", "delete_comment")}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete Comment
                    </Button>
                  )}
                  {r.type === "USER" && (
                    <Button size="sm" variant="destructive" onClick={() => updateReport(r.id, "RESOLVED", "ban_user")}>
                      <Ban className="h-3 w-3 mr-1" /> Ban User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
