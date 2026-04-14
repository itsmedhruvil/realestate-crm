import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ data: teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newTeamMember = await prisma.teamMember.create({
      data: {
        id: randomUUID(),
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        leads: body.leads ?? 0,
        closed: body.closed ?? 0,
        revenue: body.revenue,
      }
    });
    
    return NextResponse.json({ data: newTeamMember }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    await prisma.teamMember.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        leads: body.leads,
        closed: body.closed,
        revenue: body.revenue,
      }
    });
    
    return NextResponse.json({ message: "Team member updated successfully" });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Team member ID required" }, { status: 400 });
    }

    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}