'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import 'animate.css';
import './header.css';

type User = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

type Props = {
    user: User;
    t: {
        title: string;
        game: string;
        logout: string;
    };
    onLogout: () => Promise<void>;
};

export default function Header({ user, t, onLogout }: Props) {
    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarClosing, setIsSidebarClosing] = useState(false);

    // Profile Menu State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isProfileClosing, setIsProfileClosing] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const profileTriggerRef = useRef<HTMLButtonElement>(null);

    const closeSidebar = () => {
        if (isSidebarOpen && !isSidebarClosing) {
            setIsSidebarClosing(true);
        }
    };

    const closeProfile = () => {
        if (isProfileOpen && !isProfileClosing) {
            setIsProfileClosing(true);
        }
    };

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            // Sidebar
            if (
                isSidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(target) &&
                !(event.target as Element).closest('#menu-toggle')
            ) {
                closeSidebar();
            }

            // Profile
            if (
                isProfileOpen &&
                profileMenuRef.current &&
                !profileMenuRef.current.contains(target) &&
                profileTriggerRef.current &&
                !profileTriggerRef.current.contains(target)
            ) {
                closeProfile();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen, isProfileOpen]);

    return (
        <>
            <header className='header-container sticky-top bg-white shadow-sm flex-center'>
                <nav className='header-nav w-full flex-center'>
                    {/* Left: Hamburger Menu */}
                    <ul style={{ margin: 0 }}>
                        <li>
                            <button
                                id='menu-toggle'
                                onClick={() => {
                                    if (isSidebarOpen) closeSidebar();
                                    else setIsSidebarOpen(true);
                                }}
                                className={`menu-toggle-btn ${
                                    isSidebarOpen ? 'active' : ''
                                }`}
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                >
                                    <line x1='3' y1='12' x2='21' y2='12'></line>
                                    <line x1='3' y1='6' x2='21' y2='6'></line>
                                    <line x1='3' y1='18' x2='21' y2='18'></line>
                                </svg>
                            </button>
                        </li>
                    </ul>

                    {/* Center: Title */}
                    <ul style={{ margin: 0 }}>
                        <li>
                            <Link
                                href='/sys-console'
                                className='header-title text-primary-900 no-decoration'
                            >
                                {t.title}
                            </Link>
                        </li>
                    </ul>

                    {/* Right: User Profile */}
                    <ul style={{ margin: 0 }}>
                        <li>
                            <button
                                ref={profileTriggerRef}
                                onClick={() => {
                                    if (isProfileOpen) closeProfile();
                                    else setIsProfileOpen(true);
                                }}
                                onMouseEnter={() => setIsProfileHovered(true)}
                                onMouseLeave={() => setIsProfileHovered(false)}
                                className={`profile-btn flex-center cursor-pointer ${
                                    isProfileHovered || isProfileOpen
                                        ? 'active'
                                        : ''
                                }`}
                            >
                                <span
                                    style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {user.name}
                                </span>
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || 'User'}
                                        className='profile-avatar'
                                    />
                                ) : (
                                    <div className='profile-avatar-placeholder' />
                                )}
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Sidebar Menu (Left) */}
            {(isSidebarOpen || isSidebarClosing) && (
                <>
                    {/* Overlay */}
                    <div
                        className={`sidebar-overlay animate__animated ${
                            isSidebarClosing
                                ? 'animate__fadeOut'
                                : 'animate__fadeIn'
                        }`}
                        onClick={closeSidebar}
                    />

                    {/* Sidebar */}
                    <aside
                        ref={sidebarRef}
                        className={`sidebar-menu animate__animated ${
                            isSidebarClosing
                                ? 'animate__slideOutLeft'
                                : 'animate__slideInLeft'
                        }`}
                        onAnimationEnd={() => {
                            if (isSidebarClosing) {
                                setIsSidebarOpen(false);
                                setIsSidebarClosing(false);
                            }
                        }}
                    >
                        <nav>
                            <ul>
                                <li>
                                    <Link
                                        href='/sys-console/game'
                                        onClick={closeSidebar}
                                        className='secondary sidebar-link text-primary-900 no-decoration'
                                    >
                                        {t.game}
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>
                </>
            )}

            {/* Profile Menu (Right) */}
            {(isProfileOpen || isProfileClosing) && (
                <div
                    ref={profileMenuRef}
                    className={`profile-menu animate__animated ${
                        isProfileClosing
                            ? 'animate__slideOutUp'
                            : 'animate__slideInDown'
                    }`}
                    onAnimationEnd={() => {
                        if (isProfileClosing) {
                            setIsProfileOpen(false);
                            setIsProfileClosing(false);
                        }
                    }}
                >
                    <div className='profile-menu-content'>
                        <div className='profile-info'>
                            <small className='profile-label'>
                                Signed in as
                            </small>
                            <div className='profile-email'>{user.email}</div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onLogout();
                            }}
                            className='logout-btn'
                        >
                            {t.logout}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
