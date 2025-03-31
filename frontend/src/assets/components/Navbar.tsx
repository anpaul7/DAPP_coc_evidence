
import { Disclosure, DisclosureButton } from '@headlessui/react'
import { Bars3Icon,  XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FcBusinessman } from "react-icons/fc";
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useDisconnect } from 'wagmi';

const navigation = [
  { name: 'Home', href: '/', current: true, roles: ['administrator', 'forense','judge','user' ] },
  { name: 'Acquisition', href: '/acquisition', roles: ['administrator','forense'] },
  { name: 'Preservation', href: '/preservation', roles: ['administrator', 'forense', ] },
  { name: 'Analysis', href: '/analysis', roles: ['administrator', 'forense', ] }, 
  { name: 'Presentation', href: '/presentation', roles: ['administrator','judge', ] },   
]

function classNames(...classes: (string | boolean)[]): string {
    return classes.filter(Boolean).join(' ')
  }

interface NavbarProps {
  tokenAuth: string | null;
  setTokenAuth: React.Dispatch<React.SetStateAction<string | null>>;
  user: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
  role: string | null;
  setRole: React.Dispatch<React.SetStateAction<string | null>>;
}

export  function Navbar({ 
  tokenAuth, setTokenAuth, user, setUser, role, setRole }: NavbarProps) {

  const location = useLocation(); // Get the current location URL
  const navigate = useNavigate();
  const { disconnect } = useDisconnect();
//----------------------------------------

const handleLogout = () => {
  console.log("Close session authentication ------");
  disconnect?.();//disconnect wallet
  localStorage.removeItem("authToken"); // Delete the authentication token
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("walletAddress");
  setTokenAuth(null);
  setUser(null);
  setRole(null);
  navigate("/"); // Redirect to the home page

};
//--------------------------------------
//-- Check if the token has expired
  useEffect(() => {
    if (tokenAuth) {
      try {
        const decoded = jwtDecode<JwtPayload>(tokenAuth);

        if (!decoded.exp) {
          console.error("The 'exp' claim is missing in the token.");
          handleLogout();
          return;
        }
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const timeLeft = expirationTime - Date.now();

        if (timeLeft > 0) {
          const timeoutId = setTimeout(() => {
            handleLogout();
          }, timeLeft);
          return () => clearTimeout(timeoutId);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout();
      }
    }
  }, [tokenAuth]);
//----------------------------------------
  return (
    <Disclosure as="nav" className="bg-[#012068]">
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
            
              
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-3 ">
                {navigation
                  .filter(item => {
                    if (item.name === 'Home') {
                      return true; 
                    }
                    return role ? item.roles.includes(role) : false; 
                  })
                  .map((item) => (
                  <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.href === location.pathname ? 'bg-gray-900 text-white text-1xl' : 'text-gray-300 hover:bg-gray-700 hover:text-white text-1xl',
                    'rounded-md px-3 py-2 text-lg font-medium',
                  )}
                  >
                  {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <FcBusinessman size={60} />
          <div>
          
            {tokenAuth ? (
              
              <>
               
                <span className="text-white font-semibold">{user}</span>
               
                <button onClick={handleLogout} className="ml-4 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 font-semibold">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/" className="ml-4 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 font-semibold">
                Login
              </Link>
            )}
          </div>
        </div>

      </div>
      {/*----------------------------------------*/}
      
    </Disclosure>
  )
}

export default Navbar;