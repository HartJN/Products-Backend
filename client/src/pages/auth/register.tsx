import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/router';

const createUserSchema = object({
  email: string({
    required_error: 'Email is required',
  })
    .email({
      message: 'Not a valid email address',
    })
    .min(1),
  name: string({
    required_error: 'Name is required',
  }).min(1),
  password: string({
    required_error: 'Password is required',
  }).min(6, {
    message: 'Password must be at least 6 characters',
  }),
  passwordConfirmation: string({
    required_error: 'Password confirmation is required',
  }).min(6, {
    message: 'Password must be at least 6 characters',
  }),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords must match',
  path: ['passwordConfirmation'],
});

type CreateUserInput = TypeOf<typeof createUserSchema>;

function RegisterPage() {
  const router = useRouter();
  const [registerError, setRegisterError] = useState(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  async function onSubmit(values: CreateUserInput) {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/users`,
        values
      );
      router.push('/');
    } catch (e: any) {
      setRegisterError(e.message);
    }
  }

  return (
    <>
      <p>{registerError}</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-element">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="bob.smith@email.com"
            {...register('email')}
          />
          <p>{errors.email?.message}</p>
        </div>

        <div className="form-element">
          <label htmlFor="name">Name</label>
          <input type="text" placeholder="Bob Smith" {...register('name')} />
          <p>{errors.name?.message}</p>
        </div>

        <div className="form-element">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('password')}
          />
          <p>{errors.password?.message}</p>
        </div>

        <div className="form-element">
          <label htmlFor="passwordConfirmation">Confirm Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('passwordConfirmation')}
          />
          <p>{errors.passwordConfirmation?.message}</p>
        </div>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default RegisterPage;
