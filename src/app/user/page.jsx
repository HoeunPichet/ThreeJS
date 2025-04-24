import Card from '@/components/Card'
import Myform from '@/components/Myform'
import React from 'react'

export default async function UserPage() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        cache: 'force-cache',
        next: {
            tags: ["users"]
        }
    });
    const data = await res.json();
    const users = data?.payload;
    console.log(users);

    return (
        <main className='p-10 grid grid-cols-3 gap-20 content-start'>
            <div className='col-span-2 grid grid-cols-3 gap-7 content-start'>
                {users && users.map((item, ind) => (
                    <Card key={ind} {...item} />
                ))}
            </div>
            <Myform />
        </main>
    )
}
