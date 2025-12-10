import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SubmitPage from "@/pages/submit";
import AdminPage from "@/pages/admin";
import ArsenalPage from "@/pages/arsenal";
import ProjectDetail from "@/pages/project-detail";
import MyProjects from "@/pages/my-projects";
import Announcements from "@/pages/announcements";
import AnnouncementDetail from "@/pages/announcement-detail";
import { Layout } from "@/components/layout";
import { LoginPage, ForbiddenPage } from "@/components/protected-route";

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/submit" component={SubmitPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/arsenal" component={ArsenalPage} />
        <Route path="/project/:id" component={ProjectDetail} />
        <Route path="/my-projects" component={MyProjects} />
        <Route path="/announcements" component={Announcements} />
        <Route path="/announcement/:id" component={AnnouncementDetail} />
        <Route path="/login" component={LoginPage} />
        <Route path="/403" component={ForbiddenPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WouterRouter hook={useHashLocation}>
          <AppRouter />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
