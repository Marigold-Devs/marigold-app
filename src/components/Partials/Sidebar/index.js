/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Layout } from 'antd';
import imgIconAccount from 'assets/images/icon-account.svg';
import imgIconLogout from 'assets/images/icon-logout.svg';
import imgLogo from 'assets/images/logo.png';
import imgSampleAvatar from 'assets/images/sample-avatar.png';
import cn from 'classnames';
import { getUserTypeName } from 'globals/functions';
import { useAuth, useUI } from 'hooks';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import './styles.scss';

const Sidebar = ({ items }) => {
  // STATES
  const [popupVisible, setPopupVisible] = useState(false);

  // CUSTOM HOOKS
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { isSidebarCollapsed, onCollapseSidebar } = useUI();

  // METHODS
  const getName = useCallback(
    () => `${user?.first_name} ${user?.last_name}`,
    [user]
  );

  return (
    <Layout.Sider
      breakpoint="md"
      className={cn('Sidebar', { Sidebar__collapsed: isSidebarCollapsed })}
      collapsedWidth="0"
      theme="light"
      width={280}
      onCollapse={(collapsed) => onCollapseSidebar(collapsed)}
    >
      <img alt="logo" className="Sidebar_logo" src={imgLogo} />
      <div className="Sidebar_sidebarList">
        {items.map((item) => (
          <Link key={item.link} tabIndex={-1} to={item.link}>
            <div
              className={cn('Sidebar_sidebarList_item', {
                Sidebar_sidebarList_item__active: pathname.startsWith(
                  item.link
                ),
              })}
            >
              <item.icon
                className="Sidebar_sidebarList_item_icon"
                style={{
                  fontSize: 20,
                  color: pathname.startsWith(item.link) ? '#e0bc5d' : '#626b77',
                }}
              />

              <span className="Sidebar_sidebarList_item_name">{item.name}</span>

              {item?.count > 0 && (
                <span className="Sidebar_sidebarList_item_itemCount">
                  {item?.count}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div
        className={cn('bottom', { active: popupVisible })}
        onClick={() => setPopupVisible((value) => !value)}
      >
        <div className="menu">
          <div className="item">
            <img alt="icon" className="icon" src={imgIconAccount} />
            <span className="name">Account</span>
          </div>

          <div className="item" onClick={() => logout()}>
            <img alt="icon" className="icon" src={imgIconLogout} />
            <span className="name">Logout</span>
          </div>
        </div>

        <div className="user-details">
          <img alt="user avatar" className="avatar" src={imgSampleAvatar} />
          <div className="user-text-info">
            <span className="name">{getName()}</span>
            <span className="role">{getUserTypeName(user?.user_type)}</span>
          </div>
        </div>
      </div>
    </Layout.Sider>
  );
};

Sidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      icon: PropTypes.node,
      link: PropTypes.string,
      count: PropTypes.number,
    })
  ),
};

export default Sidebar;
