import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, Project, PROJECT_STATUS, THEATRES, PRODUCTS, DEFAULT_PROJECT } from "@/lib/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Check, FileJson, Github, Download, FileText, FileCode, BookOpen, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SubmitPage() {
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    setIsDialogOpen(true);
    toast({
      title: "JSON Generated",
      description: "Review your project submission below.",
    });
  };

  const onError = (errors: any) => {
    const missingFields = Object.keys(errors);
    toast({
      variant: "destructive",
      title: "Missing Required Fields",
      description: `Please fill in: ${missingFields.join(", ")}`,
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

  const openIssue = () => {
    // This would be the actual repo URL in production
    const repoUrl = "https://github.com/organization/repo";
    const title = encodeURIComponent(`Project Submission: ${form.getValues("name")}`);
    const body = encodeURIComponent(`Please add my project. JSON Payload:\n\n\`\`\`json\n${jsonOutput}\n\`\`\``);
    window.open(`${repoUrl}/issues/new?title=${title}&body=${body}&labels=submission`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold uppercase tracking-wider mb-2">Submit Project</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create a project submission for the showcase.
        </p>
      </div>

      {/* Documentation Standards Card */}
      <Card className="border-primary/30 bg-card/50">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <FileText className="w-5 h-5" />
            📋 Documentation Standards
          </CardTitle>
          <CardDescription>
            Required markdown files in your repository for complete project detail pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-500" />
                Required Files
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start gap-2 p-2 rounded bg-accent/20">
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">README.md</code>
                  <span className="text-muted-foreground">Project overview, installation, usage</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-accent/20">
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">INSTALL.md</code>
                  <span className="text-muted-foreground">Setup and deployment instructions</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-accent/20">
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">API.md</code>
                  <span className="text-muted-foreground">API documentation and endpoints</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-500" />
                Optional Files
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start gap-2 p-2 rounded bg-accent/20">
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">DEPLOYMENT.md</code>
                  <span className="text-muted-foreground">Production deployment guide</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-accent/20">
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">TROUBLESHOOTING.md</code>
                  <span className="text-muted-foreground">Common issues and solutions</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-accent/20">
                  <code className="text-xs bg-black/30 px-2 py-1 rounded">CHANGELOG.md</code>
                  <span className="text-muted-foreground">Version history and updates</span>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="w-4 h-4 text-blue-500" />
            <AlertTitle className="text-blue-500">Auto-Population</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              These markdown files will automatically populate the corresponding tabs in your project detail page.
              The AI will extract sections to fill Installation, Usage, API, Deployment, and Troubleshooting tabs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Project Submission Form */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
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
                    <FormItem className="col-span-1">
                      <FormLabel>Author <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Name/Team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white text-black">
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
                    <FormItem className="col-span-1">
                      <FormLabel>Theatre</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white text-black">
                          {THEATRES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white text-black">
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
                    <FormItem className="col-span-1">
                      <FormLabel>Language <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Python" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Link (URL) <span className="text-red-500">*</span></FormLabel>
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
                    <FormItem className="col-span-1">
                      <FormLabel>Use Case</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Automation" {...field} />
                      </FormControl>
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
                    <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project (min 10 chars)..."
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4 bg-muted/20">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">GitHub API</h3>
                  <div className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="githubApi"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-xs">Fetch Live Data</FormLabel>
                        </FormItem>
                      )}
                    />

                    {form.watch("githubApi") && (
                      <FormField
                        control={form.control}
                        name="repo"
                        render={({ field }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormControl>
                              <Input className="h-8 text-xs" placeholder="owner/repo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/20">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Media (Optional)</h3>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="media.type"
                      render={({ field }) => (
                        <FormItem className="w-24 space-y-0">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white text-black">
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="youtube">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="media.url"
                      render={({ field }) => (
                        <FormItem className="flex-1 space-y-0">
                          <FormControl>
                            <Input className="h-8 text-xs" placeholder="URL or ./thumb.png" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
                Generate JSON Payload
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Project JSON Generated</DialogTitle>
            <DialogDescription>
              Review the generated JSON payload below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-[300px] border border-border rounded-lg bg-white overflow-hidden flex flex-col">
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
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto custom-scrollbar">
              <pre className="text-black whitespace-pre-wrap break-all">
                {jsonOutput}
              </pre>
            </div>
          </div>

          <DialogFooter className="sm:justify-between gap-4 mt-4">
            <div className="text-xs text-muted-foreground flex items-center">
              1. Copy JSON &nbsp;&rarr;&nbsp; 2. Click Submit Issue &nbsp;&rarr;&nbsp; 3. Paste into GitHub Issue
            </div>
            <Button
              variant="default"
              className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider"
              onClick={openIssue}
            >
              <Github className="w-4 h-4 mr-2" />
              Submit to GitHub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
