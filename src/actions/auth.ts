"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function signInWithGoogle(): Promise<void> {
  await signIn("google");
}

export async function signInWithGitHub(): Promise<void> {
  await signIn("github");
}

export async function signOutUser(): Promise<void> {
  await signOut();
}

export async function disconnectGitHub(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.account.deleteMany({
    where: { userId: session.user.id, provider: "github" },
  });
  revalidatePath("/integrations");
}

export async function disconnectGoogle(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.account.deleteMany({
    where: { userId: session.user.id, provider: "google" },
  });
  revalidatePath("/integrations");
}
