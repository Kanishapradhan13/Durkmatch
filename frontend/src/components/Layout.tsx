import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐉</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-druk-orange to-druk-red bg-clip-text text-transparent">
                DrukMatch
              </h1>
            </div>

            <div className="flex gap-1">
              <NavLink
                to="/discover"
                className={({ isActive }) =>
                  `flex flex-col items-center px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'text-druk-orange bg-druk-orange/10'
                      : 'text-gray-600 hover:text-druk-orange hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <span className="text-xs font-medium mt-1">Discover</span>
              </NavLink>

              <NavLink
                to="/matches"
                className={({ isActive }) =>
                  `flex flex-col items-center px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'text-druk-orange bg-druk-orange/10'
                      : 'text-gray-600 hover:text-druk-orange hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium mt-1">Matches</span>
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex flex-col items-center px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'text-druk-orange bg-druk-orange/10'
                      : 'text-gray-600 hover:text-druk-orange hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-medium mt-1">Profile</span>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
