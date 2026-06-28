import { validateSchema, z, type ValidationResult } from "@/lib/validation";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

const emailSchema = z.email("Please enter a valid email address.");

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export function validateRegisterInput(
  input: unknown,
): ValidationResult<RegisterInput> {
  return validateSchema(registerSchema, input);
}

export function validateLoginInput(input: unknown): ValidationResult<LoginInput> {
  return validateSchema(loginSchema, input);
}
