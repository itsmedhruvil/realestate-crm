import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Lead, Client, Activity } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if client with this email already exists
    let client = await Client.findOne({ email: body.email });

    if (!client) {
      // Create a new client first
      client = await Client.create({
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        budget: body.budget || "",
        propertyInterest: body.propertyName || body.interest || "Property inquiry",
        status: "Active",
        notes: body.message || "",
      });
    } else {
      // Update existing client with new note
      const newNote = body.propertyName
        ? `Inquiry from: ${body.propertyName}${body.message ? ` - ${body.message}` : ""}`
        : body.message || "";
      if (newNote) {
        client.notes = client.notes
          ? `${client.notes}\n---\n${newNote}`
          : newNote;
        await client.save();
      }
    }

    // Create a lead from the inquiry, linked to the client
    const newLead = await Lead.create({
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      budget: body.budget || "",
      interest: body.propertyName || body.interest || "Property inquiry",
      stage: "New",
      score: 50,
      source: body.source || "Public Listing",
      notes: body.message || "",
      relatedClientId: client._id?.toString(),
    });

    // Link the lead back to the client
    client.relatedLeadId = newLead._id?.toString();
    await client.save();

    // Log activity
    await Activity.create({
      type: "lead_created",
      text: `New lead created from public inquiry: ${body.name}${body.propertyName ? ` - interested in ${body.propertyName}` : ""}`,
      relatedLeadId: newLead._id?.toString(),
      relatedClientId: client._id?.toString(),
    });

    return NextResponse.json(
      {
        message: "Inquiry submitted successfully",
        data: {
          lead: newLead,
          client,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}