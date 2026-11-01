// import { Toaster } from "sonner"
// import ReactQueryProvider from "./_components/react-query-provider"
import { NextIntlClientProvider } from 'next-intl';
// import { ThemeProvider } from "./_components/theme-provider";
// import NextAuthProvider from "./_components/next-auth-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <NextIntlClientProvider>
            {/* <ReactQueryProvider> */}
            {/* <ThemeProvider> */}
            {/* <NextAuthProvider> */}
            {/* <Toaster richColors /> */}
            {children}
            {/* </NextAuthProvider> */}
            {/* </ThemeProvider> */}
            {/* </ReactQueryProvider> */}
        </NextIntlClientProvider>
    );
};
