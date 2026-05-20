"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteStatAction } from "./actions";

export default function StatsActions({ id, label }: { id: string; label: string }) {
  const router = useRouter();

  async function handleDelete() {
    await deleteStatAction(id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/stats/${id}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] text-xs transition-colors"
        title={`ویرایش ${label}`}
      >
        <Pencil className="w-3.5 h-3.5" />
        ویرایش
      </Link>
      <DeleteButton onDelete={handleDelete} label="حذف" />
    </div>
  );
}
