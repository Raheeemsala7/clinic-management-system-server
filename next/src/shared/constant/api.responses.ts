export const RESPONSES = {
    unauthorized: {
        "status": false as const ,
        "code": 401,
        "message": "No token provided."
    },
} as const