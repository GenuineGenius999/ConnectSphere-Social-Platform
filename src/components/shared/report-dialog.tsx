"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const REASONS = [
  "Spam or misleading",
  "Harassment or hate speech",
  "Violence or dangerous content",
  "Nudity or sexual content",
  "Intellectual property violation",
  "Other",
];

type ReportDialogProps = {
  type: "POST" | "COMMENT" | "USER" | "MESSAGE";
  targetId: string;
  label?: string;
  onDone?: () => void;
};

export function ReportDialog({ type, targetId, label = "Report", onDone }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, targetId, reason, details: details.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
      setDetails("");
      onDone?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setOpen(true)}>
        <Flag className="h-3.5 w-3.5 mr-1" />
        {label}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
      <div className="bg-card rounded-2xl border border-border/60 p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg">Report content</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason</label>
          <select
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <Textarea
          placeholder="Additional details (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}
