"use server"

import { LoginResponseData } from "../types/auth";


export async function loginAction({ username, password }: { username: string, password: string }) {
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
            username,
            password,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data: ApiResponse<LoginResponseData> = await res.json();
    if (!data.status) {
        throw new Error(data.message);
    }

    return data.payload;
}