# Background Jobs Migration
## .NET IHostedService → pg_cron + Supabase Edge Functions

---

## Old System Jobs

### 1. AutoOutProcessBackgroundService
**Type**: Timer-based `IHostedService`  
**Schedule**: 10-minute initial delay, then every 24 hours  
**Action**: Calls `AutoCancelCommand` via MediatR  
**Logic**: Auto-cancels `ElectProjectProcess` records that are overdue (past deadline without engineer acceptance)

### 2. QueuedHostedService
**Type**: In-memory queue consumer `IHostedService`  
**Schedule**: Continuous (channel-based)  
**Action**: Processes background tasks enqueued by application code (SMS sends, file processing)

### 3. BalePollingService
**Type**: `BackgroundService` (long-polling loop)  
**Schedule**: Continuous  
**Action**: Polls `tapi.bale.ai` for new Bale messenger messages + button callbacks

---

## New System: pg_cron Jobs

### Job 1: auto_cancel_overdue_processes

```sql
-- Function to auto-cancel overdue project processes
CREATE OR REPLACE FUNCTION auto_cancel_overdue_processes()
RETURNS void AS $$
DECLARE
  overdue_count int;
BEGIN
  UPDATE elect_project_processes
  SET
    inspection_status = 99,  -- Cancelled enum value
    updated_at = now()
  WHERE
    accepted = false
    AND is_delete = false
    AND created_at < now() - INTERVAL '7 days'  -- configurable deadline
    AND inspection_status NOT IN (99, 3);        -- not already cancelled/completed

  GET DIAGNOSTICS overdue_count = ROW_COUNT;

  -- Log to audit
  INSERT INTO audit_logs (action, entity, new_values)
  VALUES (
    'auto_cancel',
    'elect_project_processes',
    jsonb_build_object('cancelled_count', overdue_count, 'run_at', now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: daily at 1 AM Tehran time (UTC+3:30 = -3:30 offset = 21:30 UTC previous day)
SELECT cron.schedule(
  'auto-cancel-overdue-processes',
  '30 21 * * *',
  'SELECT auto_cancel_overdue_processes();'
);
```

---

## New System: Supabase Edge Functions

### Function 1: send-sms
**Trigger**: Supabase Database Webhook on `notifications` INSERT  
**File**: `supabase/functions/send-sms/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const MSGWAY_API_KEY = Deno.env.get("MSGWAY_API_KEY")!;
const MSGWAY_URL = "https://api.msgway.com/sms/pattern";

serve(async (req) => {
  const { record } = await req.json();  // Database Webhook payload
  
  if (record.type !== "sms") return new Response("skip", { status: 200 });

  const { phone, template_id, params } = record.payload;
  
  const res = await fetch(MSGWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": MSGWAY_API_KEY,
    },
    body: JSON.stringify({
      op: "pattern",
      user: phone,
      template: template_id,
      // up to 5 params
      ...params,
    }),
  });

  return new Response(JSON.stringify({ ok: res.ok }), { status: 200 });
});
```

### Function 2: bale-webhook
**Trigger**: Bale messenger webhook POST (replace long-polling)  
**File**: `supabase/functions/bale-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BALE_API_KEY = Deno.env.get("BALE_API_KEY")!;
const BALE_BOT_ID = Deno.env.get("BALE_BOT_ID")!;

serve(async (req) => {
  const update = await req.json();  // Bale webhook payload

  // Handle text messages
  if (update.message?.text) {
    const chatId = update.message.from.id;
    const text = update.message.text;
    await handleBaleMessage(chatId, text);
  }

  // Handle inline button callbacks
  if (update.callback_query) {
    const { id, from, data } = update.callback_query;
    await handleBaleCallback(id, from.id, data);
  }

  return new Response("ok", { status: 200 });
});

async function sendBaleMessage(chatId: string, text: string) {
  await fetch(`https://tapi.bale.ai/bot${BALE_API_KEY}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function handleBaleMessage(chatId: string, text: string) {
  // Look up user by bale_id in profiles
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, client_id, first_name")
    .eq("bale_id", chatId)
    .single();

  if (!profile) {
    await sendBaleMessage(chatId, "کاربر یافت نشد.");
    return;
  }

  // Process command
  if (text.startsWith("/")) {
    await handleBaleCommand(chatId, text.slice(1), profile);
  }
}

