import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_TOOLS = ["curl", "docker", "ffmpeg"];

export async function POST(req: Request) {
  try {
    const { tool, prompt } = await req.json();

    if (!tool || !prompt) {
      return NextResponse.json({ error: "Missing tool or prompt" }, { status: 400 });
    }

    if (!ALLOWED_TOOLS.includes(tool)) {
      return NextResponse.json({ error: "Unsupported tool" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI features require an API key. Set ANTHROPIC_API_KEY in your environment." },
        { status: 503 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a CLI expert. The user wants to use "${tool}" to accomplish the following task:\n\n"${prompt}"\n\nGenerate ONLY the ${tool} command. No explanation, no markdown fences, no extra text. Just the raw command that can be copied and pasted into a terminal.`,
        },
      ],
    });

    const command = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    return NextResponse.json({ command });
  } catch (e) {
    console.error("AI route error:", e);
    return NextResponse.json(
      { error: "Failed to generate command" },
      { status: 500 }
    );
  }
}
