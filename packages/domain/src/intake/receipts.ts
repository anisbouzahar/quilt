import type { LocalDate } from '../primitives/calendar';
import type {
  EntityId,
  Timestamp,
  WorkspaceRecord,
} from '../primitives/identity';
import type { Money } from '../primitives/money';

export interface ReceiptAttachment extends WorkspaceRecord<'receipt'> {
  readonly objectKey: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly documentKind: 'receipt' | 'invoice' | 'unknown';
}

export type ExtractionJobState =
  | { readonly kind: 'queued' }
  | { readonly kind: 'processing'; readonly startedAt: Timestamp }
  | {
      readonly kind: 'succeeded';
      readonly resultId: EntityId<'extraction-result'>;
    }
  | { readonly kind: 'failed'; readonly reason: string };

export interface ExtractionJob extends WorkspaceRecord<'extraction-job'> {
  readonly receiptId: EntityId<'receipt'>;
  readonly state: ExtractionJobState;
}

export interface ExtractedField {
  readonly value: string | null;
  /** Provider score normalized to [0,1], or null if unavailable. */
  readonly confidence: number | null;
}

/** Immutable provider evidence, never overwritten with the user's corrected values. */
export interface ExtractionResult extends WorkspaceRecord<'extraction-result'> {
  readonly jobId: EntityId<'extraction-job'>;
  readonly receiptId: EntityId<'receipt'>;
  readonly provider: string;
  readonly rawResultObjectKey: string;
  readonly fields: {
    readonly merchantName: ExtractedField;
    readonly purchaseDate: ExtractedField;
    readonly total: ExtractedField;
    readonly currency: ExtractedField;
  };
}

export type ExpenseDraftDecision =
  | { readonly kind: 'review' }
  | {
      readonly kind: 'accepted';
      readonly transactionId: EntityId<'transaction'>;
    }
  | { readonly kind: 'discarded' };

export interface ExpenseDraft extends WorkspaceRecord<'expense-draft'> {
  readonly receiptId: EntityId<'receipt'>;
  readonly extractionResultId: EntityId<'extraction-result'> | null;
  readonly merchantId: EntityId<'merchant'> | null;
  readonly merchantName: string | null;
  readonly accountId: EntityId<'account'> | null;
  readonly occurredOn: LocalDate | null;
  readonly amount: Money | null;
  readonly categoryId: EntityId<'category'> | null;
  readonly decision: ExpenseDraftDecision;
}

export type TransactionEvidence = WorkspaceRecord<'evidence-link'> & {
  readonly transactionId: EntityId<'transaction'>;
} & (
    | { readonly kind: 'receipt'; readonly receiptId: EntityId<'receipt'> }
    | {
        readonly kind: 'import-row';
        readonly importRowId: EntityId<'import-row'>;
      }
  );
