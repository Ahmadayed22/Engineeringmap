import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
  Avatar,
  Button,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
} from 'flowbite-react';
import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@store/reduxHooks';
import { thunkAuthLogout } from '@store/auth/authSlice';
import { useQueryClient } from '@tanstack/react-query';
import NotificationBell from '@features/community/NotificationBell';
import { useI18n } from '../../i18n/context';
import './bgStyle.css';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-2 transition-colors md:p-0 ${
    isActive
      ? 'bg-white/10 font-semibold text-white md:bg-transparent md:underline md:decoration-2 md:underline-offset-8'
      : 'text-white/80 hover:bg-gray-700 hover:text-white md:hover:bg-transparent'
  }`;
const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo, accessToken } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const { t, lang, toggle } = useI18n();

  const navbarToggleRef = useRef<HTMLButtonElement | null>(null);

  const handleLogout = useCallback(async () => {
    // Previously only local state was cleared, so the refresh token stayed valid on the server.
    await dispatch(thunkAuthLogout());
    queryClient.clear();
    navigate('/login');
  }, [dispatch, queryClient, navigate]);

  const closeMenu = () => {
    if (navbarToggleRef.current) {
      navbarToggleRef.current.click();
    }
  };

  const renderAuthButtons = () => (
    <div className="flex items-center gap-2 sm:gap-3 ">
      <Button
        as={Link}
        to="/signup"
        size="sm"
        className="!bg-gray-700 hover:!bg-gray-800 text-white text-xs sm:text-sm px-3 sm:px-4"
      >
        {t('header.register')}
      </Button>
      <Button
        as={Link}
        to="/login"
        size="sm"
        className="!bg-gray-700 hover:!bg-gray-800 text-white text-xs sm:text-sm px-3 sm:px-4"
      >
        {t('header.login')}
      </Button>
    </div>
  );

  const renderUserDropdown = () => (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <Avatar
          alt={t('header.userMenu', { name: userInfo?.username || '' })}
          placeholderInitials={(userInfo?.username ?? '?')
            .slice(0, 2)
            .toUpperCase()}
          rounded
          className="cursor-pointer transition-all duration-200 hover:opacity-90"
          size="sm"
        />
      }
    >
      <DropdownHeader className="py-3">
        <span className="block text-sm font-medium text-gray-900 dark:text-white">
          {userInfo?.username || t('header.unknownUser')}
        </span>
        <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
          {userInfo?.email}
        </span>
      </DropdownHeader>
      <DropdownItem as={Link} to="/planner">
        {t('header.planner')}
      </DropdownItem>
      <DropdownItem as={Link} to="/share">
        {t('header.share')}
      </DropdownItem>
      {userInfo?.roles?.includes('ADMIN') && (
        <DropdownItem as={Link} to="/admin">
          {t('header.moderation')}
        </DropdownItem>
      )}
      <DropdownDivider />
      <DropdownItem
        onClick={() => {
          handleLogout();
          closeMenu();
        }}
        className="text-red-600 hover:bg-red-100 focus:bg-red-100"
      >
        {t('header.signOut')}
      </DropdownItem>
    </Dropdown>
  );

  return (
    <Navbar
      fluid
      rounded={false}
      className=" shadow-md sticky top-0 z-50 px-4 sm:px-6 lg:px-8 custom-bg2"
    >
      <NavbarBrand as="div" className="flex items-center space-x-3">
        <Link
          to="/"
          className="rounded focus-visible:outline-2 focus-visible:outline-white"
        >
          <span className="text-lg sm:text-xl font-semibold text-white whitespace-nowrap hover:opacity-80 transition-opacity duration-200">
            <span className="hidden sm:inline">{t('header.brand')}</span>
            <span className="sm:hidden">{t('header.brandShort')}</span>
          </span>
        </Link>
      </NavbarBrand>

      <div className="flex items-center gap-2 md:order-2">
        <button
          type="button"
          onClick={toggle}
          lang={lang === 'ar' ? 'en' : 'ar'}
          aria-label={t('lang.switchLabel')}
          title={t('lang.switchLabel')}
          className="cursor-pointer rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
        >
          {t('lang.switchTo')}
        </button>
        {accessToken && userInfo ? (
          <div className="flex items-center gap-2">
            <NotificationBell />
            {renderUserDropdown()}
          </div>
        ) : (
          renderAuthButtons()
        )}
        <NavbarToggle
          className="text-white hover:bg-gray-700 focus:ring-gray-400"
          ref={navbarToggleRef}
        />
      </div>

      <NavbarCollapse className="cursor-pointer  ">
        <li>
          <NavLink
            to="/"
            end={true}
            className={navLinkClass}
            onClick={closeMenu}
          >
            {t('nav.roadmap')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/gpa"
            end={false}
            className={navLinkClass}
            onClick={closeMenu}
          >
            {t('nav.gpa')}
          </NavLink>
        </li>
        <li>
          <a
            href="https://engzenon.com/library?filter=2"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded px-3 py-2 text-white/80 transition-colors hover:bg-gray-700 hover:text-white md:p-0 md:hover:bg-transparent"
            onClick={closeMenu}
          >
            {t('nav.bank')}
            <span className="sr-only"> {t('nav.newTab')}</span>
          </a>
        </li>
        <li>
          <NavLink
            to="/dremail"
            end={false}
            className={navLinkClass}
            onClick={closeMenu}
          >
            {t('nav.facultyEmails')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            end={false}
            className={navLinkClass}
            onClick={closeMenu}
          >
            {t('nav.about')}
          </NavLink>
        </li>
      </NavbarCollapse>
    </Navbar>
  );
};

export default Header;
