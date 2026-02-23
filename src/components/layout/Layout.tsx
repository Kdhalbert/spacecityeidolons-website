import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Space City Eidolons
        </Link>
        <nav className="flex gap-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/games"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Games
          </Link>
          <Link
            to="/events"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Events
          </Link>
          <Link
            to="/profile"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <p className="text-sm text-gray-600">
              Space City Eidolons is a gaming community dedicated to bringing
              people together for shared experiences.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Forums
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Events
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>
            &copy; {currentYear} Space City Eidolons. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
