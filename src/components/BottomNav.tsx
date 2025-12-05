import { NavLink } from 'react-router-dom';
import { ListTodo, PlusCircle, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
    const navItems = [
        { to: '/', icon: ListTodo, label: 'Tasks' },
        { to: '/new-note', icon: PlusCircle, label: 'New Note' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            clsx(
                                'flex flex-col items-center justify-center w-full h-full space-y-1',
                                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                            )
                        }
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
