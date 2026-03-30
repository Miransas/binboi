import { redirect } from "next/navigation";

export default function AuthTokenRedirectPage() {
  redirect("/dashboard/access-tokens");
}
