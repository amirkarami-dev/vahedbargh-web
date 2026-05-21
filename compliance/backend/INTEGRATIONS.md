# External Integrations
## Migration guide for every third-party service

---

## 1. IranKish / Shaparak Payment Gateway

**Old**: `PaymentMelliService` in Infrastructure (.NET)  
**New**: Next.js API Route `/api/payment/`

### Flow
```
User clicks "Pay" → POST /api/payment/initiate → IranKish tokenize → redirect to bank
Bank returns → POST /api/payment/return (callback) → verify → update transaction
```

### Port: RSA Tokenization

```typescript
// src/lib/payment/irankish.ts
import crypto from "crypto";

interface TokenRequest {
  terminalId: string;
  acceptorId: string;
  amount: number;
  invoiceId: string;
  invoiceDate: string;
  revertURL: string;
  rsaPublicKey: string;  // PEM format
}

export function createIranKishRequest(req: TokenRequest): string {
  // IranKish requires: {amount}|{invoiceId}|{invoiceDate}|{terminalId}
  const plainText = `${req.amount}|${req.invoiceId}|${req.invoiceDate}|${req.terminalId}`;

  const keyBuffer = Buffer.from(req.rsaPublicKey, "base64");
  const publicKey = crypto.createPublicKey({
    key: keyBuffer,
    format: "der",
    type: "spki",
  });

  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(plainText, "utf8")
  );
  return encrypted.toString("base64");
}

export async function initiatePayment(amount: number, invoiceId: string) {
  const request = createIranKishRequest({
    terminalId: process.env.BMI_TERMINAL_ID!,
    acceptorId: process.env.BMI_ACCEPTOR_ID!,
    amount,
    invoiceId,
    invoiceDate: new Date().toISOString(),
    revertURL: process.env.BMI_CALLBACK_URL!,
    rsaPublicKey: process.env.BMI_RSA_PUBLIC_KEY!,
  });

  const res = await fetch(process.env.BMI_PAYMENT_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TerminalId: process.env.BMI_TERMINAL_ID,
      AcceptorId: process.env.BMI_ACCEPTOR_ID,
      Amount: amount,
      InvoiceId: invoiceId,
      InvoiceDate: new Date().toISOString(),
      RevertURL: process.env.BMI_CALLBACK_URL,
      Request: request,
    }),
  });
  return res.json();  // { Token, Status }
}

export async function verifyPayment(token: string, referenceId: string) {
  const res = await fetch(process.env.BMI_VERIFY_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TerminalId: process.env.BMI_TERMINAL_ID,
      AcceptorId: process.env.BMI_ACCEPTOR_ID,
      Token: token,
      ReferenceId: referenceId,
    }),
  });
  return res.json();
}
```

**Env vars needed**:
```
BMI_TERMINAL_ID=
BMI_ACCEPTOR_ID=
BMI_PASS_PHRASE=
BMI_RSA_PUBLIC_KEY=
BMI_CALLBACK_URL=https://demo.kurdnezambargh.ir/api/payment/return
BMI_CALLBACK_PUBLIC_URL=https://demo.kurdnezambargh.ir/api/payment/public-return
BMI_PAYMENT_URL=
BMI_VERIFY_URL=
```

---

## 2. msgway.com SMS

**Old**: `SmsService.cs` in Infrastructure  
**New**: Supabase Edge Function `send-sms` (see BACKGROUND_JOBS.md) + Next.js API Route wrapper

### Usage from Server Actions

```typescript
// src/lib/sms.ts
export async function sendSms(phone: string, templateId: string, params: Record<string, string>) {
  const res = await fetch("https://api.msgway.com/sms/pattern", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.MSGWAY_API_KEY!,
    },
    body: JSON.stringify({
      op: "pattern",
      user: phone,
      template: templateId,
      ...params,  // param1..param5
    }),
  });
  return res.json();
}

// OTP send
export async function sendOtp(phone: string) {
  return sendSms(phone, process.env.MSGWAY_OTP_TEMPLATE!, {});
}

// Template messages (project assignment, payment confirmation, etc.)
export async function sendProjectAssignedSms(phone: string, engineerName: string, fileNumber: string) {
  return sendSms(phone, process.env.MSGWAY_ASSIGN_TEMPLATE!, {
    param1: engineerName,
    param2: fileNumber,
  });
}
```

**SMS Templates to configure in msgway dashboard**:
| Template Key | Purpose | Params |
|---|---|---|
| `OTP` | Login OTP code | `{code}` |
| `ASSIGN_PROJECT` | New project assigned to engineer | `{name}`, `{fileNumber}` |
| `PAYMENT_SUCCESS` | Payment confirmed | `{amount}`, `{fileNumber}` |
| `PROJECT_APPROVED` | Project approved | `{fileNumber}` |
| `AMOUNT_NOTICE` | Fee amount notification | `{name}`, `{amount}` |

---

## 3. Bale Messenger Bot

**Old**: `BalePollingService.cs` + `BaleService.cs` (long-polling)  
**New**: Supabase Edge Function `bale-webhook` (webhook mode)

See BACKGROUND_JOBS.md for full Edge Function code.

**Config**:
```
BALE_API_KEY=
BALE_BOT_ID=
BALE_BOT_TOKEN=
```

---

## 4. Supabase Storage (replaces Liara S3)

**Old**: `S3Service.cs` using `AWSSDK.S3` against `storage.iran.liara.site`  
**New**: `@supabase/supabase-js` Storage API

### Buckets

