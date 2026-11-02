// import { Toaster } from "sonner"
// import ReactQueryProvider from "./_components/react-query-provider"
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '../components/ui/sonner';
import NextAuthProvider from './components/next-auth-provider';
import ReactQueryProvider from './components/react-query.provider';
// import { ThemeProvider } from "./_components/theme-provider";
// import NextAuthProvider from "./_components/next-auth-provider";

export const Providers = ({ children , locale }: { children: React.ReactNode , locale :string }) => {
    return (
        <NextIntlClientProvider locale={locale}>
            <ReactQueryProvider>
            {/* <ThemeProvider> */}
            <NextAuthProvider>
                <Toaster richColors  position={locale === "en" ? "top-left" : "top-right"}/>
                {children}
            </NextAuthProvider>
            {/* </ThemeProvider> */}
            </ReactQueryProvider>
        </NextIntlClientProvider>
    );
};
