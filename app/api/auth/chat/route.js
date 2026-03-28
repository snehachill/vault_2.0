// app/api/auth/chat/route.js

import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    // ✅ API Key check
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY missing hai .env.local mein!" },
        { status: 500 },
      );
    }

    const result = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.", // Apna custom prompt yahan likho
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile", // Best free model
      temperature: 0.7, // 0 = robotic, 1 = creative
      max_tokens: 1024,
    });

    const response = result.choices[0].message.content;
    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error("Groq API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
