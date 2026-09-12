import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  emailBrandName,
  escapeHtml,
  isEmailConfigured,
  sendEmail,
} from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";
import { forgotPasswordSchema } from "@/lib/validations/auth";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.password) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + TOKEN_TTL_MS);

      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      });

      if (isEmailConfigured()) {
        const brand = await emailBrandName();
        const resetUrl = absoluteUrl(
          `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        );

        await sendEmail({
          to: email,
          subject: `Reset your ${brand} password`,
          html: `
            <p>Hi${user.name ? ` ${escapeHtml(user.name)}` : ""},</p>
            <p>We received a request to reset your password. Click the link below — it expires in 1 hour.</p>
            <p><a href="${resetUrl}">Reset password</a></p>
            <p>If you didn't request this, you can ignore this email.</p>
          `,
        });
      } else {
        console.warn("[forgot-password] Email not configured — token created but not sent");
      }
    }

    return NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
