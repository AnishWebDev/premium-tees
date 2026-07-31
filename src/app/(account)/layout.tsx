import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AccountNav } from "./account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container-tight section-padding">
          <div className="mb-10">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
              My account
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Signed in as {session.user.email}
            </p>
          </div>

          <AccountNav />

          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
