import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all names
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("names").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error fetching names:", error)
    return NextResponse.json({ error: "Failed to fetch names" }, { status: 500 })
  }
}

// POST new name
export async function POST(request: Request) {
  try {
    const { name, phone_number } = await request.json()
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("names")
      .insert([
        {
          name: name.trim(),
          phone_number: phone_number ? String(phone_number).trim() : null,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error adding name:", error)
    return NextResponse.json({ error: "Failed to add name" }, { status: 500 })
  }
}
