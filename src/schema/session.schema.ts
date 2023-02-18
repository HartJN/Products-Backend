import { object, string } from 'zod'

export const createSessionSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email({
      message: 'Not a valid email address',
    }),
    password: string({
      required_error: 'Password is required',
    }).min(6, {
      message: 'Password must be at least 6 characters',
    }),
  }),
})
