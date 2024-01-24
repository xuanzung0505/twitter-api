import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  return hash
}

export const comparePassword = async (password: string, hash: string) => {
  const result = await bcrypt.compare(password, hash)
  return result
}
