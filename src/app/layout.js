// Redux
import StoreProvider from "./StoreProvider";

// Auth0
import { UserProvider } from "@auth0/nextjs-auth0/client";

// Fonts
import { Goldman, Geist_Mono } from "next/font/google";

// Styles
import "@/css/globals.css";
import "@/css/colors.css";

const goldman = Goldman({
  variable: "--font-goldman",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Speed Sync",
  // description: "Generated by create next app",
};

const RootLayout = async ({ children }) => {
  return (
    <UserProvider>
      <StoreProvider>
        <html lang="en">
          <body className={`${geistMono.variable} ${goldman.variable}`}>
            <main>{children}</main>
          </body>
        </html>
      </StoreProvider>
    </UserProvider>
  );
};

export default RootLayout;
