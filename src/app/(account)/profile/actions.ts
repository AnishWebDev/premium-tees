"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema, addressSchema } from "@/lib/validations/auth";
import type { ProfileInput, AddressInput } from "@/lib/validations/auth";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateProfile(data: ProfileInput) {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid profile data" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      image: parsed.data.image || null,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function createAddress(data: AddressInput) {
  const userId = await requireUserId();
  const parsed = addressSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid address data" };
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  revalidatePath("/profile");
  return { success: true, address };
}

export async function deleteAddress(addressId: string) {
  const userId = await requireUserId();

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    return { error: "Address not found" };
  }

  await prisma.address.delete({ where: { id: addressId } });
  revalidatePath("/profile");
  return { success: true };
}

export async function setDefaultAddress(addressId: string) {
  const userId = await requireUserId();

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    return { error: "Address not found" };
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);

  revalidatePath("/profile");
  return { success: true };
}
