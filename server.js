// AI 花艺师 · 全栈站入口。纯 Node 20 内置模块，无依赖：
// 静态托管 + Kimi 登录四端点 + 健康检查。OAuth 逻辑参照官方全栈参考实现移植。
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createHmac, createPublicKey, timingSafeEqual, verify as cryptoVerify, constants as cryptoConsts } from "node:crypto";
import { extname, join, normalize } from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const ROOT = process.cwd();
const MAX_AGE = 30 * 24 * 3600;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/* ------------------------------------------------------------------ 静态文件 */
// 通用规则：已知静态扩展名 + 无路径穿越 + 无隐藏段，basename 黑名单兜底。
// server.js / bootstrap / package.json / .env 等敏感文件一律 404。
const STATIC_EXT = new Set([".html", ".css", ".js", ".mjs", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".woff2"]);
const STATIC_DENY = new Set(["server.js", "bootstrap", "build.mjs", "package.json", "package-lock.json"]);
const STATIC_OK = (rel) => {
  if (rel === "/" || rel === "/index.html") return true;
  const segs = rel.split("/").filter(Boolean);
  if (!segs.length || segs.some((s) => s === ".." || s.startsWith("."))) return false;
  if (STATIC_DENY.has(segs[segs.length - 1])) return false;
  return STATIC_EXT.has(extname(rel).toLowerCase());
};

function serveStatic(pathname, res) {
  if (!STATIC_OK(pathname)) return false;
  const rel = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const file = join(ROOT, rel === "/" ? "index.html" : rel);
  if (file !== join(ROOT, "index.html") && !file.startsWith(ROOT + "/")) return false;
  if (!existsSync(file) || statSync(file).isDirectory()) return false;
  res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
  return true;
}

function json(res, status, payload) {
  const text = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(text),
    "cache-control": "no-store",
  });
  res.end(text);
}

/* ------------------------------------------------------------------- OAuth */
const authUrl = () => process.env.KIMI_AUTH_URL ?? "";
const openUrl = () => process.env.KIMI_OPEN_URL ?? "";
const loginReady = () => Boolean(!process.env.LOGIN_DISABLED && process.env.APP_ID && process.env.APP_SECRET && process.env.KIMI_AUTH_URL);

// 平台多层代理下 x-forwarded-proto 可能是逗号列表，照参考实现的取法
function callbackUrl(headers) {
  const raw = String(headers["x-forwarded-proto"] ?? "http");
  const proto = raw.includes("https") ? "https" : raw.split(",")[0].trim();
  const host = String(headers["x-forwarded-host"] ?? headers.host ?? "localhost").split(",")[0].trim();
  return `${proto}://${host}/api/oauth/callback`;
}

