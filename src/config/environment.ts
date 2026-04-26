import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_E2E_TEST: z.enum(["false", "true"]).default("false"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
});

type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;

let cachedPublicEnvironment: PublicEnvironment | undefined;

const formatEnvironmentIssues = (
  issues: Array<{ message: string; path: PropertyKey[] }>,
) =>
  issues
    .map((issue) => {
      const path = issue.path.join(".") || "env";
      return `${path}: ${issue.message}`;
    })
    .join("; ");

export const getPublicEnvironment = (): PublicEnvironment => {
  if (cachedPublicEnvironment) {
    return cachedPublicEnvironment;
  }

  const parsed = publicEnvironmentSchema.safeParse({
    NEXT_PUBLIC_E2E_TEST: process.env.NEXT_PUBLIC_E2E_TEST,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables: ${formatEnvironmentIssues(parsed.error.issues)}`,
    );
  }

  cachedPublicEnvironment = parsed.data;
  return cachedPublicEnvironment;
};

export const isE2ETestRun = () =>
  getPublicEnvironment().NEXT_PUBLIC_E2E_TEST === "true";
