import { redirect } from "next/navigation";

export default function AdminSiteGlobalRedirect() {
  redirect("/admin/content");
}
