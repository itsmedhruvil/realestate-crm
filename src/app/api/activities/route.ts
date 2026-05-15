import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Activity } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const activities = await Activity.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const newActivity = await Activity.create({
      type: body.type,
      text: body.text,
      agent: body.agent,
      relatedLeadId: body.relatedLeadId,
      relatedPropertyId: body.relatedPropertyId,
    });
    
    return NextResponse.json({ data: newActivity }, { status: 201 });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    await Activity.findByIdAndUpdate(body.id, {
      type: body.type,
      text: body.text,
      agent: body.agent,
      relatedLeadId: body.relatedLeadId,
      relatedPropertyId: body.relatedPropertyId,
    });
    
    return NextResponse.json({ message: "Activity updated successfully" });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 });
    }

    await Activity.findByIdAndDelete(id);
    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}