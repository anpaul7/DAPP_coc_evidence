
import { Disclosure, DisclosureButton } from '@headlessui/react'
import { Bars3Icon,  XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaUserTie } from "react-icons/fa6";
import { FcBusinessman } from "react-icons/fc";

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

interface NavbarProps {
  tokenAuth: string | null;
  setTokenAuth: React.Dispatch<React.SetStateAction<string | null>>;
  user: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
}

export  function Navbar({ tokenAuth, setTokenAuth, user, setUser }: NavbarProps) {
  
  console.log("Navbar tokenAuth:", tokenAuth);
  console.log("Navbar setTokenAuth:", setTokenAuth);

 // const [tokenAuth, setTokenAuth] = useState<string | null>(localStorage.getItem("authToken"));
  const location = useLocation(); // Get the current location URL
  const navigate = useNavigate();

//----------------------------------------

const handleLogout = () => {
  localStorage.removeItem("authToken"); // Delete the authentication token
  localStorage.removeItem("user");
  setTokenAuth(null);
  setUser(null);
  navigate("/"); // Redirigir al inicio de sesión
};
//----------------------------------------
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
            
              
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-3 ">
                {navigation.map((item) => (
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