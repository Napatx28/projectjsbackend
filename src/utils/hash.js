import bcrypt from 'bcrypt'

export const hash = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const compare = (password, hashPassword) =>
  bcrypt.compare(password, hashPassword)
