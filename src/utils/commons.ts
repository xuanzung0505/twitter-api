export const convertEnumToNumberArray: (numberEnum: object) => number[] = (numberEnum) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number')
}

export const convertEnumToStringArray: (stringEnum: object) => string[] = (stringEnum) => {
  return Object.values(stringEnum).filter((value) => typeof value === 'string')
}

/**
 * Parse queryString to the desired type (number|undefined), if it fails then return defaultValue
 */
export const parseQuery: <T = { [key: string]: string | undefined }>(
  query: T,
  defaultValue: { [key in keyof T]: number | undefined }
) => typeof defaultValue = (query, defaultValue) => {
  const result = defaultValue
  for (const key in query) {
    const value = Number(query[key]) //null|{} -> 0, otherwise NaN -> this should be NaN
    result[key] = isFinite(value) ? value : defaultValue[key]
  }
  return result
}
