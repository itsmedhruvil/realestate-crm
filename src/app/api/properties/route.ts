import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models";
import { logActivity } from "@/lib/activityLogger";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    if (id) {
      const property = await Property.findById(id);
      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }
      return NextResponse.json({ data: property });
    }

    const filter = status ? { status } : {};
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ data: properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const newProperty = await Property.create({
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
    });
    
    await logActivity({
      type: 'property_created',
      text: `New property created: ${newProperty.name}`,
      agent: newProperty.agent || undefined,
      relatedPropertyId: newProperty._id?.toString(),
    });

    return NextResponse.json({ data: newProperty }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    await Property.findByIdAndUpdate(body.id, {
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
    });
    
    await logActivity({
      type: 'property_updated',
      text: `Property updated: ${body.name}`,
      agent: body.agent,
      relatedPropertyId: body.id,
    });

    return NextResponse.json({ message: "Property updated successfully" });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { ids, operation, value } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Property IDs required" }, { status: 400 });
    }

    if (operation === "status") {
      if (!value || !["available", "reserved", "sold"].includes(value)) {
        return NextResponse.json({ error: "Valid status value required (available, reserved, sold)" }, { status: 400 });
      }
      await Property.updateMany(
        { _id: { $in: ids } },
        { $set: { status: value } }
      );
      await logActivity({
        type: 'property_updated',
        text: `Bulk status update: ${ids.length} properties set to ${value}`,
      });
      return NextResponse.json({ message: `${ids.length} properties updated to ${value}` });
    }

    if (operation === "delete") {
      await Property.deleteMany({ _id: { $in: ids } });
      await logActivity({
        type: 'property_updated',
        text: `Bulk delete: ${ids.length} properties removed`,
      });
      return NextResponse.json({ message: `${ids.length} properties deleted` });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    console.error('Error in bulk property operation:', error);
    return NextResponse.json({ error: "Failed to process bulk operation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    await Property.findByIdAndDelete(id);
    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}