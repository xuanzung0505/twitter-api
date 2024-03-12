export const convertEnumToArray: (numberEnum: object) => number[] = (numberEnum) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number')
}

/**
 * Parse queryString to the desired type (number|undefined), if it fails then return defaultValue
 */
export const parseQuery: <T = { [key: string]: string | undefined }>(
  query: T,
  defaultValue: { [key in keyof T]: number | undefined }
) => typeof defaultValue = (query, defaultValue) => {
  const result = defaultValue as any
  Object.keys(query as any).forEach((key) => {
    const value = Number((query as any)[key]) //null|{} -> 0, otherwise NaN -> this should be NaN
    result[key] = isFinite(value) ? value : (defaultValue as any)[key]
  })
  return result as typeof defaultValue
}
