"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const SignInPage = () => {
  const signInByGithub = async () => {
    const data = await authClient.signIn.social({
      provider: "github",
    });
    console.log(data);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Button onClick={signInByGithub}>SignInGithub</Button>
    </div>
  );
};

export default SignInPage;
