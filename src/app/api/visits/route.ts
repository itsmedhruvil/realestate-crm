import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteVisit } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    const whereClause: any = {};
    if (dateParam) {
      const startOfDay = new Date(dateParam);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateParam);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereClause.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const visits = await SiteVisit.find(whereClause).sort({ createdAt: -1 });
    return NextResponse.json({ data: visits });
  } catch (error) {
    console.error('Error fetching site visits:', error);
    return NextResponse.json({ error: "Failed to fetch site visits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const newVisit = await SiteVisit.create({
      client: body.client,
      property: body.property,
      agent: body.agent,
      date: body.date ? new Date(body.date) : undefined,
      time: body.time,
      status: body.status ?? 'pending',
      notes: body.notes,
    });
    
    return NextResponse.json({ data: newVisit }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling site visit:', error);
    return NextResponse.json({ error: "Failed to schedule site visit" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    await SiteVisit.findByIdAndUpdate(body.id, {
      client: body.client,
      property: body.property,
      agent: body.agent,
      date: body.date ? new Date(body.date) : undefined,
      time: body.time,
      status: body.status,
      notes: body.notes,
    });
    
    return NextResponse.json({ message: "Site visit updated successfully" });
  } catch (error) {
    console.error('Error updating site visit:', error);
    return NextResponse.json({ error: "Failed to update site visit" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Visit ID required" }, { status: 400 });
    }

    await SiteVisit.findByIdAndDelete(id);
    return NextResponse.json({ message: "Site visit deleted successfully" });
  } catch (error) {
    console.error('Error deleting site visit:', error);
    return NextResponse.json({ error: "Failed to delete site visit" }, { status: 500 });
  }
}