export const HEADERS = {
    JsonBody: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    AcceptLanguage: (locale: string) => ({
        "Accept-Language": `${locale}`
    }),
    authorize: (token: string) => ({
        "Authorization": `Bearer ${token}`,
    })
}