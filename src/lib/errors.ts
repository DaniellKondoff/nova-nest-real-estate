export class DatabaseError extends Error {
  constructor(message = "Грешка при работа с базата данни.") {
    super(message);
    this.name = "DatabaseError";
  }
}

export class AuthError extends Error {
  constructor(message = "Грешка при удостоверяване.") {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Грешка при валидиране на данните.") {
    super(message);
    this.name = "ValidationError";
  }
}

export function formatErrorMessage(err: unknown): string {
  if (!err) return "Възникна непозната грешка.";
  if (typeof err === "string") return err;
  if (err instanceof ValidationError) return err.message;
  if (err instanceof AuthError) return err.message;
  if (err instanceof DatabaseError) return err.message;
  if (err instanceof Error) return err.message || "Възникна грешка.";
  return "Възникна грешка.";
}


