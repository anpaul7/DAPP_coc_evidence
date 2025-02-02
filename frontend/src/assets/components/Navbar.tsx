
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon,  XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaUserTie } from "react-icons/fa6";

const navigation = [
  { name: 'Home', href: '/', current: true },
  { name: 'Acquisition', href: '/register', current: false },
  { name: 'Analysis', href: '/inspection', current: false },
  { name: 'Documentation', href: '/report', current: false },  
  { name: 'Presentation', href: '/delivery', current: false },    
]

function classNames(...classes: (string | boolean)[]): string {
    return classes.filter(Boolean).join(' ')
  }

export  function Navbar() {

  const [activePage, setActivePage] = useState<string>(navigation[0].href);  // the active page state
  
  const handlePageChange = (href: string) => {
    setActivePage(href);  // Update the active page state
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-left">
              <img
                alt="My DAPP"
                src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-3 ">
                {navigation.map((item) => (
                  <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => handlePageChange(item.href)}  // Actualizar estado cuando se hace clic
                  className={classNames(
                    item.href === activePage ? 'bg-gray-900 text-white text-3xl' : 'text-gray-300 hover:bg-gray-700 hover:text-white text-3xl',
                    'rounded-md px-3 py-2 text-sm font-medium',
                  )}
                  >
                  {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <FaUserTie size={50} color='#e2e2e2' />
        </div>
        
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              onClick={() => handlePageChange(item.href)} // Update the active page state on click
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.href === activePage ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}

export default Navbar;



/*
import React from 'react';

const Navbar = () => {
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        <div className="space-x-4">
            <a href="/" className="text-2xl font-bold hover:text-gray-400">MyDAPP</a>
            <a href="/register" className="text-2xl font-bold hover:text-gray-400">Register</a>
            <a href="/list" className="text-2xl font-bold hover:text-gray-400">List</a>
            <a href="/verify" className="text-2xl font-bold hover:text-gray-400">Verify</a>
        </div>
      </div>
    </nav>

  );
};

*/