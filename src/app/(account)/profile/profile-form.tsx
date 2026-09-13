"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { LayoutDashboard, MapPin, Plus, Trash2 } from "lucide-react";
import {
  profileSchema,
  addressFormSchema,
  toAddressPayload,
  type ProfileInput,
  type AddressFormInput,
} from "@/lib/validations/auth";
import { ProfileIndiaAddressFields } from "@/components/shared/profile-india-address-fields";
import {
  updateProfile,
  createAddress,
  deleteAddress,
  setDefaultAddress,
} from "./actions";
import { isStaff } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Address = {
  id: string;
  type: string;
  isDefault: boolean;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string | null;
};

type ProfileFormProps = {
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  addresses: Address[];
  role?: string | null;
};

export function ProfileForm({ user, addresses, role }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [addressOpen, setAddressOpen] = useState(false);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      phone: user.phone ?? "",
    },
  });

  const addressForm = useForm<AddressFormInput>({
    resolver: zodResolver(addressFormSchema) as never,
    defaultValues: {
      type: "BOTH",
      isDefault: addresses.length === 0,
      country: "IN",
    },
  });

  const onProfileSubmit = (data: ProfileInput) => {
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated");
    });
  };

  const onAddressSubmit = (formData: AddressFormInput) => {
    startTransition(async () => {
      const result = await createAddress(toAddressPayload(formData));
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Address saved");
      addressForm.reset({
        type: "BOTH",
        isDefault: false,
        country: "IN",
        firstName: "",
        lastName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        stateOther: "",
        cityOther: "",
        zip: "",
        phone: "",
      });
      setAddressOpen(false);
    });
  };

  const handleDeleteAddress = (id: string) => {
    startTransition(async () => {
      const result = await deleteAddress(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Address removed");
    });
  };

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const result = await setDefaultAddress(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Default address updated");
    });
  };

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <section>
        <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
          Profile details
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{user.email}</p>

        {isStaff(role) && (
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
            <p className="text-sm font-medium text-[var(--foreground)]">Staff access</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Open the admin panel to manage products, orders, and site content.
            </p>
            <Button asChild className="mt-3" size="sm">
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Go to Admin
              </Link>
            </Button>
          </div>
        )}

        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="mt-6 space-y-4"
        >
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              className="mt-2"
              {...profileForm.register("name")}
            />
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-xs text-red-600">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              className="mt-2"
              {...profileForm.register("phone")}
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
            Saved addresses
          </h2>

          <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                Add address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add new address</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                className="mt-4 space-y-4"
              >
                <ProfileIndiaAddressFields
                  register={addressForm.register}
                  setValue={addressForm.setValue}
                  watch={addressForm.watch}
                  errors={addressForm.formState.errors}
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="addr-default"
                    checked={addressForm.watch("isDefault")}
                    onCheckedChange={(checked) =>
                      addressForm.setValue("isDefault", checked === true)
                    }
                  />
                  <Label htmlFor="addr-default" className="cursor-pointer">
                    Set as default
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  Save address
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-8 text-center">
            <MapPin className="mx-auto h-6 w-6 text-neutral-400" />
            <p className="mt-3 text-sm text-neutral-500">No saved addresses yet.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="rounded-2xl border border-neutral-200 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-950">
                        {address.name}
                      </p>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                      {address.line1}
                      {address.line2 && `, ${address.line2}`}
                      <br />
                      {address.city}, {address.state} {address.zip}
                      <br />
                      India
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!address.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={isPending}
                      >
                        Make default
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Delete address"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-neutral-400" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
