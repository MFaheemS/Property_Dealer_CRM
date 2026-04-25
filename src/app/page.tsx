import { redirect } from "next/navigation";

// Root redirects to dashboard; middleware handles unauthenticated users
export default function RootPage() {
  redirect("/dashboard");
}
