import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, socialLogin, enterGuestMode } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            await login(email, password);
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <LogIn className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your tasks
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 text-lg"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 text-lg"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-primary-600 py-3 px-4 text-lg font-semibold text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        >
                            Sign in
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => socialLogin('google')}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 20.4501C16.8913 20.4501 20.9715 17.1326 22.4636 12.7828C22.6109 12.3537 22.6882 11.9052 22.6882 11.4501H12.0003V15.9182H17.9882C17.7497 16.6364 17.2764 17.2654 16.6548 17.7303C15.4258 18.6493 13.8427 19.191 12.0003 19.191C8.28186 19.191 5.16669 16.5135 4.02022 13.068C3.8966 12.7093 3.82935 12.3364 3.82935 11.9546C3.82935 11.5728 3.8966 11.1999 4.02022 10.8412C5.16669 7.39566 8.28186 4.71822 12.0003 4.71822C14.0758 4.71822 15.9387 5.44976 17.3976 6.66696L20.8432 3.22143C18.4987 1.0368 15.4208 -0.190918 12.0003 -0.190918C7.14361 -0.190918 2.87116 2.50854 0.587891 6.55038C-0.195964 7.9379 -0.195964 9.60195 0.587891 10.9895C2.87116 15.0313 7.14361 17.7308 12.0003 17.7308V20.4501Z" fill="#EA4335" /><path d="M12.0003 20.4501C16.8913 20.4501 20.9715 17.1326 22.4636 12.7828H22.6882V11.4501H12.0003V15.9182H17.9882C17.7497 16.6364 17.2764 17.2654 16.6548 17.7303C15.4258 18.6493 13.8427 19.191 12.0003 19.191C8.28186 19.191 5.16669 16.5135 4.02022 13.068V10.8412C5.16669 7.39566 8.28186 4.71822 12.0003 4.71822C14.0758 4.71822 15.9387 5.44976 17.3976 6.66696L20.8432 3.22143C18.4987 1.0368 15.4208 -0.190918 12.0003 -0.190918V20.4501Z" fill="#34A853" /><path d="M4.02022 13.068C3.8966 12.7093 3.82935 12.3364 3.82935 11.9546C3.82935 11.5728 3.8966 11.1999 4.02022 10.8412C5.16669 7.39566 8.28186 4.71822 12.0003 4.71822V-0.190918C7.14361 -0.190918 2.87116 2.50854 0.587891 6.55038C-0.195964 7.9379 -0.195964 9.60195 0.587891 10.9895C2.87116 15.0313 7.14361 17.7308 12.0003 17.7308V13.068C12.0003 13.068 4.02022 13.068 4.02022 13.068Z" fill="#FBBC05" /><path d="M12.0003 20.4501C16.8913 20.4501 20.9715 17.1326 22.4636 12.7828L22.6882 11.4501H12.0003V15.9182H17.9882C17.7497 16.6364 17.2764 17.2654 16.6548 17.7303C15.4258 18.6493 13.8427 19.191 12.0003 19.191C8.28186 19.191 5.16669 16.5135 4.02022 13.068C3.8966 12.7093 3.82935 12.3364 3.82935 11.9546C3.82935 11.5728 3.8966 11.1999 4.02022 10.8412C5.16669 7.39566 8.28186 4.71822 12.0003 4.71822C14.0758 4.71822 15.9387 5.44976 17.3976 6.66696L20.8432 3.22143C18.4987 1.0368 15.4208 -0.190918 12.0003 -0.190918C7.14361 -0.190918 2.87116 2.50854 0.587891 6.55038C-0.195964 7.9379 -0.195964 9.60195 0.587891 10.9895C2.87116 15.0313 7.14361 17.7308 12.0003 17.7308V20.4501Z" fill="#4285F4" /></svg>
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={() => socialLogin('apple')}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-black text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M12.96 3.75039C13.89 2.65039 15.17 1.95039 16.48 2.05039C16.94 3.65039 16.34 5.37039 15.44 6.38039C14.56 7.36039 13.19 8.03039 11.95 7.92039C11.45 6.27039 12.09 4.70039 12.96 3.75039ZM16.89 19.3804C15.98 20.7304 14.88 22.0904 13.43 22.0904C12.01 22.0904 11.58 21.2304 10.02 21.2304C8.42004 21.2304 8.01004 22.0604 6.70004 22.0904C5.29004 22.0904 4.07004 20.6104 3.19004 19.3304C1.39004 16.7104 0.0500391 11.9304 1.90004 8.70039C2.82004 7.10039 4.46004 6.09039 6.09004 6.09039C7.63004 6.09039 8.52004 6.95039 9.53004 6.95039C10.51 6.95039 11.23 6.05039 12.8 6.05039C13.44 6.05039 15.22 6.28039 16.35 7.94039C16.25 8.00039 13.31 9.71039 13.36 13.2304C13.38 16.0304 15.82 18.0604 16.89 19.3804Z" /></svg>
                            Continue with Apple
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">or</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => { enterGuestMode(); navigate('/'); }}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <div className="text-sm">
                        <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div >
        </div >
    );
}
