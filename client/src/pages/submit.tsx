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

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-wider mb-2">Submit Project</h1>
          <p className="text-muted-foreground">
            Fill out the details below to generate the JSON payload for your project.
            Once generated, create a new file in the <code className="bg-muted px-1 py-0.5 rounded text-primary">projects/</code> directory of the repo.
          </p>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="image">Image URL</SelectItem>
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
                            <FormLabel>URL / ID</FormLabel>
                            <FormControl>
                              <Input placeholder={form.watch("media.type") === "youtube" ? "dQw4w9WgXcQ" : "https://example.com/image.png"} {...field} />
                            </FormControl>
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
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto custom-scrollbar">
              {jsonOutput ? (
                <pre className="text-green-400 whitespace-pre-wrap break-all">
                  {jsonOutput}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-4">
                  <FileJson className="w-16 h-16 opacity-20" />
                  <p>Fill out the form to generate JSON</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
