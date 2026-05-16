import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { TeamMember } from "@/lib/models";
import { normalizeRole } from "@/lib/auth/roles";

type ClerkEvent = {
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    unsafe_metadata?: Record<string, unknown>;
  };
  object: string;
  type: string;
};

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("CLERK_WEBHOOK_SECRET not set — skipping webhook processing");
      return NextResponse.json({ message: "Webhook secret not configured" });
    }

    // Verify webhook signature
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const payload = await req.text();
    const wh = new Webhook(webhookSecret);
    let event: ClerkEvent;

    try {
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkEvent;
    } catch {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    if (event.type !== "user.created") {
      return NextResponse.json({ message: `Ignoring event type: ${event.type}` });
    }

    const { id: clerkUserId, email_addresses } = event.data;
    const email = email_addresses?.[0]?.email_address?.toLowerCase() ?? "";

    if (!email) {
      return NextResponse.json({ error: "No email found in user data" }, { status: 400 });
    }

    // Check if this user was pre-registered in the TeamMember collection
    await connectDB();
    const existingMember = await TeamMember.findOne({ email });

    let role: string;
    if (existingMember) {
      role = normalizeRole(existingMember.role);
    } else {
      // Self-signup — default to Sales
      role = "Sales";
    }

    // Sync role to Clerk metadata using the Backend API
    const response = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unsafe_metadata: { role },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Failed to update Clerk user metadata:", errorBody);
      return NextResponse.json(
        { error: "Failed to update Clerk user metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Role synced", role });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}