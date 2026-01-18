"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Bug, Check, Copy, Loader2, Wand2, Play } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";

interface AiPanelProps {
  code: string;
  language: string;
}

type ActionMode = "debug" | "explain" | "generate";

// 1. Map your Editor languages to Judge0 IDs
const judge0LanguageMap: Record<string, number> = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  java: 62,       // OpenJDK 13
  c: 50,          // GCC
};

export const AiPanel = ({ code, language }: AiPanelProps) => {
  const [activeTab, setActiveTab] = useState<ActionMode>("debug");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false); 
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState(""); 

const handleAiAction = async (mode: ActionMode) => {
    setIsLoading(true);
    setAiResponse("");
    setOutput("");

    try {
        const response = await fetch("/api/ai-assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode,
                language,
                code,
                userPrompt: mode === "generate" ? generatePrompt : "",
            }),
        });

        const data = await response.json();

        if (data.result) {
            // 1. Show the result to the user immediately
            setAiResponse(data.result);

            // 2. Save to Supabase 
            const { error } = await supabase.from("history").insert([
                {
                    mode: mode,
                    language: language,
                    // Create a short title for the history list
                    prompt:
                        mode === "generate"
                            ? generatePrompt
                            : code
                            ? code.substring(0, 30) + "..."
                            : "Code Snippet",
                    code_output: data.result, 
                },
            ]);

            if (error) console.error("Supabase Save Error:", error.message);
            else console.log("✅ Saved to History");
        } else {
            setAiResponse("❌ No response from AI.");
        }
    } catch (error) {
        console.error(error);
        setAiResponse("❌ Error connecting to AI.");
    } finally {
        setIsLoading(false);
    }
};

  const copyCodeOnly = () => {
    // copies full response for now if no blocks found
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- 2. Run Code Logic (Judge0) ---
  const runCode = async () => {
    // Check if language is support
    if (!judge0LanguageMap[language]) {
      setOutput(`⚠️ Execution for '${language}' is not supported yet.`);
      return;
    }

    setIsRunning(true);
    setOutput("⏳ Compiling and Running...");

    try {
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "6c92e2c4f9msh5599f4ec6c831f5p174c05jsnfa0c46d09599",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            language_id: judge0LanguageMap[language],
            source_code: code,
            stdin: "", 
          }),
        }
      );

      const result = await response.json();

      // Handle Judge0 Response
      if (result.stdout) {
        setOutput(result.stdout);
      } else if (result.stderr) {
        setOutput(`❌ Error:\n${result.stderr}`);
      } else if (result.compile_output) {
        setOutput(`⚠️ Compilation Error:\n${result.compile_output}`);
      } else if (result.message) {
        setOutput(`⚠️ System Error: ${result.message}`);
      } else {
        setOutput("✅ Code executed successfully (No Output)");
      }
      
    } catch (err) {
      console.error(err);
      setOutput("❌ Failed to connect to Compiler API.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
      <div className="flex flex-col h-full bg-card">
          <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ActionMode)}
              className="flex flex-col h-full"
          >
              {/* Header with Tabs */}
              <div className="border-b border-border p-2 bg-secondary/30">
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="debug" className="gap-2">
                          <Bug className="w-4 h-4" /> Debug
                      </TabsTrigger>
                      <TabsTrigger value="explain" className="gap-2">
                          <BookOpen className="w-4 h-4" /> Explain
                      </TabsTrigger>
                      <TabsTrigger value="generate" className="gap-2">
                          <Wand2 className="w-4 h-4" /> Generate
                      </TabsTrigger>
                  </TabsList>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
                  {/* Action Buttons specific to Tabs */}
                  <TabsContent value="debug" className="mt-0">
                      <div className="text-xs text-muted-foreground mb-2">
                          Fix bugs in your current code.
                      </div>
                      <Button
                          onClick={() => handleAiAction("debug")}
                          disabled={isLoading}
                          className="w-full"
                      >
                          {isLoading ? (
                              <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          ) : (
                              <Bug className="w-4 h-4 mr-2" />
                          )}{" "}
                          Fix Code
                      </Button>
                  </TabsContent>

                  <TabsContent value="explain" className="mt-0">
                      <div className="text-xs text-muted-foreground mb-2">
                          Get a simple explanation.
                      </div>
                      <Button
                          onClick={() => handleAiAction("explain")}
                          disabled={isLoading}
                          className="w-full"
                      >
                          {isLoading ? (
                              <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          ) : (
                              <BookOpen className="w-4 h-4 mr-2" />
                          )}{" "}
                          Explain Code
                      </Button>
                  </TabsContent>

                  <TabsContent
                      value="generate"
                      className="mt-0 flex flex-col gap-2"
                  >
                      <Textarea
                          placeholder="What code should I write?"
                          value={generatePrompt}
                          onChange={(e) => setGeneratePrompt(e.target.value)}
                          className="bg-secondary text-sm"
                      />
                      <Button
                          onClick={() => handleAiAction("generate")}
                          disabled={isLoading}
                          className="w-full"
                      >
                          {isLoading ? (
                              <Loader2 className="animate-spin w-4 h-4 mr-2" />
                          ) : (
                              <Wand2 className="w-4 h-4 mr-2" />
                          )}{" "}
                          Generate
                      </Button>
                  </TabsContent>

                  {/* AI Response & Output Section */}
                  <div className="flex-1 min-h-[400px] flex flex-col border border-border rounded-lg overflow-hidden bg-background shadow-sm">
                      {/* Toolbar */}
                      <div className="flex items-center justify-between p-2 bg-muted/30 border-b border-border">
                          <span className="text-xs font-semibold text-muted-foreground">
                              OUTPUT
                          </span>

                          {/* Copy button */}
                          {aiResponse && (
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={copyCodeOnly}
                              >
                                  {copied ? (
                                      <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                      <Copy className="w-4 h-4" />
                                  )}
                              </Button>
                          )}
                      </div>

                      {/* Output Area */}
                      <ScrollArea className="flex-1 p-4 text-sm font-mono bg-gray-900 text-gray-100">
                          {/* Terminal Output */}
                          {output && (
                              <div className="mb-4 p-3 rounded-md bg-gray-800 border border-gray-700">
                                  <div className="text-[10px] uppercase text-gray-400 mb-1">
                                      Terminal
                                  </div>
                                  <pre className="whitespace-pre-wrap">
                                      {output}
                                  </pre>
                              </div>
                          )}
                          {/* AI Response */}
                         
                          {aiResponse && (
                              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                  {/* Avatar / Header (Optional) */}
                                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                                      <Wand2 className="w-3 h-3" /> AI Assistant
                                  </div>

                                  {/* MAIN CONTENT BOX */}
                                  <div className="w-full bg-[#1e1e1e]/50 border border-slate-800 rounded-xl p-6 shadow-xl overflow-hidden">
                                      <ReactMarkdown
                                          components={{
                                              // 1. HEADINGS
                                              h1: ({ node, ...props }) => (
                                                  <h1
                                                      className="text-2xl font-bold text-slate-100 mb-4 pb-2 border-b border-slate-700"
                                                      {...props}
                                                  />
                                              ),
                                              h2: ({ node, ...props }) => (
                                                  <h2
                                                      className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2"
                                                      {...props}
                                                  />
                                              ),
                                              h3: ({ node, ...props }) => (
                                                  <h3
                                                      className="text-lg font-medium text-blue-300 mt-4 mb-2"
                                                      {...props}
                                                  />
                                              ),

                                              // 2. PARAGRAPHS & LISTS
                                              p: ({ node, ...props }) => (
                                                  <p
                                                      className="text-slate-300 leading-7 mb-4 text-[15px]"
                                                      {...props}
                                                  />
                                              ),
                                              ul: ({ node, ...props }) => (
                                                  <ul
                                                      className="list-disc list-outside ml-6 mb-4 text-slate-300 space-y-1"
                                                      {...props}
                                                  />
                                              ),
                                              li: ({ node, ...props }) => (
                                                  <li
                                                      className="pl-1 marker:text-blue-500"
                                                      {...props}
                                                  />
                                              ),

                                              // 3. INLINE CODE (e.g. `const`)
                                              code: ({
                                                  node,
                                                  inline,
                                                  className,
                                                  children,
                                                  ...props
                                              }: any) => {
                                                  const match =
                                                      /language-(\w+)/.exec(
                                                          className || ""
                                                      );
                                                  const language = match
                                                      ? match[1]
                                                      : null;

                                                  return !inline && language ? (
                                                      // BLOCK CODE (The "Real" Code Box)
                                                      <div className="my-6 rounded-lg overflow-hidden border border-slate-700 shadow-md">
                                                          {/* Code Header Bar */}
                                                          <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-slate-700">
                                                              <span className="text-xs font-mono text-slate-400 lowercase">
                                                                  {language}
                                                              </span>
                                                              <button
                                                                  onClick={() =>
                                                                      navigator.clipboard.writeText(
                                                                          String(
                                                                              children
                                                                          )
                                                                      )
                                                                  }
                                                                  className="text-[10px] text-slate-400 hover:text-white transition-colors uppercase tracking-wider font-semibold"
                                                              >
                                                                  Copy
                                                              </button>
                                                          </div>
                                                          {/* Syntax Highlighter */}
                                                          <SyntaxHighlighter
                                                              style={
                                                                  vscDarkPlus
                                                              }
                                                              language={
                                                                  language
                                                              }
                                                              PreTag="div"
                                                              customStyle={{
                                                                  margin: 0,
                                                                  padding:
                                                                      "1.5rem",
                                                                  background:
                                                                      "#1e1e1e",
                                                                  fontSize:
                                                                      "0.9rem",
                                                              }}
                                                              {...props}
                                                          >
                                                              {String(
                                                                  children
                                                              ).replace(
                                                                  /\n$/,
                                                                  ""
                                                              )}
                                                          </SyntaxHighlighter>
                                                      </div>
                                                  ) : (
                                                      // INLINE CODE
                                                      <code
                                                          className="bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded font-mono text-sm border border-blue-500/20"
                                                          {...props}
                                                      >
                                                          {children}
                                                      </code>
                                                  );
                                              },
                                          }}
                                      >
                                          {aiResponse}
                                      </ReactMarkdown>
                                  </div>
                              </div>
                          )}
                          {/* Placeholder when no output */}
                          {!output && !aiResponse && (
                              <div className="text-muted-foreground text-xs italic opacity-50 text-center mt-12">
                                  Output will appear here...
                              </div>
                          )}
                      </ScrollArea>
                  </div>
              </div>
          </Tabs>
      </div>
  );
};
