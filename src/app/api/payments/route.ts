import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter = status ? { status } : {};
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const newPayment = await Payment.create({
      client: body.client,
      property: body.property,
      amount: body.amount,
      type: body.type,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status ?? 'scheduled',
      reminderSent: body.reminderSent ?? false,
    });
    
    return NextResponse.json({ data: newPayment }, { status: 201 });
  } catch (error) {
    console.error('Error adding payment reminder:', error);
    return NextResponse.json({ error: "Failed to add payment reminder" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    await Payment.findByIdAndUpdate(body.id, {
      client: body.client,
      property: body.property,
      amount: body.amount,
      type: body.type,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status,
      reminderSent: body.reminderSent,
    });
    
    return NextResponse.json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
    }

    await Payment.findByIdAndDelete(id);
    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}