function authorizeUrl(redirectUri) {
  const url = new URL(`${authUrl()}/api/oauth/authorize`);
  url.searchParams.set("client_id", process.env.APP_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", Buffer.from(redirectUri).toString("base64"));
  return url.toString();
}

/* ----------------------------------------------------------- 无依赖 JWT 工具 */
const b64url = (buf) => Buffer.from(buf).toString("base64url");
const b64urlJson = (obj) => b64url(Buffer.from(JSON.stringify(obj), "utf8"));

function signHS256(payload) {
  const body = `${b64urlJson({ alg: "HS256", typ: "JWT" })}.${b64urlJson(payload)}`;
  const sig = createHmac("sha256", process.env.APP_SECRET ?? "").update(body).digest();
  return `${body}.${b64url(sig)}`;
}

function verifyHS256(token) {
  const [h, p, s] = String(token).split(".");
  if (!h || !p || !s) return null;
  const expect = createHmac("sha256", process.env.APP_SECRET ?? "").update(`${h}.${p}`).digest();
  const got = Buffer.from(s, "base64url");
  if (expect.length !== got.length || !timingSafeEqual(expect, got)) return null;
  const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  return payload;
}

let jwksCache = null;
async function jwksKeys() {
  if (jwksCache && jwksCache.at > Date.now() - 3600_000) return jwksCache.keys;
  const resp = await fetch(`${authUrl()}/api/.well-known/jwks.json`);
  if (!resp.ok) throw new Error(`jwks ${resp.status}`);
  const { keys } = await resp.json();
  jwksCache = { keys, at: Date.now() };
  return keys;
}

// 与示例 jose JWKS 验证等宽:RS*/PS*/ES*/EdDSA,按 kid 选 key(无 kid 时逐个试),
// 不静默回退 keys[0]。HS* 不接受(JWKS 验签防 alg 混淆)。
function jwkVerify(alg, data, jwk, sig) {
  const key = createPublicKey({ key: jwk, format: "jwk" });
  if (alg.startsWith("RS")) return cryptoVerify(`RSA-SHA${alg.slice(2)}`, data, key, sig);
  if (alg.startsWith("PS")) return cryptoVerify(`RSA-SHA${alg.slice(2)}`, data, { key, padding: cryptoConsts.RSA_PKCS1_PSS_PADDING, saltLength: Number(alg.slice(2)) / 8 }, sig);
  if (alg.startsWith("ES")) return cryptoVerify(`sha${alg.slice(2)}`, data, { key, dsaEncoding: "ieee-p1363" }, sig);
  if (alg === "EdDSA") return cryptoVerify(null, data, key, sig);
  throw new Error(`不支持的签名算法 ${alg}`);
}

async function verifyAccessToken(token) {
  const [h, p, s] = String(token).split(".");
  if (!h || !p || !s) throw new Error("access token 格式不对");
  const header = JSON.parse(Buffer.from(h, "base64url").toString("utf8"));
  const keys = await jwksKeys();
  const candidates = header.kid ? keys.filter((k) => k.kid === header.kid) : keys;
  if (!candidates.length) throw new Error("JWKS 里没有匹配的 kid");
  const data = Buffer.from(`${h}.${p}`, "utf8"), sig = Buffer.from(s, "base64url");
  let lastErr = new Error("access token 验签失败");
  for (const jwk of candidates) {
    try { if (jwkVerify(String(header.alg ?? ""), data, jwk, sig)) { lastErr = null; break } }
    catch (e) { lastErr = e }
  }
  if (lastErr) throw lastErr;
  const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
  if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error("access token 已过期");
  return payload;
}

/** code 换 token → 验签取 union_id → 拉 profile。任何一步失败都抛。 */
async function completeLogin(code, redirectUri) {
  const resp = await fetch(`${authUrl()}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.APP_ID ?? "",
      client_secret: process.env.APP_SECRET ?? "",
      redirect_uri: redirectUri,
    }).toString(),
  });
  if (!resp.ok) throw new Error(`token exchange ${resp.status}: ${await resp.text()}`);
  const { access_token: accessToken } = await resp.json();

  const payload = await verifyAccessToken(accessToken);
  const unionId = payload.user_id;
  if (typeof unionId !== "string") throw new Error("access token 里没有 user_id");

  const profResp = await fetch(`${openUrl()}/v1/users/me/profile`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const profile = profResp.ok ? await profResp.json() : {};
  return { unionId, name: profile.name ?? "", avatar: profile.avatar_url ?? "" };
}

/* ----------------------------------------------------------------- 会话 */
const SESSION_COOKIE = "kimi_sid";

// 签名密钥直接用 APP_SECRET（本来就只有服务端知道），profile 随会话下发，不落库。
const signSession = ({ unionId, name, avatar }) =>
  signHS256({ unionId, name, avatar, clientId: process.env.APP_ID, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + MAX_AGE });

const readSession = (token) => {
  if (!token) return null;
  try {
    const p = verifyHS256(token);
    return p && typeof p.unionId === "string" ? p : null;
  } catch {
    return null;
  }
};

function parseCookies(header) {
  const out = {};
  for (const part of String(header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function sessionCookie(token, localhost) {
  return [
    `${SESSION_COOKIE}=${token ?? ""}`,
    "Path=/", "HttpOnly",
    // 线上是从 auth 域跨站回跳过来的，必须 None + Secure；本地 http 只能 Lax
    localhost ? "SameSite=Lax" : "SameSite=None; Secure",
    `Max-Age=${token ? MAX_AGE : 0}`,
  ].join("; ");
}

const isLocal = (host) => host.startsWith("localhost") || host.startsWith("127.0.0.1");

/* ------------------------------------------------------------------- 服务 */
const server = createServer(async (req, res) => {
  const host = String(req.headers.host ?? "localhost");
  const url = new URL(req.url ?? "/", `http://${host}`);
  const path = url.pathname;
  const method = req.method ?? "GET";

  if (!path.startsWith("/api/")) {
    if (serveStatic(path, res)) return;
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    return res.end("not found");
  }

  /* 健康检查：全栈站没有自助日志通道，这是线上唯一的观测口 */
  if (path === "/api/health") {
    return json(res, 200, { login: loginReady(), node: process.version });
  }

  /* 登录 */
  if (path === "/api/login") {
    if (!loginReady()) return json(res, 503, { error: "当前环境未配置平台登录" });
    res.writeHead(302, { location: authorizeUrl(callbackUrl(req.headers)) });
    return res.end();
  }

  if (path === "/api/oauth/callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    if (error) {
      if (error === "access_denied") { res.writeHead(302, { location: "/" }); return res.end(); }
      return json(res, 400, { error, description: url.searchParams.get("error_description") });
    }
    if (!code || !state) return json(res, 400, { error: "缺少 code 或 state" });
    try {
      const redirectUri = Buffer.from(state, "base64").toString();
      const user = await completeLogin(code, redirectUri);
      res.writeHead(302, { location: "/", "set-cookie": sessionCookie(signSession(user), isLocal(host)) });
      return res.end();
    } catch (e) {
      console.error("[oauth] 回调失败", e);
      return json(res, 500, { error: "登录失败", detail: e.message });
    }
  }

  if (path === "/api/logout" && method === "POST") {
    res.setHeader("set-cookie", sessionCookie(null, isLocal(host)));
    return json(res, 200, { ok: true });
  }

  if (path === "/api/me") {
    const me = readSession(parseCookies(req.headers.cookie)[SESSION_COOKIE]);
    return me
      ? json(res, 200, { name: me.name ?? "", avatar: me.avatar ?? "" })
      : json(res, 401, { error: "未登录" });
  }

  return json(res, 404, { error: "没有这个接口" });
});

server.listen(PORT, "0.0.0.0", () => console.log(`[AI花艺师] 监听 0.0.0.0:${PORT}`));
