"use server";
import { auth } from "@/lib/auth";

export const signInBy = async () => {
  await auth.api.signInEmail({
    body: {
      email: "user@email.com",
      password: "password",
    },
  });
};
