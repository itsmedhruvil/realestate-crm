import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const payments = await prisma.payment.findMany({
      where: status ? { status } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newPayment = await prisma.payment.create({
      data: {
        id: randomUUID(),
        client: body.client,
        property: body.property,
        amount: body.amount,
        type: body.type,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: body.status ?? 'scheduled',
        reminderSent: body.reminderSent ?? false,
      }
    });
    
    return NextResponse.json({ data: newPayment }, { status: 201 });
  } catch (error) {
    console.error('Error adding payment reminder:', error);
    return NextResponse.json({ error: "Failed to add payment reminder" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    await prisma.payment.update({
      where: { id: body.id },
      data: {
        client: body.client,
        property: body.property,
        amount: body.amount,
        type: body.type,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: body.status,
        reminderSent: body.reminderSent,
      }
    });
    
    return NextResponse.json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

// DELETE operation for payments is not explicitly defined in the original API routes,
// but it's good practice to include it for completeness if needed.
// For now, I'll omit it to stick to the provided API routes structure.
// If you need DELETE for payments, let me know.