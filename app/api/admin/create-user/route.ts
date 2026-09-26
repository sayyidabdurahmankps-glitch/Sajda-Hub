// app/api/admin/create-user/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  designation?: string;
  role: "admin" | "manager" | "viewer";
  user_type: "viewer" | "wing_head" | "media_team" | "coordinator" | "admin";
  college_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.admin.getUserBySessions();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body: CreateUserRequest = await request.json();

    if (!body.email || !body.password || !body.full_name) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, full_name" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(body.email);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          full_name: body.full_name,
          phone: body.phone,
          designation: body.designation,
        },
      });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: `Failed to create user: ${authError?.message}` },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    const { error: rolesError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      full_name: body.full_name,
      role: body.role,
      user_type: body.user_type,
      phone: body.phone,
      designation: body.designation,
      college_id: body.college_id || null,
      active: true,
    });

    if (rolesError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Failed to set user role: ${rolesError.message}` },
        { status: 500 }
      );
    }

    const { error: auditError } = await supabaseAdmin
      .from("registration_audit")
      .insert({
        event_type: "admin_created_user",
        user_id: userId,
        user_email: body.email,
        user_type: body.user_type,
        actor_id: user.id,
        metadata: {
          full_name: body.full_name,
          phone: body.phone,
          designation: body.designation,
        },
      });

    if (auditError) {
      console.error("Audit log error:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: userId,
          email: body.email,
          full_name: body.full_name,
          role: body.role,
          user_type: body.user_type,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}