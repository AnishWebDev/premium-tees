import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      addresses: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <ProfileForm
      user={user}
      addresses={user.addresses}
      role={session.user.role}
    />
  );
}
