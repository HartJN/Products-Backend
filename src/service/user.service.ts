import { omit } from 'lodash'
import { DocumentDefinition, FilterQuery } from 'mongoose'
import UserModel, { UserDocument } from '../models/user.model'
import logger from '../utils/logger'

export async function createUser(
  input: DocumentDefinition<
    Omit<UserDocument, 'createdAt' | 'updatedAt' | 'comparePassword'>
  >
) {
  try {
    const user = await UserModel.create(input)

    return omit(user.toJSON(), ['password', '__v'])
  } catch (error: any) {
    logger.error(error)
    throw new Error(error)
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = await UserModel.findOne({ email })

  if (!user) {
    return false
  }

  const isValid = await user.comparePassword(password)

  if (!isValid) {
    return false
  }

  return omit(user.toJSON(), ['password', '__v'])
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean()
}
