"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import { PanelGroup, Panel, ResizeHandle } from "react-resizable-panels";

import { cn } from "@/lib/utils";

export function ResizablePanelGroup({
    className,
    ...props
}: React.ComponentProps<typeof PanelGroup>) {
    return (
        <PanelGroup
            className={cn(
                "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
                className
            )}
            {...props}
        />
    );
}

export function ResizablePanel(props: React.ComponentProps<typeof Panel>) {
    return <Panel {...props} />;
}

export function ResizableHandle({
    withHandle,
    className,
    ...props
}: React.ComponentProps<typeof ResizeHandle> & {
    withHandle?: boolean;
}) {
    return (
        <ResizeHandle
            className={cn(
                "relative flex w-px items-center justify-center bg-border",
                className
            )}
            {...props}
        >
            {withHandle && (
                <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border">
                    <GripVerticalIcon className="h-3 w-3" />
                </div>
            )}
        </ResizeHandle>
    );
}
