import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "يرجى إدخال البريد الإلكتروني أو رقم الهاتف"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type ChangePasswordCredentials = z.infer<typeof changePasswordSchema>;

