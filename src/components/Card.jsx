import React from 'react'

export default function Card(data) {
    return (
        <div className='w-full rounded-lg shadow-2xl bg-white flex flex-col p-5'>
            <h1 className='text-2xl'>{data.username}</h1>
            <p>{data.email}</p>
        </div>
    )
}
