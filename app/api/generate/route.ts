import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const fallback = {
  expression: "unknown",
  mood: "playful",
  context: "general",
  comedic_potential: 70
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const image = form.get("image");
    if (!(image instanceof File)) {
      return NextResponse.json({ message: "No image was uploaded." }, { status: 400 });
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const mimeType = image.type || "image/jpeg";
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json({
        analysis: fallback,
        memes: [
          { caption: "When you have absolutely no idea what's going on.", format: "Reaction", reason: "Safe fallback while the AI provider is not configured.", score: 70, trend: "Fallback" },
          { caption: "POV: You opened the question paper.", format: "POV", reason: "A broadly relatable meme angle.", score: 68, trend: "Classic" },
          { caption: "Me pretending I understand the situation.", format: "Top / Bottom", reason: "Works as a general reaction caption.", score: 65, trend: "Classic" }
        ]
      });
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are Meme AI. Analyze the uploaded image using only observable visual information. Do not identify the person or infer sensitive traits. Then generate exactly 5 ORIGINAL meme concepts specifically suited to this image.

Return ONLY valid JSON:
{
 "analysis":{"expression":"string","mood":"string","context":"string","comedic_potential":0},
 "memes":[
 {"caption":"string","format":"string","reason":"string","score":0,"trend":"Classic|Popular|Original"}
 ]
}

Prioritize image relevance over generic jokes. Keep captions concise and internet-native. Do not claim something is currently trending unless you have reliable current trend information.`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: bytes.toString("base64"), mimeType } }
    ]);

    const raw = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw);

    if (!parsed.analysis || !Array.isArray(parsed.memes)) throw new Error("Invalid AI response");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Meme generation error:", error);
    return NextResponse.json({
      analysis: fallback,
      memes: [
        { caption: "When the AI needs a minute but you still need the meme.", format: "Reaction", reason: "Fallback meme generated after a provider error.", score: 60, trend: "Fallback" },
        { caption: "POV: Nothing is going according to plan.", format: "POV", reason: "Generic fallback.", score: 58, trend: "Classic" },
        { caption: "Me: I've got this. Also me:", format: "Top / Bottom", reason: "Generic fallback.", score: 57, trend: "Classic" }
      ],
      fallback: true
    }, { status: 200 });
  }
}