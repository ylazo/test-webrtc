export const minLength = (v: string, length: number) => {
  return !v || !(v.length < length) || `Mínimo ${length} letra(s)`
}
