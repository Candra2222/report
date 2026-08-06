import { createSessionToken } from "../_utils/session.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Bad request" }), { status: 400 });
  }

  const { password } = body;

  // DEBUGGING: Cek apakah env terbaca (ini hanya untuk dites, nanti bisa dihapus)
  if (!env.DASHBOARD_PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: "Server Error: DASHBOARD_PASSWORD belum terbaca Cloudflare!" }), { status: 500 });
  }

  if (!password || password !== env.DASHBOARD_PASSWORD) {
    // Kirim balik panjang password yang diketik vs password di env untuk dicocokkan (jangan dipakai di production jangka panjang)
    return new Response(JSON.stringify({ 
      ok: false, 
      error: `Password salah. Input length: ${password?.length}, Env length: ${env.DASHBOARD_PASSWORD.length}` 
    }), { status: 401 });
  }

  const token = await createSessionToken(env.SESSION_SECRET, 12);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`,
    },
  });
}
