// supabase/functions/send-otp/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        // 👇 Add authorization + other required headers here
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { to, otp } = await req.json();

    if (!to || !otp) {
      return new Response(JSON.stringify({ error: "Missing recipient or OTP." }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    // ✅ Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ Check if user exists using the Admin API
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const userExists = users.some((u) => u.email === to);
    if (!userExists) {
      return new Response(JSON.stringify({
        error: "Email not registered. Please sign up first.",
      }), {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    // ✅ Load secrets
    const host = Deno.env.get("SMTP_HOST")!;
    const port = Number(Deno.env.get("SMTP_PORT"))!;
    const user = Deno.env.get("SMTP_USER")!;
    const pass = Deno.env.get("SMTP_PASS")!;
    const senderName = Deno.env.get("SENDER_NAME")!;
    const senderEmail = Deno.env.get("SENDER_EMAIL")!;

    // ✅ Setup transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    // ✅ Send email
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject: "Your One-Time Password (OTP)",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Your OTP Code</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
});
