"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  formatKeyCombination,
  useKeyboardShortcuts,
} from "@/lib/keyboard-shortcuts";
import { parseTutorialStep } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Info,
  Keyboard,
  Search,
  ArrowRight,
  Code,
  Layers,
  FileJson,
  Building,
  Copy,
  Check,
  Command,
} from "lucide-react";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define Shortcut type locally based on usage
interface Shortcut {
  id: string;
  name: string;
  keys: string;
  category: string;
}

// Define type for the accumulator in reduce
type ShortcutsByCategory = Record<string, Shortcut[]>;

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [activeTab, setActiveTab] = useState("shortcuts");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Explicitly type the shortcuts from the hook if possible, otherwise use the local Shortcut type
  const { shortcuts } = useKeyboardShortcuts();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Group shortcuts by category
  const shortcutsByCategory = (
    shortcuts as Shortcut[]
  ).reduce<ShortcutsByCategory>((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  // Filter shortcuts by search query
  const filteredShortcuts = searchQuery
    ? shortcuts.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keys.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : null;

  // Copy shortcut to clipboard
  const handleCopyShortcut = (id: string, keys: string) => {
    navigator.clipboard.writeText(keys);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset focus when tab changes
  useEffect(() => {
    if (dialogRef.current) {
      const focusableElement = dialogRef.current.querySelector(
        '[tabindex="0"]'
      ) as HTMLElement;
      if (focusableElement) focusableElement.focus();
    }
  }, [activeTab]);

  // Tutorial steps
  const tutorialSteps = [
    {
      id: "loading",
      title: "Loading an IFC File",
      icon: <Building className="h-5 w-5" />,
      description: "Start by loading an IFC model to work with.",
      steps: [
        'Click the "Open File" button in the top menu or use <kbd>Ctrl+O</kbd>',
        "Select an IFC file from your device",
        "Alternatively, drag and drop an IFC file directly onto the canvas",
      ],
    },
    {
      id: "workflow",
      title: "Creating a Workflow",
      icon: <Layers className="h-5 w-5" />,
      description:
        "Build your workflow by connecting nodes to process IFC data.",
      steps: [
        "Drag nodes from the sidebar onto the canvas",
        "Connect nodes by clicking and dragging from an output handle to an input handle",
        "Configure node properties by selecting a node and using the properties panel",
        'Run the workflow by clicking the "Run" button or pressing <kbd>F5</kbd>',
      ],
    },
    {
      id: "saving",
      title: "Saving and Loading Workflows",
      icon: <FileJson className="h-5 w-5" />,
      description: "Save your work for later use or sharing.",
      steps: [
        'Save your workflow to the library by clicking "Save to Library" in the File menu or using <kbd>Ctrl+S</kbd>',
        'Download your workflow as a JSON file using "Save Locally" or <kbd>Ctrl+Shift+S</kbd>',
        "Load a saved workflow from the workflow library using <kbd>Ctrl+L</kbd>",
      ],
    },
    {
      id: "navigating",
      title: "Navigating the Canvas",
      icon: <Command className="h-5 w-5" />,
      description: "Move around and organize your workflow.",
      steps: [
        "Zoom in and out using the mouse wheel or <kbd>Ctrl+=</kbd> and <kbd>Ctrl+-</kbd>",
        "Pan by holding the middle mouse button or Space+drag",
        "Select multiple nodes by holding Shift while clicking or dragging a selection box",
        "Fit all nodes in view with <kbd>Ctrl+0</kbd>",
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-background"
      >
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5 text-primary" />
            IFCflow Help
          </DialogTitle>
          <DialogDescription>
            Documentation and resources to help you use IFCflow
            effectively
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col mt-2"
        >
          <div className="flex justify-between items-center">
            <TabsList className="mb-2">
              <TabsTrigger
                value="shortcuts"
                data-tab="shortcuts"
                className="flex items-center gap-1"
              >
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </TabsTrigger>
              <TabsTrigger
                value="tutorial"
                data-tab="tutorial"
                className="flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" />
                Tutorial
              </TabsTrigger>
            </TabsList>

            {activeTab === "shortcuts" && (
              <div className="flex gap-2">
                <div className="relative w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shortcuts..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <TabsContent
            value="shortcuts"
            className="flex-1 overflow-hidden flex flex-col mt-0 border rounded-md"
            tabIndex={0}
          >


            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              {filteredShortcuts ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Search Results</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Shortcut</TableHead>
                        <TableHead className="w-[140px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShortcuts.map((shortcut) => (
                        <TableRow key={shortcut.id}>
                          <TableCell className="capitalize">
                            {shortcut.category}
                          </TableCell>
                          <TableCell>{shortcut.name}</TableCell>
                          <TableCell className="font-mono">
                            {formatKeyCombination(shortcut.keys)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleCopyShortcut(shortcut.id, shortcut.keys)
                                }
                                title="Copy shortcut"
                              >
                                {copiedId === shortcut.id ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                Object.entries(shortcutsByCategory).map(
                  ([category, categoryShortcuts]) => (
                    <div key={category} className="mb-8">
                      <h4 className="text-lg font-medium capitalize mb-3 flex items-center gap-2">
                        {category === "file" && (
                          <FileJson className="h-5 w-5 text-primary" />
                        )}
                        {category === "edit" && (
                          <Code className="h-5 w-5 text-primary" />
                        )}
                        {category === "view" && (
                          <Layers className="h-5 w-5 text-primary" />
                        )}
                        {category === "workflow" && (
                          <Building className="h-5 w-5 text-primary" />
                        )}
                        {category === "help" && (
                          <AlertCircle className="h-5 w-5 text-primary" />
                        )}
                        {category}
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Shortcut</TableHead>
                            <TableHead className="w-[140px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(categoryShortcuts as Shortcut[]).map(
                            (shortcut: Shortcut) => (
                              <TableRow key={shortcut.id}>
                                <TableCell>{shortcut.name}</TableCell>
                                <TableCell>
                                  <span className="font-mono">
                                    {formatKeyCombination(shortcut.keys)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleCopyShortcut(
                                          shortcut.id,
                                          shortcut.keys
                                        )
                                      }
                                      title="Copy shortcut"
                                    >
                                      {copiedId === shortcut.id ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )
                )
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="tutorial"
            className="flex-1 overflow-auto mt-0 border rounded-md p-4"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Getting Started with IFCflow
                </h3>
                <p className="text-muted-foreground mt-1">
                  Follow this step-by-step guide to learn how to use IFCflow
                  effectively.
                </p>
              </div>

              <Accordion type="single" collapsible className="mt-4 w-full">
                {tutorialSteps.map((section, index) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="border rounded-md mb-2"
                  >
                    <AccordionTrigger className="px-4 py-2 text-left text-lg">
                      <Badge variant="outline" className="mr-2 bg-primary/10">
                        {index + 1}
                      </Badge>
                      <span className="flex items-center gap-2">
                        {section.icon}
                        {section.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-muted-foreground mb-2">
                        {section.description}
                      </p>
                      <ol className="space-y-2 ml-6 list-decimal">
                        {section.steps.map((step, i) => (
                          <li key={i}>{parseTutorialStep(step)}</li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                <h4 className="text-lg font-medium flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Pro Tips
                </h4>
                <ul className="mt-2 space-y-2">
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      Use keyboard shortcuts to speed up your workflow. View
                      them in the Shortcuts tab or press <kbd>Shift+F1</kbd>.
                    </span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      Save your work regularly using <kbd>Ctrl+S</kbd> to avoid
                      losing progress.
                    </span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      Organize your nodes by grouping related functionality
                      together for better readability.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
