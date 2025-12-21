import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { nameId, phone, message, deviceId } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Phone and message required" },
        { status: 400 }
      );
    }

    // Format phone number - remove spaces and ensure country code
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("62")
      ? cleanPhone
      : `62${cleanPhone.slice(1)}`;

    console.log(`[v0] Sending WhatsApp via device: ${deviceId}`);

    // Call external WhatsApp API (replace with your actual service)
    const apiKey = process.env.WHATSAPP_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;

    if (!apiUrl) {
      console.error("[v0] WhatsApp API credentials not configured");
      return NextResponse.json(
        { error: "WhatsApp service not configured" },
        { status: 500 }
      );
    }
    console.log(`${apiUrl}/send-text-message?cred_id=${deviceId}`);
    const response = await fetch(
      `${apiUrl}/send-text-message?cred_id=${deviceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          message: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Update status in database
    if (nameId) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
          },
        }
      );

      await supabase
        .from("names")
        .update({ whatsapp_status: "sent" })
        .eq("id", nameId);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[v0] Error sending WhatsApp:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 }
    );
  }
}
