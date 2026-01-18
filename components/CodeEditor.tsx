
"use client";
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Loader2, Terminal } from "lucide-react";

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
    setLanguage: (language: string) => void;
}

const languageMap: Record<string, string> = {
    javascript: "javascript",
    java: "java",
    python: "python",
    c: "c",
};

const templates: Record<string, string> = {
    javascript: `function greet(name) {\n  console.log("Hello " + name);\n}\n\ngreet("JavaScript");`,
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello Java");\n  }\n}`,
    python: `def greet(name):\n    print("Hello", name)\n\ngreet("Python")`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello C");\n    return 0;\n}`,
};

const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
    { value: "c", label: "C" },
];

export const CodeEditor = ({
    code,
    setCode,
    language,
    setLanguage,
}: CodeEditorProps) => {
    const editorRef = useRef<any>(null);
    const [languageValues, setLanguageValues] =
        useState<Record<string, string>>(templates);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const runCode = async () => {
        setIsRunning(true);
        setOutput("⏳ Running...");

        try {
            const res = await fetch("/api/run-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language }),
            });

            const data = await res.json();

            if (data.compile_output)
                setOutput(`${data.compile_output}`);
            else if (data.stderr)
                setOutput(`❌ Runtime Error:\n${data.stderr}`);
            else if (data.stdout) setOutput(data.stdout);
            else setOutput("✅ Execution finished (no output)");
        } catch {
            setOutput("❌ Failed to connect to server");
        } finally {
            setIsRunning(false);
        }
    };

    const handleEditorChange = (value?: string) => {
        const newCode = value ?? "";
        setCode(newCode);
        setLanguageValues((prev) => ({ ...prev, [language]: newCode }));
    };

    useEffect(() => {
        const saved = languageValues[language] || templates[language];
        setCode(saved);
        setOutput("");
    }, [language]);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            <div className="flex items-center justify-between p-3 bg-[#252526] border-b border-[#333]">
                <span className="text-sm text-gray-400">Code Editor</span>
                <div className="flex gap-2">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[140px] h-8 bg-[#3c3c3c] text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#252526] text-white">
                            {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        onClick={runCode}
                        disabled={isRunning}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isRunning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        Run
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language={languageMap[language]}
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        automaticLayout: true,
                        fontFamily: "'JetBrains Mono', monospace",
                    }}
                />
            </div>

            <div className="h-40 bg-[#0a0a0a] border-t border-[#333]">
                <div className="px-3 py-1 bg-[#252526] text-gray-400 text-xs flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Terminal
                </div>

                <pre
                    className={`p-3 text-sm overflow-auto whitespace-pre-wrap ${
                        output.startsWith("❌")
                            ? "text-red-400"
                            : output.startsWith("⚠️")
                              ? "text-yellow-400"
                              : "text-green-400"
                    }`}
                >
                    {output || (
                        <span className="text-gray-600 italic">
                            Click "Run" to execute code
                        </span>
                    )}
                </pre>
            </div>
        </div>
    );
};
