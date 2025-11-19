export async function POST(req) {
  const { text } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      { status: 500 }
    );
  }

  // Gemini API endpoint
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    apiKey;

  const prompt = `
You are an expert scam detector. Analyze the following message:

"${text}"

Return a JSON with:
- riskScore (0-100)
- riskLabel (clear_scam, likely_scam, uncertain, likely_legit)
- scamType (rental, romance, crypto, phishing, job_offer, money_exchange, other)
- reasons: array of short bullet points
- recommendation: short actionable advice for the victim
IMPORTANT: Return ONLY valid JSON, no commentary.
`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let output = {};

    try {
      output = JSON.parse(raw);
    } catch {
      output = {
        riskScore: 50,
        riskLabel: "uncertain",
        scamType: "other",
        reasons: ["AI response was not valid JSON"],
        recommendation: "Try again with more information."
      };
    }

    return new Response(JSON.stringify(output), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Failed to contact Gemini API", details: e }),
      { status: 500 }
    );
  }
}
