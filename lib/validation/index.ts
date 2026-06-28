import { z } from "zod";

export { z };

export type ValidationErrors = Record<string, string>;

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: ValidationErrors;
    };

function formatZodErrors(error: z.ZodError): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0] ? String(issue.path[0]) : "body";
    errors[field] ??= issue.message;
  }

  return errors;
}

export function validateSchema<T>(
  schema: z.ZodType<T>,
  input: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(1, "New password is required"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export function validateChangePasswordInput(
  input: unknown,
): ValidationResult<ChangePasswordInput> {
  return validateSchema(changePasswordSchema, input);
}
