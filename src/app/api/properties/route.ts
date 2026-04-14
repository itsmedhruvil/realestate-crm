import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const properties = await prisma.property.findMany({
      where: status ? { status } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ data: properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newProperty = await prisma.property.create({
      data: {
        id: randomUUID(),
        name: body.name,
        location: body.location,
        price: body.price,
        type: body.type,
        status: body.status ?? 'available',
        beds: body.beds,
        baths: body.baths,
        sqft: body.sqft,
        agent: body.agent,
        description: body.description,
        images: body.images || [],
      }
    });
    
    await logActivity({
      type: 'property_created',
      text: `New property created: ${newProperty.name}`,
      agent: newProperty.agent || undefined,
      relatedPropertyId: newProperty.id
    });

    return NextResponse.json({ data: newProperty }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    await prisma.property.update({
      where: { id: body.id },
      data: {
        name: body.name,
        location: body.location,
        price: body.price,
        type: body.type,
        status: body.status,
        beds: body.beds,
        baths: body.baths,
        sqft: body.sqft,
        agent: body.agent,
        description: body.description,
        images: body.images,
      }
    });
    
    await logActivity({
      type: 'property_updated',
      text: `Property updated: ${body.name}`,
      agent: body.agent,
      relatedPropertyId: body.id
    });

    return NextResponse.json({ message: "Property updated successfully" });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}