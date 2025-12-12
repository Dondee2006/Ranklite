import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SettingsContent } from "./components/settings-content";

export default function GeneralSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
