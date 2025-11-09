'use client';

import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAllUsers();
                setUsers(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch users');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>; 

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <div className="grid gap-4">
                {users.map((user) => (
                    <div key={user.id || user.email} className="p-4 border rounded shadow">
                        <h2 className="font-bold">
                            {user.first_name} {user.last_name}
                            {(user.first_name_chinese || user.last_name_chinese) && (
                                <span className="ml-2">({user.first_name_chinese} {user.last_name_chinese})</span>
                            )}
                        </h2>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="mt-2">
                            <span className={`inline-block px-2 py-1 text-sm rounded ${user.role === 'employee'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'admin'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                {user.role}
                            </span>
                            {user.role === 'employee' && !user.is_approved && (
                                <span className="ml-2 text-sm text-orange-600">
                                    Pending Approval
                                </span>
                            )}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;
