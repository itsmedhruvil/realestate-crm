import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: clients, error } = await supabase
      .from('Client')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: clients });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data: client, error } = await supabase
      .from('Client')
      .insert([{
        id: randomUUID(),
        name: body.name,
        email: body.email,
        phone: body.phone,
        budget: body.budget,
        propertyInterest: body.propertyInterest,
        status: body.status || "Active",
        assignedAgent: body.assignedAgent,
        notes: body.notes,
      }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to create client' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('Client')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to delete client' }, { status: 500 });
  }
}
