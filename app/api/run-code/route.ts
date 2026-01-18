import { NextRequest, NextResponse } from "next/server";

// Piston API does not need an API Key!
const PISTON_API = "https://emkc.org/api/v2/piston/execute";

// Map your frontend language names to Piston's expected format
const pistonRuntimeMap: Record<string, { language: string; version: string }> =
    {
        javascript: { language: "javascript", version: "18.15.0" }, // Node.js
        python: { language: "python", version: "3.10.0" }, // Python 3
        java: { language: "java", version: "15.0.2" }, // OpenJDK
        c: { language: "c", version: "10.2.0" }, // GCC
    };

export async function POST(req: NextRequest) {
    try {
        const { code, language, stdin = "" } = await req.json();

        // 1. Validate Language
        const runtime = pistonRuntimeMap[language];
        if (!runtime) {
            return NextResponse.json(
                { error: `⚠️ Language '${language}' is not supported` },
                { status: 400 }
            );
        }

        // 2. Call Piston API (Free, No Key)
        const response = await fetch(PISTON_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: runtime.language,
                version: runtime.version,
                files: [
                    {
                        content: code,
                    },
                ],
                stdin: stdin,
            }),
        });

        const result = await response.json();

        // 3. Format Response for your Frontend
        // Piston returns structure: { run: { stdout, stderr, code, ... } }

        // Check if Piston failed to run
        if (result.message) {
            return NextResponse.json({
                stderr: result.message, // e.g. "Runtime not found"
            });
        }

        return NextResponse.json({
            stdout: result.run.stdout || "",
            stderr: result.run.stderr || "",
            compile_output: result.run.output || "", 
            message: result.message || "",
        });
    } catch (err: any) {
        console.error("Run Code Error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to run code" },
            { status: 500 }
        );
    }
}
