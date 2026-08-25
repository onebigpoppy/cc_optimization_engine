/** Shared, domain-agnostic TypeScript definitions. */

export type ID = string

export type Nullable<T> = T | null

export type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export interface ResultOk<T> {
  ok: true
  data: T
}

export interface ResultErr {
  ok: false
  error: string
}

export type Result<T> = ResultOk<T> | ResultErr
