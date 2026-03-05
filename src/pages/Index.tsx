import { Activity } from "lucide-react";
import PatientGrid from "@/components/PatientGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Patient Manager</h1>
            <p className="text-xs text-muted-foreground">Clinical data management</p>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <PatientGrid />
      </main>
    </div>
  );
};

export default Index;
