import { SignUp } from "@clerk/nextjs";
import { Building2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Building2 className="h-4 w-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">PropDesk</span>
      </div>
      <SignUp />
      <p className="mt-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} PropDesk. All rights reserved.
      </p>
    </div>
  );
}
