'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUser } from '@/services/user';
import useUserStore from '@/zustand/useUserStore';


const schema = z.object({
    username: z.string()
        .nonempty({ message: "Username is required" })
        .min(3, { message: "Username must be greater than 3 characters!" }),
    email: z.string()
        .nonempty({ message: "Email is required!" })
        .email({ message: "Email is invalid!" })
});

export default function Myform() {
    const { user, setUser, clearUser } = useUserStore();
    // setUser("Bunnath");
    console.log(user);


    const { register, reset, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const handleAddUser = async (data) => {
        await insertUser(data);
        reset();
    };

    return (
        <div className="flex flex-col gap-10">
            <div>
                {user ? (
                    <>
                        <p>Welcome, {user.username}</p>
                        <button onClick={clearUser}>Logout</button>
                    </>
                ) : (
                    <button onClick={() => setUser({ username: 'john_doe' })}>
                        Login
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit(handleAddUser)} className='shadow-2xl p-10'>
                <h1 className='text-2xl'>My Testing Form</h1>
                <div className="flex flex-col w-full gap-5 mt-10">
                    <input
                        type="text"
                        placeholder='Username'
                        {...register("username")}
                        className='px-5 py-3 border rounded-2xl'
                    />
                    {errors.username && (
                        <p className='text-red-500'>{errors.username.message}</p>
                    )}

                    <input
                        type="text"
                        placeholder='Email'
                        {...register("email")}
                        className='px-5 py-3 border rounded-2xl'
                    />
                    {errors.email && (
                        <p className='text-red-500'>{errors.email.message}</p>
                    )}

                    <button
                        type='submit'
                        className='text-white bg-blue-600 rounded-2xl py-3'
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}
