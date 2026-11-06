"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const SignInPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const signInByGithub = async () => {
    setError(null);
    setPending(true);
    const { error: signInError } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });

    if (signInError) {
      setError(signInError.message || "GitHub sign-in failed");
      setPending(false);
    }
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-3">
      <h1 className="sr-only">Sign in</h1>
      <Button disabled={pending} onClick={signInByGithub}>
        {pending ? "Redirecting…" : "Sign in with GitHub"}
      </Button>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </main>
  );
};

export default SignInPage;
