export class ClientError extends Error {
  constructor(
    message: string,
    public readonly status = 0,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ClientError';
  }
}

export function throwResponseError(
  error: { message?: string; status?: number; code?: string } | null,
): void {
  if (error) {
    throw new ClientError(
      error.message ?? 'Request failed',
      error.status,
      error.code,
    );
  }
}
