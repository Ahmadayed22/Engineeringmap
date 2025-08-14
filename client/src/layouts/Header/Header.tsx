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
  NavbarToggle,
} from 'flowbite-react';
import { Link, useNavigate } from 'react-router';
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

  const navLinks = [
    { to: '/', label: 'RoadMap', isExternal: false },
    { to: '/gpa', label: 'GPA', isExternal: false },
    {
      to: 'https://engzenon.com/library?filter=2',
      label: 'BankZenon',
      isExternal: true,
    },
    { to: '/schedule', label: "Doctors' schedule", isExternal: false },
    { to: '/about', label: 'About', isExternal: false },
  ];

  const renderAuthButtons = () => (
    <div className="flex items-center gap-2 sm:gap-3">
      <Button
        size="sm"
        className="!bg-[#4F4F4F] hover:!bg-[#3F3F3F] transition-colors duration-200 text-xs sm:text-sm px-3 sm:px-4"
        aria-label="Register for account"
      >
        <Link to="/signup" className="text-white no-underline">
          Register
        </Link>
      </Button>
      <Button
        size="sm"
        className="!bg-[#4F4F4F] hover:!bg-[#3F3F3F] transition-colors duration-200 text-xs sm:text-sm px-3 sm:px-4"
        aria-label="Login to account"
      >
        <Link to="/login" className="text-white no-underline">
          Login
        </Link>
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
          className="cursor-pointer bg-white rounded-full hover:ring-2 hover:ring-gray-300 transition-all duration-200"
          size="sm"
        />
      }
    >
      <DropdownHeader className="py-3">
        <span className="block text-sm font-medium text-white">
          {userInfo?.username || 'Unknown User'}
        </span>
        <span className="block truncate text-sm text-white">
          {userInfo?.email || 'No email provided'}
        </span>
      </DropdownHeader>
      <DropdownDivider />
      <DropdownItem
        onClick={handleLogout}
        className="text-red-600 hover:bg-red-50 focus:bg-red-50"
      >
        Sign out
      </DropdownItem>
    </Dropdown>
  );

  return (
    <Navbar
      fluid
      rounded={false}
      className="!bg-[#828282] shadow-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8"
    >
      {/* Brand Section */}
      <NavbarBrand
        as={Link}
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
      >
        {/* <img
          // src={Zenon}
          // alt="Engineering Map Logo"
          className=""
        /> */}
        <span className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold text-white ">
          <span className="hidden sm:inline">Engineering Map</span>
          <span className="sm:hidden">Eng Map</span>
        </span>
      </NavbarBrand>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-3 md:order-2">
        {accessToken && userInfo ? renderUserDropdown() : renderAuthButtons()}
        <NavbarToggle className="text-white hover:bg-gray-700 focus:ring-gray-400" />
      </div>

      {/* Navigation Links */}
      <NavbarCollapse className="mt-4 md:mt-0">
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0">
          {navLinks.map((link) =>
            link.isExternal ? (
              <a
                key={link.label}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-gray-700 text-sm sm:text-base"
              >
                {link.label}
                <svg
                  className="inline-block ml-1 w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="text-white hover:text-gray-200 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-gray-700 text-sm sm:text-base"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </NavbarCollapse>
    </Navbar>
  );
};

export default Header;
