import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/index.html',
      permanent: false,
    },
  } as any;
};

export default function RootRedirect() {
  return null;
}


