import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { canAccessPath, isAdminRole, normalizeRole } from "@/lib/auth/roles";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function serverSupabase(req: NextRequest) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
    },
  });
}

async function getRequestUser(req: NextRequest) {
  const {
    data: { user },
    error,
  } = await serverSupabase(req).auth.getUser();

  if (error || !user) return null;
  return user;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Only administrators can manage team members." }, { status: 403 });
}

async function findAuthUserByEmail(email: string) {
  const supabaseAdmin = getSupabaseAdmin();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.nextPage === null || page >= data.lastPage) return null;
  }

  return null;
}

async function sendPasswordSetupEmail(email: string, redirectTo: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

async function inviteOrUpdateTeamLogin({
  email,
  name,
  phone,
  role,
  redirectTo,
}: {
  email: string;
  name: string;
  phone?: string;
  role: string;
  redirectTo: string;
}) {
  const metadata = {
    full_name: name,
    phone: phone || "",
    role,
  };
  const supabaseAdmin = getSupabaseAdmin();
  const existingUser = await findAuthUserByEmail(email);

  if (existingUser) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      email,
      user_metadata: metadata,
    });

    if (updateError) throw updateError;

    const { error: resetError } = await sendPasswordSetupEmail(email, redirectTo);
    if (resetError) throw resetError;

    return { authUserId: existingUser.id, inviteSent: false, passwordSetupSent: true };
  }

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: metadata,
    redirectTo,
  });

  if (error) throw error;

  return { authUserId: data.user?.id || null, inviteSent: true, passwordSetupSent: false };
}

export async function GET(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) return unauthorized();
    if (!canAccessPath(user.user_metadata?.role, "/dashboard/team")) return forbidden();

    const teamMembers = await prisma.teamMember.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ data: teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) return unauthorized();
    if (!isAdminRole(user.user_metadata?.role)) return forbidden();

    const body = await req.json();
    const role = normalizeRole(body.role);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!body.name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const loginResult = await inviteOrUpdateTeamLogin({
      email,
      name: body.name,
      phone: body.phone,
      role,
      redirectTo: `${req.nextUrl.origin}/signin`,
    });
    
    const newTeamMember = await prisma.teamMember.create({
      data: {
        id: randomUUID(),
        name: body.name,
        email,
        phone: body.phone,
        role,
        leads: body.leads ?? 0,
        closed: body.closed ?? 0,
        revenue: body.revenue,
      }
    });
    
    return NextResponse.json({ data: newTeamMember, auth: loginResult }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add team member" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) return unauthorized();
    if (!isAdminRole(user.user_metadata?.role)) return forbidden();

    const body = await req.json();
    const role = normalizeRole(body.role);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!body.id || !body.name || !email) {
      return NextResponse.json({ error: "ID, name, and email are required." }, { status: 400 });
    }

    const authUser = await findAuthUserByEmail(email);
    if (authUser) {
      const { error: updateError } = await getSupabaseAdmin().auth.admin.updateUserById(authUser.id, {
        email,
        user_metadata: {
          full_name: body.name,
          phone: body.phone || "",
          role,
        },
      });

      if (updateError) throw updateError;
    }
    
    await prisma.teamMember.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email,
        phone: body.phone,
        role,
        leads: body.leads,
        closed: body.closed,
        revenue: body.revenue,
      }
    });
    
    return NextResponse.json({ message: "Team member updated successfully" });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getRequestUser(req);
    if (!user) return unauthorized();
    if (!isAdminRole(user.user_metadata?.role)) return forbidden();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Team member ID required" }, { status: 400 });
    }

    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
