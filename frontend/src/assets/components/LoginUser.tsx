import { useState } from "react";


const LoginUser = ({ onLogin }) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  
  const resetFieldsLogin = () => {
    setUser("");
    setPassword("");
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 
    onLogin(user, password, resetFieldsLogin); // pass the user and password to the parent component in home
  };

return (
  
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-lg shadow-md dark:border dark:bg-gray-800/40 border border-white/10 ring-1 ring-white/30 dark:ring-gray-500 dark:border-gray-700 shadow-lg p-6">
        <h1 className="text-xl font-bold text-whitemd:text-2xl dark:text-white text-center">
          Sign in to your account
        </h1>
        <form className="space-y-4 mt-4"  onSubmit={handleSubmit}>
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-white dark:text-white">
              User
            </label>
            <input
              type="text"
              id="user"
              className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-900 text-black"
              placeholder="User"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-whitedark:text-gray-900">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white text-black "
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg px-5 py-2.5 text-center"
          >
            Sign in
          </button>
          <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
                </a>
          </div>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
          </p>
        </form>
      </div>

  );
};

export default LoginUser;
