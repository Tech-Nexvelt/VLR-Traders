import { NextResponse } from "next/server";
import { createSupabaseUserClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseUserClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
