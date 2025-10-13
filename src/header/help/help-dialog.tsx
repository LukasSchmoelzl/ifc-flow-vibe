"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/shared/components/ui/tabs";
import { Button } from "@/src/shared/components/ui/button";
import {
  formatKeyCombination,
  useKeyboardShortcuts,
} from "@/src/shared/lib/keyboard-shortcuts";
import { parseTutorialStep } from "@/src/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { ScrollArea } from "@/src/shared/components/ui/scroll-area";
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
} from "lucide-react";
import { Input } from "@/src/shared/components/ui/input";
import { Badge } from "@/src/shared/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/shared/components/ui/accordion";
import { nodeCategories } from "./node-documentation";
import { tutorialSteps } from "./tutorial-steps";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  id: string;
  name: string;
  keys: string;
  category: string;
}

type ShortcutsByCategory = Record<string, Shortcut[]>;

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [activeTab, setActiveTab] = useState("nodes");
  const [searchQuery, setSearchQuery] = useState("");
  const [nodeSearchQuery, setNodeSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { shortcuts } = useKeyboardShortcuts();
  const dialogRef = useRef<HTMLDivElement>(null);

  const shortcutsByCategory = (
    shortcuts as Shortcut[]
  ).reduce<ShortcutsByCategory>((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {});

  const filteredShortcuts = searchQuery
    ? shortcuts.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keys.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : null;

  const handleCopyShortcut = (id: string, keys: string) => {
    navigator.clipboard.writeText(keys);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (dialogRef.current) {
      const focusableElement = dialogRef.current.querySelector(
        '[tabindex="0"]'
      ) as HTMLElement;
      if (focusableElement) focusableElement.focus();
    }
  }, [activeTab]);

  const filteredNodeCategories = nodeSearchQuery
    ? nodeCategories.map(category => ({
      ...category,
      nodes: category.nodes.filter(node =>
        node.name.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        node.usage.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
        node.tips.some(tip => tip.toLowerCase().includes(nodeSearchQuery.toLowerCase()))
      )
    })).filter(category => category.nodes.length > 0)
    : nodeCategories;

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
                value="nodes"
                data-tab="nodes"
                className="flex items-center gap-1"
              >
                <Layers className="h-4 w-4" />
                Nodes
              </TabsTrigger>
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

            {(activeTab === "shortcuts" || activeTab === "nodes") && (
              <div className="flex gap-2">
                <div className="relative w-[200px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "shortcuts" ? "Search shortcuts..." : "Search nodes..."}
                    className="pl-8"
                    value={activeTab === "shortcuts" ? searchQuery : nodeSearchQuery}
                    onChange={(e) => activeTab === "shortcuts"
                      ? setSearchQuery(e.target.value)
                      : setNodeSearchQuery(e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <TabsContent
            value="nodes"
            className="flex-1 overflow-auto mt-0 border rounded-md p-4"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  {nodeSearchQuery ? `Search Results for "${nodeSearchQuery}"` : "Node Reference"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {nodeSearchQuery
                    ? `Found ${filteredNodeCategories.reduce((total, cat) => total + cat.nodes.length, 0)} matching nodes`
                    : "Complete guide to all available nodes and their usage patterns."
                  }
                </p>
              </div>

              {nodeSearchQuery && filteredNodeCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No nodes found matching "{nodeSearchQuery}"</p>
                  <p className="text-sm">Try different keywords or clear the search</p>
                </div>
              )}

              {filteredNodeCategories.map((category) => (
                <div key={category.name} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-primary">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>

                  <div className="grid gap-4">
                    {category.nodes.map((node) => (
                      <div key={node.name} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md">
                            {node.icon}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{node.name}</h5>
                            <p className="text-sm text-muted-foreground">{node.description}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Usage: </span>
                            <span className="text-sm">{node.usage}</span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-green-600">Inputs:</span>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {node.inputs.length > 0 ? (
                                  node.inputs.map((input, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      {input}
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-muted-foreground italic">None</li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <span className="text-sm font-medium text-blue-600">Outputs:</span>
                              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                {node.outputs.length > 0 ? (
                                  node.outputs.map((output, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                      {output}
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-muted-foreground italic">None (Terminal Node)</li>
                                )}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-amber-600">Tips:</span>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                              {node.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-500" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

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
