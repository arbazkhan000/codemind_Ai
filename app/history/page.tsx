"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { BookOpen, Bug, Code2, Loader2, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { Header } from "@/components/Header";

// ⚠️ CRITICAL FOR BUILD: Prevents "Export encountered an error"
export const dynamic = "force-dynamic";

interface HistoryItem {
    id: string;
    code: string;
    language: string;
    action_type: "debug" | "explain" | "generate";
    user_prompt: string | null;
    ai_response: string;
    created_at: string;
}

const actionIcons = {
    debug: Bug,
    explain: BookOpen,
    generate: Wand2,
};

const actionColors = {
    debug: "bg-destructive/20 text-destructive",
    explain: "bg-primary/20 text-primary",
    generate: "bg-accent/20 text-accent",
};

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // --- 1. FETCH HISTORY FROM SUPABASE ---
    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from("history")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Map DB columns to UI Interface
            const formattedData: HistoryItem[] = (data || []).map(
                (item: any) => ({
                    id: item.id,
                    code: item.mode === "generate" ? "" : item.prompt,
                    user_prompt: item.mode === "generate" ? item.prompt : null,
                    language: item.language || "text",
                    action_type: item.mode,
                    ai_response: item.code_output,
                    created_at: item.created_at,
                }),
            );

            setHistory(formattedData);
        } catch (error: any) {
            console.error("Fetch error:", error);
            toast({
                title: "Failed to load history",
                description: error.message || "Please refresh the page.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Run on page load
    useEffect(() => {
        fetchHistory();
    }, []);

    // --- 2. DELETE ITEM LOGIC ---
    const deleteItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the modal when clicking delete

        try {
            const { error } = await supabase
                .from("history")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Update UI immediately
            setHistory((prev) => prev.filter((item) => item.id !== id));

            toast({ title: "Entry deleted successfully" });
        } catch (error) {
            toast({
                title: "Failed to delete",
                variant: "destructive",
            });
        }
    };

    const truncate = (text: string, len = 120) =>
        text && text.length > len ? text.slice(0, len) + "..." : text;

    return (
        <div className="h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 overflow-hidden p-6 bg-[#0a0a0a] text-foreground">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Code History</h1>
                            <p className="text-muted-foreground">
                                Your previous AI interactions
                            </p>
                        </div>

                        <Badge variant="outline" className="bg-secondary">
                            {history.length} entries
                        </Badge>
                    </div>

                    {/* LIST */}
                    <ScrollArea className="flex-1 pr-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                Loading history...
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-16">
                                <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="text-muted-foreground">
                                    No history yet. Start using the AI Editor!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((item) => {
                                    const Icon =
                                        actionIcons[item.action_type] || Code2;

                                    return (
                                        <Card
                                            key={item.id}
                                            className="hover:border-primary/50 transition cursor-pointer bg-card/50 border-border"
                                            onClick={() =>
                                                setSelectedItem(item)
                                            }
                                        >
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between">
                                                    <div className="flex gap-3">
                                                        <div
                                                            className={`p-2 rounded-lg h-fit ${
                                                                actionColors[
                                                                    item
                                                                        .action_type
                                                                ] ||
                                                                "bg-secondary text-secondary-foreground"
                                                            }`}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                        </div>

                                                        <div>
                                                            <CardTitle className="capitalize text-base">
                                                                {
                                                                    item.action_type
                                                                }
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                {format(
                                                                    new Date(
                                                                        item.created_at,
                                                                    ),
                                                                    "MMM d, yyyy • h:mm a",
                                                                )}
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 items-start">
                                                        <Badge variant="secondary">
                                                            {item.language.toUpperCase()}
                                                        </Badge>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={(e) =>
                                                                deleteItem(
                                                                    item.id,
                                                                    e,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs text-muted-foreground break-all">
                                                    {item.action_type ===
                                                    "generate"
                                                        ? truncate(
                                                              item.user_prompt ||
                                                                  "",
                                                          )
                                                        : truncate(
                                                              item.code || "",
                                                          )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </main>

            {/* MODAL */}
            <Dialog
                open={!!selectedItem}
                onOpenChange={() => setSelectedItem(null)}
            >
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-[#1e1e1e] border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedItem && (
                                <>
                                    <span className="capitalize">
                                        {selectedItem.action_type}
                                    </span>
                                    <Badge variant="secondary">
                                        {selectedItem.language.toUpperCase()}
                                    </Badge>
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4">
                        {selectedItem && (
                            <div className="space-y-6 p-1">
                                {/* PROMPT / CODE SECTION */}
                                {selectedItem.action_type === "generate" ? (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                            Your Prompt
                                        </h4>
                                        <div className="bg-black/30 p-4 rounded-lg border border-border text-sm">
                                            {selectedItem.user_prompt}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                            Source Code
                                        </h4>
                                        <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm border border-border font-mono text-blue-300">
                                            {selectedItem.code}
                                        </pre>
                                    </div>
                                )}

                                {/* AI RESPONSE SECTION */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                        AI Response
                                    </h4>
                                    <div className="ai-response prose prose-invert prose-sm max-w-none bg-black/30 rounded-lg p-4 border border-border">
                                        <ReactMarkdown>
                                            {selectedItem.ai_response}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
