// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextResponse } from "next/server";

// const MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

// export async function POST(req: Request) {
//     try {
//         const apiKey = process.env.GEMINI_API_KEY;
//         if (!apiKey) {
//             return NextResponse.json(
//                 { error: "Missing GEMINI_API_KEY" },
//                 { status: 500 }
//             );
//         }

//         const { mode, language, code, userPrompt } = await req.json();

//         const genAI = new GoogleGenerativeAI(apiKey);

//         let prompt = "";
//         if (mode === "debug") {
//             prompt = `Fix this ${language} code:\n${code}`;
//         } else if (mode === "explain") {
//             prompt = `Explain this ${language} code:\n${code}`;
//         } else {
//             prompt = `Write ${language} code for:\n${userPrompt}`;
//         }

//         let lastError: any = null;

//         // 🛡️ TRY MODELS ONE BY ONE
//         for (const modelName of MODELS) {
//             try {
//                 const model = genAI.getGenerativeModel({ model: modelName });
//                 const result = await model.generateContent(prompt);

//                 return NextResponse.json({
//                     result: result.response.text(),
//                     modelUsed: modelName,
//                 });
//             } catch (err) {
//                 lastError = err;
//                 console.warn(`⚠️ Model failed: ${modelName}`);
//             }
//         }

//         throw lastError;
//     } catch (error: any) {
//         console.error("❌ Gemini Error:", error);

//         return NextResponse.json(
//             {
//                 error: "Gemini free API is temporarily unavailable or model quota exceeded.",
//             },
//             { status: 503 }
//         );
//     }
// }












import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // 1. Check API Key
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key is missing. Check .env.local file." },
                { status: 500 }
            );
        }

        // 2. Initialize Groq
        const groq = new Groq({ apiKey });

        // 3. Parse Data
        const body = await req.json();
        const { mode, language, code, userPrompt } = body;

        // 4. Construct Prompt
        let systemPrompt = "";
        if (mode === "debug") {
            systemPrompt = `Role: Expert Code Debugger. Language: ${language}. \nTask: Find bugs and provide the fixed code. \nInput Code:\n${code}`;
        } else if (mode === "explain") {
            systemPrompt = `Role: Tutor. Language: ${language}. \nTask: Explain this code simply. \nInput Code:\n${code}`;
        } else {
            systemPrompt = `Role: Senior Developer. Language: ${language}. \nTask: Write code for: "${userPrompt}". \nConstraints: efficient, clean code only.`;
        }

        // 5. Call Groq (Llama 3 Model)
        // We use "llama3-8b-8192" which is super fast and free
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful coding assistant. Output markdown code blocks.",
                },
                { role: "user", content: systemPrompt },
            ],
            // UPDATED MODEL NAME HERE:
            model: "llama-3.3-70b-versatile",
        });

        const text =
            completion.choices[0]?.message?.content || "No response generated.";

        return NextResponse.json({ result: text });
    } catch (error: any) {
        console.error("❌ GROQ ERROR:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong on the server." },
            { status: 500 }
        );
    }
}