# Accounting Module Spec

---

## Pages

| Route | Role | Description |
|---|---|---|
| `/admin/accounting` | Admin, Accountant | Tabs: Transactions, Invoices, Eng Work |
| `/admin/accounting/eng-payment` | Accountant | Manage engineer payment batches |
| `/admin/accounting/eng-payment/[taskId]` | Accountant | Individual payment batch detail |
| `/admin/quotas` | Admin, Accountant | Engineer quota burn management |

---

## Transactions Tab

- List all client transactions with filter (date range, type, user, project)
- Manual payment entry: `PaymentCustom` — accountant adds manual payment record
- Online payment: `PaymentMelli` → redirect to IranKish → return via callback

## Invoices Tab

- List invoices per project, per engineer
- Invoice shows: project file number, engineer, amount, amount_supervision, status, date
- Download invoice as PDF (uses generate-pdf Edge Function)

## Engineer Work Tab (`GetClientEngWork`)

- Lists engineer work records with fee calculation
- Filter by engineer, quarter, date range
- Shows: EPP count, base fee, deductions, net payment

---

## Engineer Payment Flow

```
1. Accountant creates EngPaymentTask (batch)
2. System generates EngPaymentList records per engineer
   - Calculates deductions: 5%, 1%, 7%, 10%
3. Accountant reviews each EngPaymentList
4. Accountant approves batch → triggers payment processing
5. Individual EngPaymentList records marked as approved
6. SMS/notification sent to each engineer
```

---

## Payment Gateway Route

```typescript
// app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initiatePayment } from "@/lib/payment/irankish";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const { amount, projectId, userId } = await req.json();

  // Create pending transaction in DB first
  const supabase = /* ... */;
  const { data: tx } = await supabase.from("transactions").insert({
    amount,
    elect_project_id: projectId,
    user_id: userId,
    gateway_type: 1,  // IranKish
    status: 0,  // Pending
    solar_created: toSolarDate(new Date()),
  }).select().single();

  // Call IranKish
  const { Token } = await initiatePayment(amount, tx.id);

  // Save bank transaction
  await supabase.from("bank_transactions").insert({
    token: Token,
    amount,
    gateway_type: 1,
  });

  return NextResponse.json({
    redirectUrl: `https://ikc.shaparak.ir/api/v3/redirect/payment/${Token}`,
  });
}

// app/api/payment/return/route.ts
export async function POST(req: NextRequest) {
  const body = await req.formData();
  const token = body.get("token") as string;
  const referenceId = body.get("referenceId") as string;

  const { ResultCode, RetrievalReferenceNumber } = await verifyPayment(token, referenceId);

  const supabase = /* service role client */;
  if (ResultCode === "00") {
    // Success
    await supabase.from("bank_transactions")
      .update({ confirmed: true, retrieval_reference_number: RetrievalReferenceNumber })
      .eq("token", token);
    await supabase.from("transactions")
      .update({ status: 2 })  // Confirmed
      .eq("bank_transaction_id", /* find by token */);
  }

  return NextResponse.redirect(new URL(`/payment/result?success=${ResultCode === "00"}`, req.url));
}
```

---

## Key Financial Constants

```typescript
// src/lib/finance.ts
export const DEDUCTION_RATES = {
  insurance: 0.05,      // 5% بیمه
  sandogh: 0.01,        // 1% صندوق
  vahedBargh: 0.07,     // 7% واحد برق
  afzodeh: 0.10,        // 10% ارزش افزوده
} as const;
```
