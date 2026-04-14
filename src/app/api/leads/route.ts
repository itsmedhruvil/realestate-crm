import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: leads, error } = await supabase
      .from('Lead')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const payload = {
      id: randomUUID(),
      name: body.name,
      email: body.email,
      phone: body.phone,
      budget: body.budget,
      interest: body.interest,
      stage: body.stage ?? 'New',
      score: Number(body.score ?? 50),
      agent: body.agent,
      source: body.source,
      notes: body.notes,
    };

    const { data: newLead, error } = await supabase
      .from('Lead')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: newLead }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error.message ?? error);
    return NextResponse.json({ error: error.message ?? "Failed to create lead" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { error } = await supabase
      .from('Lead')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        budget: body.budget,
        interest: body.interest,
        stage: body.stage,
        score: body.score,
        agent: body.agent,
        source: body.source,
        notes: body.notes,
      })
      .eq('id', body.id);
    
    if (error) throw error;
    
    return NextResponse.json({ message: "Lead updated successfully" });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('Lead')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
