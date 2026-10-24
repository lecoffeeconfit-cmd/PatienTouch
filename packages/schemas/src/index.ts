import { z } from 'zod';

export const idSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const roleSchema = z.enum(['owner', 'administrator', 'clinician', 'billing', 'patient']);
export const emailSchema = z.email().max(254);
export const loginSchema = z
  .object({ email: emailSchema, password: z.string().min(1).max(256) })
  .strict();
export const registrationSchema = z
  .object({
    displayName: z.string().trim().min(1).max(120),
    email: emailSchema,
    password: z.string().min(12).max(256),
    acceptTerms: z.literal(true),
  })
  .strict();
export const passwordResetSchema = z.object({ email: emailSchema }).strict();
// Tenant, actor and recipient IDs are derived by the API, never trusted from input.
export const messageSchema = z.object({ content: z.string().trim().min(1).max(4000) }).strict();
export const journalEntrySchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().min(1).max(10000),
  })
  .strict();
export const recordsAccessRequestSchema = z
  .object({ scope: z.enum(['clinical_record', 'session_materials', 'other']) })
  .strict();
export const appointmentSchema = z
  .object({
    patientId: idSchema,
    clinicianId: idSchema,
    title: z.string().trim().min(1).max(160),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    modality: z.enum(['telehealth', 'in_person']),
  })
  .strict()
  .refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), {
    message: 'The appointment must end after it begins.',
    path: ['endsAt'],
  });
export const patientUpdateSchema = z
  .object({
    sessionId: idSchema,
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().min(1).max(10000),
  })
  .strict();
export const clinicalNoteSchema = z
  .object({
    sessionId: idSchema,
    content: z.string().trim().min(1).max(50000),
    status: z.enum(['draft', 'signed']),
  })
  .strict();
export const consentSchema = z
  .object({
    purpose: z.enum(['treatment', 'telehealth', 'recording', 'portal_sharing']),
    status: z.enum(['granted', 'declined', 'withdrawn']),
    policyVersion: z.string().trim().min(1).max(100),
  })
  .strict();
export type MessageInput = z.infer<typeof messageSchema>;
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type RecordsAccessRequestInput = z.infer<typeof recordsAccessRequestSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
