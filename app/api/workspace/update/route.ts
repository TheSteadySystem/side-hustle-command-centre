import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ALLOWED_FIELDS = [
  "runway_state",
  "content_state",
  "revenue_entries",
  "milestones",
  "offer_card",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { access_token, field, value } = body;

  if (!access_token || !field || value === undefined) {
    return NextResponse.json(
      { error: "access_token, field, and value are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_FIELDS.includes(field as AllowedField)) {
    return NextResponse.json({ error: "Field not allowed" }, { status: 400 });
  }

  // Validate token
  const { data: workspace, error: fetchError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("access_token", access_token)
    .single();

  if (fetchError || !workspace) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { error } = await supabase
    .from("workspaces")
    .update({ [field]: value })
    .eq("id", workspace.id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
