"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations/checkout";
import type { ContactData } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContactFormProps = {
  content: ContactData;
};

export function ContactForm({ content }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    void data;
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Message sent — we'll get back to you within 1–2 business days.");
    reset();
  };

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
          {content.subtitle}
        </p>

        <ul className="mt-10 space-y-6">
          {content.email.trim() && (
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--muted)]">
                <Mail className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Email</p>
                <a
                  href={`mailto:${content.email.trim()}`}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {content.email.trim()}
                </a>
              </div>
            </li>
          )}
          {(content.phone.trim() || content.phoneHours.trim()) && (
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--muted)]">
                <Phone className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Phone</p>
                {content.phone.trim() ? (
                  <a
                    href={`tel:${content.phone.replace(/\s+/g, "")}`}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {content.phone.trim()}
                  </a>
                ) : null}
                {content.phoneHours.trim() ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {content.phoneHours.trim()}
                  </p>
                ) : null}
              </div>
            </li>
          )}
          {(content.studioLine1.trim() || content.studioLine2.trim()) && (
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--muted)]">
                <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {content.studioLabel || "Studio"}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {content.studioLine1}
                  {content.studioLine1 && content.studioLine2 ? <br /> : null}
                  {content.studioLine2}
                </p>
              </div>
            </li>
          )}
        </ul>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-[var(--border)] p-6 sm:p-8"
      >
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          {content.formTitle}
        </h2>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" className="mt-2" {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-2" {...register("email")} />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" className="mt-2" {...register("subject")} />
            {errors.subject && (
              <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
              className="mt-2"
              {...register("message")}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </div>
  );
}
