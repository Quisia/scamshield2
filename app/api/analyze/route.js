export async function POST(req) {
  const { text } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are a scam detection expert.

Return ONLY valid JSON. No markdown. No explanation. No text outside JSON.
If your output is not JSON, restart and output JSON only.

Use this schema EXACTLY:

{
  "riskScore": number,
  "riskLabel": "clear_scam" | "likely_scam" | "uncertain" | "likely_legit",
  "scamType": "rental" | "romance" | "crypto" | "phishing" | "job_offer" | "money_exchange" | "other",
  "reasons": ["string"],
  "recommendation": "string"
}

Analyze the following message and output ONLY the JSON object:

"${text}"
`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let json;

    try {
      json = JSON.parse(raw);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON returned by AI",
          rawResponse: raw
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(json), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to contact Gemini",
      details: error.toString()
    }), { status: 500 });
  }
}
