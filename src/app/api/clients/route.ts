import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Client } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const clients = await Client.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const newClient = await Client.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      budget: body.budget,
      propertyInterest: body.propertyInterest,
      status: body.status || "Active",
      assignedAgent: body.assignedAgent,
      notes: body.notes,
      relatedLeadId: body.relatedLeadId,
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Client ID is required for update' }, { status: 400 });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      body.id,
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        budget: body.budget,
        propertyInterest: body.propertyInterest,
        status: body.status,
        assignedAgent: body.assignedAgent,
        notes: body.notes,
        relatedLeadId: body.relatedLeadId,
      },
      { new: true }
    );

    return NextResponse.json({ data: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    await Client.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}