| Bucket Name | Access | Old Path | Contents |
|---|---|---|---|
| `project-files` | Private | `Upload/ElectProjects/` | Project document uploads |
| `user-files` | Private | `Upload/UserFiles/` | Personal user documents |
| `support-files` | Private | `Upload/Supports/` | Ticket attachments |
| `signatures` | Private | `Upload/Signatures/` | Engineer/executor signature images |
| `reports` | Private | generated | Generated PDF reports |
| `templates` | Private | server local | HTML/CSS report templates |
| `avatars` | Public | `Upload/Avatars/` | User profile pictures |

### Upload Example

```typescript
// src/lib/storage.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [] } }
  );

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: contentType ?? (file instanceof File ? file.type : "application/octet-stream"),
      upsert: false,
    });

  if (error) throw error;
  return data.path;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [] } }
  );

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}
```

### File Migration Script (Liara → Supabase)

```typescript
// scripts/migrate-files.ts
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const liara = new S3Client({
  region: "iran",
  endpoint: process.env.LIARA_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY!,
    secretAccessKey: process.env.LIARA_SECRET_KEY!,
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_MAP: Record<string, string> = {
  "Upload/ElectProjects/": "project-files",
  "Upload/UserFiles/": "user-files",
  "Upload/Supports/": "support-files",
  "Upload/Signatures/": "signatures",
  "Upload/Avatars/": "avatars",
};

async function migrateAll() {
  const { Contents } = await liara.send(new ListObjectsV2Command({
    Bucket: process.env.LIARA_BUCKET!,
  }));

  for (const obj of Contents ?? []) {
    const key = obj.Key!;
    const targetBucket = Object.entries(BUCKET_MAP)
      .find(([prefix]) => key.startsWith(prefix))?.[1] ?? "project-files";

    const { Body } = await liara.send(new GetObjectCommand({
      Bucket: process.env.LIARA_BUCKET!,
      Key: key,
    }));

    const bytes = await Body!.transformToByteArray();
    const targetPath = key.replace(/^Upload\/\w+\//, "");

    const { error } = await supabase.storage
      .from(targetBucket)
      .upload(targetPath, bytes, { upsert: true });

    if (error) console.error(`Failed: ${key}`, error);
    else console.log(`Migrated: ${key} → ${targetBucket}/${targetPath}`);
  }
}

migrateAll().catch(console.error);
```

---

## 5. Metabase Embedded Dashboards

**Old**: `MetaBaseController.GetDashboardToken` (.NET)  
**New**: Next.js API Route

```typescript
// app/api/metabase/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

export async function GET(req: NextRequest) {
  const dashboardId = req.nextUrl.searchParams.get("dashboardId");
  if (!dashboardId) return NextResponse.json({ error: "Missing dashboardId" }, { status: 400 });

  const secret = new TextEncoder().encode(process.env.METABASE_SECRET_KEY!);
  const token = await new jose.SignJWT({
    resource: { dashboard: parseInt(dashboardId) },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 min
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);

  const iframeUrl = `${process.env.METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  return NextResponse.json({ iframeUrl });
}
```

---

## 6. nezam.nigc-kd.ir (ElectCo Integration)

**Old**: `ElectCoService.cs` — posts project docs to Kurdistan Gas Distribution Company  
**New**: Next.js Server Action proxy

```typescript
// src/lib/electco.ts
const ELECTCO_URL = "https://nezam.nigc-kd.ir";
const ELECTCO_TOKEN = process.env.ELECTCO_AUTH_TOKEN!;

export async function submitProjectToElectCo(projectId: string, files: string[]) {
  // Mirror the old WCF/REST call structure
  const res = await fetch(`${ELECTCO_URL}/api/submit`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ELECTCO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, files }),
  });
  if (!res.ok) throw new Error(`ElectCo error: ${res.status}`);
  return res.json();
}
```

---

## 7. SMTP Email

**Old**: `EmailSender.cs` via asampro.ir SMTP  
**New**: Resend (recommended) or nodemailer in Edge Function

```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { to, subject, html } = await req.json();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@kurdnezambargh.ir",
      to,
      subject,
      html,
    }),
  });
  return new Response(JSON.stringify({ ok: res.ok }), { status: 200 });
});
```

---

## 8. Sentry

**Old**: `Sentry.AspNetCore` in .NET API  
**New**: `@sentry/nextjs`

```bash
npx @sentry/wizard@latest -i nextjs
```

Add `SENTRY_DSN` to `.env.local` and `.env.production`.

---

## Environment Variables Summary

All new variables to add to `.env.local`:

```bash
# Payment
BMI_TERMINAL_ID=
BMI_ACCEPTOR_ID=
BMI_PASS_PHRASE=
BMI_RSA_PUBLIC_KEY=
BMI_CALLBACK_URL=https://demo.kurdnezambargh.ir/api/payment/return
BMI_CALLBACK_PUBLIC_URL=https://demo.kurdnezambargh.ir/api/payment/public-return
BMI_PAYMENT_URL=
BMI_VERIFY_URL=

# SMS
MSGWAY_API_KEY=
MSGWAY_OTP_TEMPLATE=
MSGWAY_ASSIGN_TEMPLATE=
MSGWAY_PAYMENT_TEMPLATE=

# Bale
BALE_API_KEY=
BALE_BOT_ID=
BALE_BOT_TOKEN=

# Metabase
METABASE_SITE_URL=
METABASE_SECRET_KEY=

# ElectCo
ELECTCO_AUTH_TOKEN=

# Email
RESEND_API_KEY=

# Liara S3 (for migration script only)
LIARA_S3_ENDPOINT=
LIARA_BUCKET=
LIARA_ACCESS_KEY=
LIARA_SECRET_KEY=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```
