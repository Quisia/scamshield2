import OpenAI from "openai";

export async function POST(req) {
  const { text } = await req.json();

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `
You are a professional scam detector. Analyze this message:

"${text}"

Return a valid JSON with:
- riskScore (0-100)
- riskLabel (clear_scam, likely_scam, uncertain, legit)
- scamType (rental, romance, crypto, phishing, job_offer, other)
- reasons: array of bullet points
- recommendation: short advice
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  let output;

  try {
    output = JSON.parse(completion.choices[0].message.content);
  } catch {
    output = {
      riskScore: 50,
      riskLabel: "uncertain",
      scamType: "other",
      reasons: ["Could not parse AI output"],
      recommendation: "Try again with more text."
    };
  }

  return new Response(JSON.stringify(output), {
    headers: { "Content-Type": "application/json" }
  });
}
