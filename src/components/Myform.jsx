import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { revalidateTag } from 'next/cache'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
    username: z.string()
        .nonempty({ message: "Username is required!" })
        .min(3, { message: "Username must be greater than 3 characters!" }),
    email: z.string()
        .nonempty({ message: "Email is required!" })
        .email({ message: "Email is invalid!" })
});

export default function Myform() {
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
    const handleAddUser = async (data) => {
        "use server"
        const { username, email } = data;
        const users = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    email: email
                })
            }
        )

        revalidateTag("users")
    }

    return (
        <form onSubmit={handleSubmit(handleAddUser)} className='shadow-2xl p-10'>
            <h1 className='text-2xl'>My Testing Form</h1>
            <div className="flex flex-col w-full gap-5 mt-10">
                <input type="text" name="" id="" className='px-5 py-3 border rounded-2xl' placeholder='Username' />
                {errors?.username?.message && (
                    <p className='text-red-500'>{errors?.username?.message}</p>
                )}
                <input type="text" name="" id="" className='px-5 py-3 border rounded-2xl' placeholder='Email' />
                {errors?.email?.message && (
                    <p className='text-red-500'>{errors?.email?.message}</p>
                )}
                <button type='submit' className='text-white bg-blue-600 rounded-2xl py-3'>Submit</button>
            </div>
        </form>
    )
}
