// 'use client';
import Card from '@/components/Card'
import Myform from '@/components/Myform'
// import useUserStore from '@/zustand/useUserStore'
import React, { Suspense } from 'react'
// import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

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

    // const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/users`, fetcher);
    // console.log(data);

    // const users = data;

    return (
        <main className='p-10 grid grid-cols-3 gap-20 content-start'>
            <div className='col-span-2 grid grid-cols-3 gap-7 content-start'>
                <Suspense fallback={<p>Loading</p>}>
                    {users && users.map((item, ind) => (
                        <Card key={ind} {...item} />
                    ))}
                </Suspense>
            </div>
            <Myform />
        </main>
    )
}
