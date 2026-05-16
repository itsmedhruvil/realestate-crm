"use client";

import { ClerkProvider } from "@clerk/nextjs";

const clerkAppearance = {
  __internal: {
    isIntercom: false,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/signin"
      signUpUrl="/register"
    >
      {children}
    </ClerkProvider>
  );
}
