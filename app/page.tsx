// "use client";

// import { useRef, useState } from "react";
// import { Header } from "@/components/Header";
// import { CodeEditor } from "@/components/CodeEditor";
// import { AiPanel } from "@/components/AiPanel";
// import { UserButton } from "@clerk/nextjs";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// const defaultCode = `// Welcome to CodeMind AI!
// // Enter your code here and use the AI assistant to:
// // - Debug your code
// // - Get explanations
// // - Generate new code

// function greet(name) {
//   console.log("Hello, " + name);
// }

// greet("World");
// `;

// export default function Home() {
//      const [language, setLanguage] = useState("javascript");
//      const [code, setCode] = useState(defaultCode);
//     const containerRef = useRef<HTMLDivElement>(null);
//     const [leftWidth, setLeftWidth] = useState(55);

//     // const { userId } = auth();
//     // // console.log("User ID:", userId);
//     //  if (!userId) {
//     //      redirect("/sign-in");
//     //  }

//     const startResize = (e: React.MouseEvent) => {
//         e.preventDefault();
//         const startX = e.clientX;
//         const startWidth = leftWidth;

//         const onMouseMove = (moveEvent: MouseEvent) => {
//             if (!containerRef.current) return;
//             const delta = moveEvent.clientX - startX;
//             const containerWidth = containerRef.current.offsetWidth;
//             const newWidth =
//                 (((startWidth / 100) * containerWidth + delta) /
//                     containerWidth) *
//                 100;

//             setLeftWidth(Math.min(75, Math.max(25, newWidth)));
//         };

//         const onMouseUp = () => {
//             document.removeEventListener("mousemove", onMouseMove);
//             document.removeEventListener("mouseup", onMouseUp);
//         };

//         document.addEventListener("mousemove", onMouseMove);
//         document.addEventListener("mouseup", onMouseUp);
//     };

//     return (

//         <div className="h-screen flex flex-col bg-background">
//             <Header />

//             {/* ===== MOBILE (STACKED) ===== */}
//             <div className="flex flex-col flex-1 md:hidden overflow-auto">
//                 <div className="min-h-[50vh] border-b border-border">
//                     <CodeEditor
//                         code={code}
//                         setCode={setCode}
//                         language={language}
//                         setLanguage={setLanguage}
//                     />
//                 </div>
//                 <div className="min-h-[100vh]">
//                     <AiPanel code={code} language={language} />
//                 </div>
//             </div>

//             {/* 2. CLERK USER BUTTON (Avatar + Logout) */}

//             {/* ===== DESKTOP / TABLET (RESIZABLE) ===== */}
//             <div
//                 ref={containerRef}
//                 className="hidden md:flex flex-1 overflow-hidden"
//             >
//                 {/* LEFT */}
//                 <div style={{ width: `${leftWidth}%` }} className="h-full">
//                     <CodeEditor
//                         code={code}
//                         setCode={setCode}
//                         language={language}
//                         setLanguage={setLanguage}
//                     />
//                 </div>

//                 {/* RESIZE HANDLE */}
//                 <div
//                     onMouseDown={startResize}
//                     className="w-1 cursor-col-resize bg-border hover:bg-primary transition-colors"
//                 />

//                 {/* RIGHT */}
//                 <div
//                     style={{ width: `${100 - leftWidth}%` }}
//                     className="h-full"
//                 >
//                     <AiPanel code={code} language={language} />
//                 </div>
//             </div>
//         </div>
//     );
// }

import HomePage from "./HomePage";

export default function Page() {
    return <HomePage />;
}
