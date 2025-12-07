import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, Project, PROJECT_STATUS, THEATRES, PRODUCTS, DEFAULT_PROJECT } from "@/lib/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, FileJson } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SubmitPage() {
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const form = useForm<Project>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      ...DEFAULT_PROJECT,
      name: "",
      description: "",
      link: "",
      repo: "",
      author: "",
      usecase: "",
      media: {
        type: "image",
        url: "",
        alt: ""
      }
    }
  });

  const onSubmit = (data: Project) => {
    // Clean up empty optional fields
    const cleanData = { ...data };
    if (!cleanData.media?.url) delete cleanData.media;
    if (!cleanData.repo) delete cleanData.repo;
    
    const json = JSON.stringify(cleanData, null, 2);
    setJsonOutput(json);
    toast({
      title: "JSON Generated",
      description: "Copy the JSON below and submit a PR to the repository.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
    });
  };

  const downloadJson = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded project.json",
      description: "Now upload this file to the GitHub repository.",
    });
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-wider mb-2">Submit Project</h1>
          <p className="text-muted-foreground mb-4">
            Generate a project definition file to contribute to the showcase.
          </p>
          
          <div className="bg-muted/30 border border-border rounded-md p-4 text-sm space-y-4 mb-6">
            <div>
              <h3 className="font-bold text-primary uppercase tracking-wider text-xs mb-2">How it works</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-1">
                <li>Fill out the form to generate your project metadata</li>
                <li>Download the <code className="text-primary">project.json</code> file</li>
                <li>Create a Pull Request in the repository</li>
                <li>Once merged, the site automatically rebuilds and deploys</li>
              </ol>
            </div>

            <div className="bg-black/50 p-3 rounded border border-border/50 text-xs text-muted-foreground font-mono">
              <p className="mb-2 text-primary font-bold">GITHUB WEB UI TRICK:</p>
              <p>When adding a file on GitHub, you can create folders by typing:</p>
              <p className="mt-2 text-white">projects/my-name/my-project/project.json</p>
              <p className="mt-1 italic opacity-70">Typing the slashes (/) will automatically create the folders for you.</p>
            </div>
          </div>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. XDRTop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name or Team" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theatre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theatre</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theatre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {THEATRES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your project..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROJECT_STATUS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Language</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Python" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Link (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usecase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Use Case (Tag)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Automation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                   <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">GitHub Integration</h3>
                   
                   <FormField
                    control={form.control}
                    name="githubApi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Fetch Live Data</FormLabel>
                          <FormDescription>
                            Get latest release & languages from GitHub API
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("githubApi") && (
                    <FormField
                      control={form.control}
                      name="repo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repository (owner/repo)</FormLabel>
                          <FormControl>
                            <Input placeholder="gocortexio/xdrtop" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                   <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Media (Optional)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="media.type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val);
                                // Auto-fill URL for local image
                                if (val === "image" && form.getValues("media.url") === "") {
                                   // We don't auto-fill here to avoid confusion if they paste a URL
                                }
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="image">Image (URL or Local)</SelectItem>
                                <SelectItem value="youtube">YouTube Video ID</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="media.url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL / ID / Path</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input placeholder={form.watch("media.type") === "youtube" ? "dQw4w9WgXcQ" : "https://... or ./thumbnail.png"} {...field} />
                                {form.watch("media.type") === "image" && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => form.setValue("media.url", "./thumbnail.png")}
                                    className="whitespace-nowrap font-mono text-xs"
                                  >
                                    Use Local
                                  </Button>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-[10px]">
                              For local files, use <code>./thumbnail.png</code> and upload the file with your PR.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                   </div>
                   <FormField
                        control={form.control}
                        name="media.alt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alt Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Description for accessibility" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                </div>

                <Button type="submit" size="lg" className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
                  Generate JSON Payload
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-display font-bold uppercase tracking-wider mb-2">JSON Output</h2>
          <p className="text-muted-foreground text-sm">
            This is the file content you need to submit.
          </p>
        </div>

        <div className="relative group">
          <div className={cn(
            "absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200",
            !jsonOutput && "hidden"
          )}></div>
          <div className="relative bg-black border border-border rounded-lg min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileJson className="w-4 h-4" />
                <span className="text-xs font-mono">project.json</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-2 hover:bg-primary/20 hover:text-primary"
                onClick={copyToClipboard}
                disabled={!jsonOutput}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 text-xs gap-2 bg-primary text-black hover:bg-primary/90 font-bold"
                onClick={downloadJson}
                disabled={!jsonOutput}
              >
                <FileJson className="w-3 h-3" />
                Download File
              </Button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto custom-scrollbar">
              {jsonOutput ? (
                <pre className="text-green-400 whitespace-pre-wrap break-all">
                  {jsonOutput}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-4">
                  <FileJson className="w-16 h-16 opacity-20" />
                  <p>Fill in the form to generate JSON</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
