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
import AboAyed from '../../assets/svg/AboAyed.svg';

import { useAppSelector } from '@store/reduxHooks';
import { useDispatch } from 'react-redux';
import { authLogout } from '@store/auth/authSlice';

const Header = () => {
  const disptach = useDispatch();
  const navagate = useNavigate();
  const { userInfo, accessToken } = useAppSelector((state) => state.auth);

  const logOut = () => {
    disptach(authLogout());
    navagate('/login');
  };

  return (
    //className="fixed w-full top-0"
    <Navbar fluid rounded className="!bg-[#0a0d11]">
      <NavbarBrand href="https://flowbite-react.com">
        <img src={AboAyed} className="mr-3 h-6 sm:h-9 rounded-2xl bg-white" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Engineering Map
        </span>
      </NavbarBrand>
      <div className="flex md:order-2">
        {accessToken && userInfo ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                rounded
              />
            }
          >
            <DropdownHeader>
              <span className="block text-sm">{userInfo.username}</span>
              <span className="block truncate text-sm font-medium">
                {userInfo.email}
              </span>
            </DropdownHeader>
            <DropdownDivider />
            <DropdownItem onClick={logOut}> Sign out</DropdownItem>
          </Dropdown>
        ) : (
          <div className="flex items-center gap-2">
            <Button className="cursor-pointer" color="dark">
              <Link to="/signup"> Register</Link>
            </Button>
            <Button className="cursor-pointer" color="dark">
              <Link to="/login"> LogIn</Link>
            </Button>
          </div>
        )}

        {/* <DropdownItem>Dashboard</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          <DropdownItem>Earnings</DropdownItem> */}

        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <Link to="/">RoadMap</Link>
        <Link to="/GPA">GPA</Link>

        <a
          href="https://engzenon.com/library?filter=2"
          target="_blank"
          rel="noopener noreferrer"
        >
          BankZenon
        </a>

        <Link to="/About">About</Link>
      </NavbarCollapse>
    </Navbar>
  );
};

export default Header;
