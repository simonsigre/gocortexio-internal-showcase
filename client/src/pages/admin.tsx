import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, FileJson, Merge, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [currentJson, setCurrentJson] = useState("");
  const [newProjectJson, setNewProjectJson] = useState("");
  const [mergedOutput, setMergedOutput] = useState("");

  const mergeData = () => {
    try {
      if (!currentJson.trim() || !newProjectJson.trim()) {
        toast({
          title: "Missing Input",
          description: "Please provide both the current projects list and the new project JSON.",
          variant: "destructive"
        });
        return;
      }

      let currentData;
      try {
        currentData = JSON.parse(currentJson);
        if (!Array.isArray(currentData)) {
           // Maybe they pasted the whole state object or something else, try to be flexible
           throw new Error("Base JSON must be an array of projects");
        }
      } catch (e) {
        toast({ title: "Invalid Base JSON", description: "The current projects list is not valid JSON.", variant: "destructive" });
        return;
      }

      let newData;
      try {
        newData = JSON.parse(newProjectJson);
      } catch (e) {
        toast({ title: "Invalid New Project JSON", description: "The new project data is not valid JSON.", variant: "destructive" });
        return;
      }

      // Merge logic: Prepend new project to the list
      const merged = [newData, ...currentData];
      
      setMergedOutput(JSON.stringify(merged, null, 2));
      toast({
        title: "Merge Successful",
        description: `Added "${newData.name}" to the project list.`,
      });

    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mergedOutput);
    toast({ title: "Copied to clipboard" });
  };

  const downloadFile = () => {
    const blob = new Blob([mergedOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-wider mb-2">Admin Tools</h1>
        <p className="text-muted-foreground">
          Manually merge new project submissions into the master project list. 
          No server or build steps required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">1. Current Data</CardTitle>
            <CardDescription>Paste the content of your existing <code>projects.json</code> file here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="[ { ... }, { ... } ]" 
              className="font-mono text-xs h-[300px]"
              value={currentJson}
              onChange={(e) => setCurrentJson(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
             <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">2. New Submission</CardTitle>
             <CardDescription>Paste the JSON payload from the "Submit Project" form here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder='{ "name": "New Project", ... }' 
              className="font-mono text-xs h-[300px]"
              value={newProjectJson}
              onChange={(e) => setNewProjectJson(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={mergeData} className="w-full md:w-auto min-w-[200px] bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider gap-2">
          <Merge className="w-4 h-4" /> Merge Data
        </Button>
      </div>

      {mergedOutput && (
        <Card className="border-primary/50 bg-black/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-primary font-bold uppercase tracking-wider flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Updated Database
              </CardTitle>
              <CardDescription>
                Replace the content of your <code>projects.json</code> with this code.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                <Copy className="w-4 h-4" /> Copy
              </Button>
              <Button variant="default" size="sm" onClick={downloadFile} className="gap-2 bg-white text-black hover:bg-white/90">
                <Download className="w-4 h-4" /> Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-md border border-border bg-muted/20 p-4">
              <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap h-[400px] overflow-auto custom-scrollbar">
                {mergedOutput}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
