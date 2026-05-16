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

function calculateLeadScore(body: any): number {
  let score = 50;

  // Urgency boosts
  if (body.urgency === "Immediate") score += 25;
  else if (body.urgency === "This Month") score += 15;
  else if (body.urgency === "This Quarter") score += 5;

  // Budget-based boost
  if (body.budget) {
    const cleaned = body.budget.replace(/,/g, "").replace(/₹/g, "").trim();
    const numVal = parseFloat(cleaned) || 0;
    if (/cr/i.test(cleaned) && numVal >= 2) score += 15;
    else if (/cr/i.test(cleaned)) score += 10;
    else if (numVal >= 5000000) score += 10;
    else if (numVal >= 2000000) score += 5;
  }

  // Stage-based deduction
  if (body.stage === "New") score += 5;
  else if (body.stage === "Negotiating") score += 5;
  else if (body.stage === "Closed") score = Math.min(score, 70);

  return Math.min(Math.max(score, 0), 100);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const score = calculateLeadScore(body);

    const newLead = await Lead.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      budget: body.budget,
      interest: body.interest,
      stage: body.stage ?? 'New',
      score: Number(score),
      urgency: body.urgency ?? 'Medium',
      agent: body.agent,
      source: body.source,
      notes: body.notes,
      relatedClientId: body.relatedClientId,
    });

    return NextResponse.json({ data: newLead, calculatedScore: score }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const score = body.urgency ? calculateLeadScore(body) : body.score;

    await Lead.findByIdAndUpdate(body.id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      budget: body.budget,
      interest: body.interest,
      stage: body.stage,
      score: Number(score ?? body.score),
      urgency: body.urgency,
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