async function handleBaleCallback(callbackId: string, chatId: string, data: string) {
  // Handle inline button actions
  await sendBaleMessage(chatId, `عملیات ${data} انجام شد.`);
}

async function handleBaleCommand(chatId: string, command: string, profile: any) {
  switch (command) {
    case "balance":
      await sendBaleMessage(chatId, `موجودی شما: ...`);
      break;
    default:
      await sendBaleMessage(chatId, "دستور نامعتبر است.");
  }
}
```

**Bale Webhook Registration** (run once):
```bash
curl -X POST "https://tapi.bale.ai/bot<API_KEY>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://supabase.kurdnezambargh.ir/functions/v1/bale-webhook"}'
```

### Function 3: generate-pdf
**Trigger**: HTTP POST from Next.js server action  
**File**: `supabase/functions/generate-pdf/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { template, data, output_path } = await req.json();

  // Render HTML template with data
  const html = renderTemplate(template, data);

  // Launch Puppeteer (use @sparticuz/chromium for Edge)
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBytes = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });
  await browser.close();

  // Upload to Supabase Storage
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: upload, error } = await supabase.storage
    .from("reports")
    .upload(output_path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;

  const { data: url } = supabase.storage
    .from("reports")
    .getPublicUrl(output_path);

  return new Response(JSON.stringify({ url: url.publicUrl }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Function 4: auto-notify-assignment
**Trigger**: Database Webhook on `elect_project_processes` INSERT  
**File**: `supabase/functions/notify-assignment/index.ts`

Sends SMS + Bale message to assigned engineer when a project is assigned to them.

```typescript
serve(async (req) => {
  const { record } = await req.json();
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get engineer details
  const { data: eng } = await supabase
    .from("engineers")
    .select("*, profiles(phone_number, bale_id)")
    .eq("id", record.engineer_id)
    .single();

  // Get project details
  const { data: project } = await supabase
    .from("elect_projects")
    .select("file_number, landlord_name")
    .eq("id", record.elect_project_id)
    .single();

  if (!eng || !project) return new Response("skip", { status: 200 });

  // Insert SMS notification record (triggers send-sms function)
  await supabase.from("notifications").insert({
    user_id: eng.user_id,
    client_id: record.client_id,
    type: "sms",
    title: "پروژه جدید",
    body: `پروژه ${project.file_number} به شما ارجاع شد`,
    payload: {
      phone: eng.profiles?.phone_number,
      template_id: "ASSIGN_PROJECT",
      params: {
        param1: eng.full_name,
        param2: project.file_number,
      },
    },
  });

  return new Response("ok", { status: 200 });
});
```

---

## Edge Function Environment Variables

Add to `supabase/functions/.env`:

```
MSGWAY_API_KEY=<from old SMSService config>
BALE_API_KEY=<from old BaleService:ApiKey>
BALE_BOT_ID=<from old BaleService:BotId>
SUPABASE_URL=https://supabase.kurdnezambargh.ir
SUPABASE_SERVICE_ROLE_KEY=<service role key>
STIMULSOFT_LICENSE=<if keeping Stimulsoft>
```

---

## pg_cron Schedule Summary

| Job Name | Schedule (cron) | Description |
|---|---|---|
| `auto-cancel-overdue-processes` | `30 21 * * *` | Daily 1 AM Tehran: cancel overdue EPPs |
| `cleanup-expired-notifications` | `0 22 * * *` | Daily: delete notifications older than 90 days |
| `refresh-eng-quota-summary` | `0 */6 * * *` | Every 6h: refresh engineer quota materialized view |

```sql
-- All pg_cron jobs
SELECT cron.schedule('auto-cancel-overdue-processes', '30 21 * * *',
  'SELECT auto_cancel_overdue_processes();');

SELECT cron.schedule('cleanup-expired-notifications', '0 22 * * *',
  'DELETE FROM notifications WHERE created_at < now() - INTERVAL ''90 days'';');

SELECT cron.schedule('refresh-eng-quota-summary', '0 */6 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY eng_quota_summary;');
```
