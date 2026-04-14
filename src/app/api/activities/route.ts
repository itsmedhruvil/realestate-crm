import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        lead: true, // Include related lead data if needed
        property: true, // Include related property data if needed
      }
    });
    
    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newActivity = await prisma.activity.create({
      data: {
        id: randomUUID(),
        type: body.type,
        text: body.text,
        agent: body.agent,
        lead: body.relatedLeadId ? { connect: { id: body.relatedLeadId } } : undefined,
        property: body.relatedPropertyId ? { connect: { id: body.relatedPropertyId } } : undefined,
      }
    });
    
    return NextResponse.json({ data: newActivity }, { status: 201 });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    await prisma.activity.update({
      where: { id: body.id },
      data: {
        type: body.type,
        text: body.text,
        agent: body.agent,
        lead: body.relatedLeadId ? { connect: { id: body.relatedLeadId } } : undefined,
        property: body.relatedPropertyId ? { connect: { id: body.relatedPropertyId } } : undefined,
      }
    });
    
    return NextResponse.json({ message: "Activity updated successfully" });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 });
    }

    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}