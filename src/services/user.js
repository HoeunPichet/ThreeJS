"use server"
import { revalidateTag } from 'next/cache';
import React from 'react'

export const insertUser = async (data) => {
    try {
        const { username, email } = data;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
            }),
        });
        const result = await res.json();
        revalidateTag('users');
        return result;
    } catch (e) {
        return e;
    }
}
