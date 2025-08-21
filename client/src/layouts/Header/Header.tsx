/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Avatar,
  Button,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react';

import { Link, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import AboAyed from '../../assets/svg/AboAyed.svg';

import { useAppSelector } from '@store/reduxHooks';
import { useDispatch } from 'react-redux';
import { authLogout } from '@store/auth/authSlice';
import { useQueryClient } from '@tanstack/react-query';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, accessToken } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const handleLogout = useCallback(() => {
    dispatch(authLogout());
    queryClient.clear();
    navigate('/login');
  }, [dispatch, queryClient, navigate]);

  const renderAuthButtons = () => (
    <div className="flex items-center gap-2 sm:gap-3">
      <Button
        as={Link}
        to="/signup"
        size="sm"
        className="!bg-gray-700 hover:!bg-gray-800 text-white text-xs sm:text-sm px-3 sm:px-4"
      >
        Register
      </Button>
      <Button
        as={Link}
        to="/login"
        size="sm"
        className="!bg-gray-700 hover:!bg-gray-800 text-white text-xs sm:text-sm px-3 sm:px-4"
      >
        Login
      </Button>
    </div>
  );

  const renderUserDropdown = () => (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <Avatar
          alt={`${userInfo?.username || 'User'} profile picture`}
          img={AboAyed}
          rounded
          className="cursor-pointer hover:ring-2 bg-gray-300 hover:ring-gray-300 transition-all duration-200"
          size="sm"
        />
      }
    >
      <DropdownHeader className="py-3">
        <span className="block text-sm font-medium text-gray-900 dark:text-white">
          {userInfo?.username || 'Unknown User'}
        </span>
        <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
          {userInfo?.email || 'No email provided'}
        </span>
      </DropdownHeader>
      <DropdownDivider />
      <DropdownItem
        onClick={handleLogout}
        className="text-red-600 hover:bg-red-100 focus:bg-red-100"
      >
        Sign out
      </DropdownItem>
    </Dropdown>
  );

  return (
    <Navbar
      fluid
      rounded={false}
      className="!bg-gray-600 shadow-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8"
    >
      {/* Brand */}
      <NavbarBrand className="flex items-center space-x-3">
        <span className="text-lg sm:text-xl font-semibold text-white whitespace-nowrap hover:opacity-80 transition-opacity duration-200">
          <span className="hidden sm:inline">Engineering Map</span>
          <span className="sm:hidden">Eng Map</span>
        </span>
      </NavbarBrand>

      {/* Actions */}
      <div className="flex items-center space-x-3 md:order-2">
        {accessToken && userInfo ? renderUserDropdown() : renderAuthButtons()}
        <NavbarToggle className="text-white hover:bg-gray-700 focus:ring-gray-400" />
      </div>

      {/* Navigation */}
      <NavbarCollapse className="cursor-pointer">
        <NavbarLink as={Link} to="/">
          RoadMap
        </NavbarLink>
        <NavbarLink as={Link} to="/gpa">
          GPA
        </NavbarLink>
        <NavbarLink
          href="https://engzenon.com/library?filter=2"
          target="_blank"
          rel="noopener noreferrer"
        >
          BankZenon
        </NavbarLink>
        <NavbarLink as={Link} to="/schedule">
          Doctors&apos; Schedule
        </NavbarLink>
        <NavbarLink as={Link} to="/about">
          About
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};

export default Header;
