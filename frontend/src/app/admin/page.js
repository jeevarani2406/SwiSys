'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from '../../components/pages/AdminDashboard';

export default function AdminPage() {
    const { user, loading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !hasRole('admin'))) {
            router.push('/login');
        }
    }, [user, loading, hasRole, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!user || !hasRole('admin')) {
        return null;
    }

    return <AdminDashboard />;
}
