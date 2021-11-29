import {
  AreaChartOutlined,
  BellOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Container } from 'components';
import { useAuth } from 'hooks';
import React, { useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import useNotificationsCount from '../../hooks/useNotificationsCount';

const Main = () => {
  // CUSTOM HOOKS
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: notificationsCount } = useNotificationsCount();

  // METHODS
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  const getSidebarItems = useCallback(
    () => [
      {
        name: 'Dashboard',
        icon: DashboardOutlined,
        link: '/dashboard',
      },
      {
        name: 'Products',
        icon: ShoppingOutlined,
        link: '/products',
      },
      {
        name: 'Branches',
        icon: ShopOutlined,
        link: '/branches',
      },
      {
        name: 'Preorders',
        icon: FileTextOutlined,
        link: '/preorders',
      },
      {
        name: 'Deliveries',
        icon: ShoppingCartOutlined,
        link: '/deliveries',
      },
      {
        name: 'Reports',
        icon: AreaChartOutlined,
        link: '/reports',
      },
      {
        name: 'Notifications',
        icon: BellOutlined,
        link: '/notifications',
        count: notificationsCount,
      },
    ],
    [notificationsCount]
  );

  return (
    <Container sidebarItems={getSidebarItems()}>
      <Outlet />
    </Container>
  );
};

export default Main;
