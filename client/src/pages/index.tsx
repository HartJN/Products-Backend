import { GetServerSideProps, NextPage } from 'next';
import useSwr from 'swr';

import fetcher from '@/utils/fetcher';
import styles from '@/styles/Home.module.css';
import getGoogleOAuthURL from '@/utils/getGoogleUrl';

interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  session: string;
  iat: number;
  exp: number;
}

const Home: NextPage<{ fallbackData: User }> = ({ fallbackData }) => {
  const { data } = useSwr<User | null>(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    fetcher,
    { fallbackData }
  );

  if (data) {
    return (
      <div className={styles.container}>
        Welcome {JSON.stringify(data.name)}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <a href={'/auth/login'}>Login</a>
      <a href={getGoogleOAuthURL()}>Login with Google</a>
      please Login
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetcher(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    context.req.headers
  );

  return { props: { fallbackData: data } };
};

export default Home;
