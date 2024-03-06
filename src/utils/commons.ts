export const convertEnumToArray: (numberEnum: object) => number[] = (numberEnum) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number')
}
