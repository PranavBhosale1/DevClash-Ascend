import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const supabaseId = req.nextUrl.searchParams.get("supabaseId");

  if (!supabaseId) return NextResponse.json({ error: "Missing supabaseId" }, { status: 400 });

  const user = await User.findOne({ supabaseId });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}
