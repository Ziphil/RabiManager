//


export class SaveError extends Error {

  public code: string;

  public constructor(code: string) {
    super(code);
    this.name = "SaveError";
    this.code = code;
    Error.captureStackTrace(this, SaveError);
  }

}