import { z } from "zod";

export const CONTACT_TOPICS = [
  { value: "bug", label: "Report a problem with a tool" },
  { value: "feature", label: "Suggest a tool or feature" },
  { value: "privacy", label: "Privacy or data question" },
  { value: "business", label: "Business or partnership" },
  { value: "other", label: "Something else" },
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  topic: z.enum(["bug", "feature", "privacy", "business", "other"]),
  message: z.string().trim().min(10, "Please write at least a sentence (10 characters).").max(5000, "Please keep your message under 5,000 characters."),
  tool: z.string().trim().max(80).regex(/^[a-z0-9-]*$/).optional().or(z.literal("")),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
  /** ms timestamp when the form was rendered. */
  startedAt: z.number().int().positive(),
  turnstileToken: z.string().max(4096).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
