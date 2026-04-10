import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("access_token", token)
    .single();

  if (error || !workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Update last_active_at
  await supabase
    .from("workspaces")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", workspace.id);

  return NextResponse.json(workspace);
}
