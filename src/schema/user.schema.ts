import { object, string, TypeOf } from 'zod'

export const createUserSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email({
      message: 'Not a valid email address',
    }),
    name: string({
      required_error: 'Name is required',
    }),
    password: string({
      required_error: 'Password is required',
    }).min(6, {
      message: 'Password must be at least 6 characters',
    }),
    passwordConfirmation: string({
      required_error: 'Password confirmation is required',
    }),
  }).refine(data => data.password === data.passwordConfirmation, {
    message: 'Passwords must match',
    path: ['passwordConfirmation'],
  }),
})

export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  'body.passwordConfirmation'
>
