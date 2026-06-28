const API = "http://localhost:3000/api";
const WEB = "http://localhost:3001";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return data;
}

async function main() {
  console.log("1. Login as customer...");
  const auth = await api("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "customer@gfs.com", password: "password123" }),
  });
  const token = auth.accessToken;
  console.log("   OK — got access token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  console.log("2. Ensure project + moodboard...");
  let projectId = "seed-project-1";
  try {
    await api(`/projects/${projectId}`, { headers });
  } catch {
    const project = await api("/projects", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "AI Smoke Test Project",
        description: "Moodboard agent verification",
      }),
    });
    projectId = project.id;
  }

  const moodboard = await api("/moodboards", {
    method: "POST",
    headers,
    body: JSON.stringify({
      projectId,
      styleDirection: "Quiet luxury minimalism",
      colorPalette: ["ivory", "charcoal", "sand"],
      fabricSuggestions: ["cashmere", "silk twill"],
      mood: "refined and calm",
    }),
  });
  console.log(`   OK — moodboard ${moodboard.id}`);

  console.log("3. Moodboard AI chat (Fireworks AI)...");
  const chatRes = await fetch(`${WEB}/api/ai/v1/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      moodboardId: moodboard.id,
      projectId,
      mode: "design",
      enableImage: false,
      messages: [
        {
          id: "msg-1",
          role: "user",
          parts: [
            {
              type: "text",
              text: "Suggest a 3-color palette for a quiet luxury resort collection. Reply in 2 short sentences only.",
            },
          ],
        },
      ],
    }),
  });

  if (!chatRes.ok) {
    const err = await chatRes.text();
    throw new Error(`Chat failed ${chatRes.status}: ${err.slice(0, 800)}`);
  }

  const body = await chatRes.text();
  const textChunks = [];
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const event = JSON.parse(payload);
      if (event.type === "text-delta" && event.delta) textChunks.push(event.delta);
      if (event.type === "text" && event.text) textChunks.push(event.text);
    } catch {
      // ignore parse errors on stream chunks
    }
  }

  const reply = textChunks.join("").trim();
  console.log("   Status:", chatRes.status);
  console.log("   Model env:", process.env.FIREWORKS_MODEL_CHAT ?? "(from .env.local on server)");
  console.log("   Reply:", reply || body.slice(0, 400));

  if (!reply && !body.includes("text")) {
    throw new Error("No text in AI response stream");
  }

  console.log("\nSmoke test PASSED");
}

main().catch((err) => {
  console.error("\nSmoke test FAILED:", err.message);
  process.exit(1);
});
