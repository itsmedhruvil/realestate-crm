import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Lead } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const newLead = await Lead.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      budget: body.budget,
      interest: body.interest,
      stage: body.stage ?? 'New',
      score: Number(body.score ?? 50),
      agent: body.agent,
      source: body.source,
      notes: body.notes,
      relatedClientId: body.relatedClientId,
    });

    return NextResponse.json({ data: newLead }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    await Lead.findByIdAndUpdate(body.id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      budget: body.budget,
      interest: body.interest,
      stage: body.stage,
      score: body.score,
      agent: body.agent,
      source: body.source,
      notes: body.notes,
      relatedClientId: body.relatedClientId,
    });

    return NextResponse.json({ message: "Lead updated successfully" });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}