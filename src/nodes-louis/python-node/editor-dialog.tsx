"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import Editor from "@monaco-editor/react";
import { Terminal } from "lucide-react";

interface PythonEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialCode?: string;
    onSave: (code: string) => void;
    nodeName?: string;
}

export function PythonEditorDialog({
    open,
    onOpenChange,
    initialCode = "",
    onSave,
    nodeName = "Python Node",
}: PythonEditorDialogProps) {
    const [code, setCode] = useState(initialCode);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setCode(initialCode);
        setHasChanges(false);
    }, [initialCode, open]);

    const handleSave = () => {
        onSave(code);
        setHasChanges(false);
        onOpenChange(false);
    };

    const handleCancel = () => {
        if (hasChanges) {
            const confirmDiscard = confirm("You have unsaved changes. Are you sure you want to discard them?");
            if (!confirmDiscard) return;
        }
        setCode(initialCode);
        setHasChanges(false);
        onOpenChange(false);
    };

    const handleCodeChange = (value: string | undefined) => {
        const newCode = value || "";
        setCode(newCode);
        setHasChanges(newCode !== initialCode);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        Python Editor - {nodeName}
                    </DialogTitle>
                    <DialogDescription>
                        Write your Python code for IFC processing. You'll have access to the `ifc_file` object and input data.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-[400px] border rounded-md overflow-hidden">
                    <Editor
                        height="400px"
                        defaultLanguage="python"
                        value={code}
                        onChange={handleCodeChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            tabSize: 4,
                            insertSpaces: true,
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            folding: true,
                            lineNumbers: "on",
                            renderLineHighlight: "line",
                            selectOnLineNumbers: true,
                            cursorBlinking: "blink",
                            contextmenu: true,
                        }}
                    />
                </div>

                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <strong>Available variables:</strong>
                    <ul className="mt-1 space-y-1">
                        <li>• <code>ifc_file</code> - The loaded IFC file object</li>
                        <li>• <code>input_data</code> - Data from the input connection (if any)</li>
                        <li>• <code>properties</code> - Node properties</li>
                    </ul>
                    <p className="mt-2">
                        <strong>Return:</strong> Use <code>result = your_data</code> to pass data to the output connection.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges}>
                        {hasChanges ? "Save Changes" : "Saved"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 