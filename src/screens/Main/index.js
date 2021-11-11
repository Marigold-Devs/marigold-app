import { Container } from 'components';
import { useAuth } from 'hooks';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

const sidebarItems = [
  {
    name: 'Dashboard',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    name: 'Products',
    icon: 'shopping',
    link: '/products',
  },
  {
    name: 'Branches',
    icon: 'shop',
    link: '/branches',
  },
  // {
  //   name: 'Pre-orders',
  //   icon: 'profile',
  //   link: '/pre-orders',
  // },
  // {
  //   name: 'deliveries',
  //   icon: 'contacts',
  //   link: '/deliveries',
  // },
  // {
  //   name: 'Notifications',
  //   icon: 'bell',
  //   link: '/notifications',
  // },
];

const Main = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  return (
    <Container sidebarItems={sidebarItems}>
      <Outlet />
    </Container>
  );
};

export default Main;
