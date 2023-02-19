import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/router';

const createSessionSchema = object({
  email: string().min(1),
  password: string().min(1),
});

type CreateSessionInput = TypeOf<typeof createSessionSchema>;

function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
  });

  async function onSubmit(values: CreateSessionInput) {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/sessions`,
        values,
        { withCredentials: true }
      );
      router.push('/');
    } catch (e: any) {
      setLoginError(e.message);
    }
  }

  console.log({ errors });

  return (
    <>
      <p>{loginError}</p>
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('password')}
          />
          <p>{errors.password?.message}</p>
        </div>

        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default LoginPage;
