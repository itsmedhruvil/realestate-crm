import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    const whereClause: any = {};
    if (dateParam) {
      // Assuming dateParam is in 'YYYY-MM-DD' format
      const startOfDay = new Date(dateParam);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateParam);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereClause.date = {
        gte: startOfDay.toISOString(),
        lte: endOfDay.toISOString(),
      };
    }

    const visits = await prisma.siteVisit.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ data: visits });
  } catch (error) {
    console.error('Error fetching site visits:', error);
    return NextResponse.json({ error: "Failed to fetch site visits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newVisit = await prisma.siteVisit.create({
      data: {
        id: randomUUID(),
        client: body.client,
        property: body.property,
        agent: body.agent,
        date: body.date ? new Date(body.date) : undefined,
        time: body.time,
        status: body.status ?? 'pending',
        notes: body.notes,
      }
    });
    
    return NextResponse.json({ data: newVisit }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling site visit:', error);
    return NextResponse.json({ error: "Failed to schedule site visit" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    await prisma.siteVisit.update({
      where: { id: body.id },
      data: {
        client: body.client,
        property: body.property,
        agent: body.agent,
        date: body.date ? new Date(body.date) : undefined,
        time: body.time,
        status: body.status,
        notes: body.notes,
      }
    });
    
    return NextResponse.json({ message: "Site visit updated successfully" });
  } catch (error) {
    console.error('Error updating site visit:', error);
    return NextResponse.json({ error: "Failed to update site visit" }, { status: 500 });
  }
}