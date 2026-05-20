/**
 * One-time seed script: insert all mock data into production Supabase.
 * Run with:  npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import { announcements } from "../src/data/announcements";
import { meetings } from "../src/data/meetings";
import { documents } from "../src/data/documents";

const SUPABASE_URL = "https://supabase.kurdnezambargh.ir";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJleHAiOjE5ODM4MTI5OTYsImlhdCI6MTc3OTI2NDQxN30.poS9DAupA2IGVhovftsGX3EAnSAZDY5D7mS_WWoBdyM";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function seed() {
  console.log("Seeding announcements…");
  const { error: annErr } = await supabase.from("announcements").insert(
    announcements.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category,
      priority: a.priority,
      jalali_date: a.jalaliDate,
      published_at: a.publishedAt,
      featured: a.featured,
    }))
  );
  if (annErr) console.error("  ✗ announcements:", annErr.message);
  else console.log(`  ✓ ${announcements.length} announcements inserted`);

  console.log("Seeding meetings…");
  const { error: meetErr } = await supabase.from("meetings").insert(
    meetings.map((m) => ({
      session_number: m.sessionNumber,
      subject: m.subject,
      jalali_date: m.jalaliDate,
      status: m.status,
      type: m.type,
      pdf_url: m.pdfUrl ?? null,
      resolutions: m.resolutions,
      attendees: m.attendees ?? null,
      notes: m.notes ?? null,
    }))
  );
  if (meetErr) console.error("  ✗ meetings:", meetErr.message);
  else console.log(`  ✓ ${meetings.length} meetings inserted`);

  console.log("Seeding documents…");
  const { error: docErr } = await supabase.from("documents").insert(
    documents.map((d) => ({
      title: d.title,
      category: d.category,
      jalali_date: d.jalaliDate,
      version: d.version,
      description: d.description,
      file_size: d.fileSize,
      download_count: d.downloadCount,
      tags: d.tags,
      file_url: d.fileUrl ?? null,
      featured: d.featured ?? false,
    }))
  );
  if (docErr) console.error("  ✗ documents:", docErr.message);
  else console.log(`  ✓ ${documents.length} documents inserted`);

  console.log("\nDone.");
}

seed().catch(console.error);
