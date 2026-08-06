import { verifySessionToken } from "./_utils/session.js";

// PENTING: Tambahkan "/login" (tanpa .html) untuk mencegah bentrok dengan Clean URLs Cloudflare
const PUBLIC_PATHS = ["/login", "/login.html", "/api/login", "/api/logout"];

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  // Cek apakah path saat ini ada di daftar PUBLIC_PATHS atau di dalam folder assets
  const isPublic = PUBLIC_PATHS.includes(url.pathname) || 
                   url.pathname.startsWith("/assets/");

  if (isPublic) {
    return next(); // Langsung lolos jika path publik
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/session=([^;]+)/);
  const token = match ? match[1] : null;

  try {
    const valid = await verifySessionToken(env.SESSION_SECRET, token);

    if (!valid) {
      // Arahkan ke versi "/login" yang bersih dari ekstensi html
      return Response.redirect(new URL("/login", request.url), 302);
    }
  } catch (error) {
    // Tangkap error jika fungsi verifikasi gagal (misal env secret belum diisi)
    console.error("Session verification error:", error);
    return Response.redirect(new URL("/login", request.url), 302);
  }

  return next();
}
