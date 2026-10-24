import type { AuditEvent, AuditLogger, ClinicalAiService } from '@patient-touch/types';

/** Volatile for local tests/demo; production needs an append-only durable sink. */
export class MemoryAuditLogger implements AuditLogger {
  readonly events: AuditEvent[] = [];
  async write(event: AuditEvent): Promise<void> {
    this.events.push(structuredClone(event));
  }
}
export const disabledAiService: ClinicalAiService = {
  enabled: false,
  async propose() {
    throw new Error('AI assistance is disabled in Phase 1. No content was sent to a provider.');
  },
};
