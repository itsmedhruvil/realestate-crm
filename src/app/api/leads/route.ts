import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function GET() {
  try {
    const leads = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        budget,
        interest,
        stage,
        score,
        agent,
        source,
        notes,
        created_at as date
      FROM leads 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const result = await query(`
      INSERT INTO leads (name, email, phone, budget, interest, stage, score, agent, source, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.name,
      body.email,
      body.phone,
      body.budget,
      body.interest,
      body.stage || 'New',
      body.score || 50,
      body.agent,
      body.source,
      body.notes
    ]);
    
    const newLead = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        budget,
        interest,
        stage,
        score,
        agent,
        source,
        notes,
        created_at as date
      FROM leads 
      WHERE id = ?
    `, [result.insertId]);
    
    return NextResponse.json({ data: newLead[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    await query(`
      UPDATE leads 
      SET name = ?, email = ?, phone = ?, budget = ?, interest = ?, 
          stage = ?, score = ?, agent = ?, source = ?, notes = ?
      WHERE id = ?
    `, [
      body.name,
      body.email,
      body.phone,
      body.budget,
      body.interest,
      body.stage,
      body.score,
      body.agent,
      body.source,
      body.notes,
      body.id
    ]);
    
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
    
    await query('DELETE FROM leads WHERE id = ?', [id]);
    
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
