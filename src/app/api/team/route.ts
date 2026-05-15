import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { TeamMember } from "@/lib/models";
import { normalizeRole } from "@/lib/auth/roles";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorized();
    await connectDB();

    const teamMembers = await TeamMember.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorized();
    await connectDB();

    const body = await req.json();
    const role = normalizeRole(body.role);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!body.name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const newTeamMember = await TeamMember.create({
      name: body.name,
      email,
      phone: body.phone,
      role,
      leads: body.leads ?? 0,
      closed: body.closed ?? 0,
      revenue: body.revenue,
    });
    
    return NextResponse.json({ data: newTeamMember }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add team member" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorized();
    await connectDB();

    const body = await req.json();
    const role = normalizeRole(body.role);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!body.id || !body.name || !email) {
      return NextResponse.json({ error: "ID, name, and email are required." }, { status: 400 });
    }

    await TeamMember.findByIdAndUpdate(body.id, {
      name: body.name,
      email,
      phone: body.phone,
      role,
      leads: body.leads,
      closed: body.closed,
      revenue: body.revenue,
    });
    
    return NextResponse.json({ message: "Team member updated successfully" });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorized();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Team member ID required" }, { status: 400 });
    }

    await TeamMember.findByIdAndDelete(id);
    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}