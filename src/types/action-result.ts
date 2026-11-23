export type FieldErrors = Partial<Record<string, string[]>>;

export type ActionSuccess<TData = undefined> = {
  success: true;
  data: TData;
  message?: string;
};

export type ActionFailure = {
  success: false;
  error: string;
  fieldErrors?: FieldErrors;
};

/** Standard return type for Server Actions consumed by forms. */
export type ActionResult<TData = undefined> = ActionSuccess<TData> | ActionFailure;
