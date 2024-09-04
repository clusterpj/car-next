// src/pages/admin/adminProfile.tsx
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import AdminProfile from '@/components/admin/adminProfile';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const AdminProfilePage = () => {
  return <AdminProfile />;
};

export default AdminProfilePage;