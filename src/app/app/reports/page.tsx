import { redirect } from "next/navigation";
import { getUserRoles, hasRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReportsIndexPage() {
  const roles = await getUserRoles();
  if (!hasRole(roles, "Administrator", "Accountant", "Engineer")) {
    redirect("/app");
  }

  // Redirect to the appropriate sub-report based on role
  if (hasRole(roles, "Administrator")) {
    redirect("/app/reports/elect-projects");
  }
  if (hasRole(roles, "Accountant")) {
    redirect("/app/reports/eng-invoices");
  }
  redirect("/app/reports/eng-reports");
}
