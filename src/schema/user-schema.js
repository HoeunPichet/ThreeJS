import { z } from "zod"

export const UserScheme = z.object({
    username: z.string()
        .nonempty({ message: "Username is required!" })
        .min(3, { message: "Username must be greater than 3 characters!" }),
    email: z.string()
        .nonempty({ message: "Email is required!" })
        .email({ message: "Email is invalid!" })
})
