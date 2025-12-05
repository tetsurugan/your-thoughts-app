import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-sm overflow-hidden relative">
                <Outlet />
            </main>
            <div className="max-w-md mx-auto fixed bottom-0 left-0 right-0 pointer-events-none">
                <div className="pointer-events-auto">
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
