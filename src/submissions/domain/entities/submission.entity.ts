export type SubmissionStatus = 'pending' | 'accepted' | 'rejected';

export class Submission {
  constructor(
    private readonly _id: string,
    private readonly _problemId: string,
    private readonly _userId: string,
    private readonly _language: string,
    private readonly _code: string,
    private readonly _status: SubmissionStatus,
    private readonly _runtime: number | null,
    private readonly _memory: number | null,
    private readonly _createdAt: Date
  ) {}

  getId(): string {
    return this._id;
  }

  getProblemId(): string {
    return this._problemId;
  }

  getUserId(): string {
    return this._userId;
  }

  getLanguage(): string {
    return this._language;
  }

  getCode(): string {
    return this._code;
  }

  getStatus(): SubmissionStatus {
    return this._status;
  }

  getRuntime(): number | null {
    return this._runtime;
  }

  getMemory(): number | null {
    return this._memory;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }
}
