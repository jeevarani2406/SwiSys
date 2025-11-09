import { Outfit, Comfortaa, Lexend } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import { AuthProvider } from "../contexts/AuthContext";

// Load Google fonts with CSS variable names
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "SwiSys - Automotive Electronics Communication Solutions",
  description: "Leading CAN Bus, OBD II, and SAE J1939 solutions for In-Vehicle Networking (IVN). Bridging automotive communication with IoT innovation.",
  icons: {
    icon: "https://swisystem.com/wp-content/uploads/2020/05/swisys-logo-2.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${comfortaa.variable} ${lexend.variable} antialiased`}
      >
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
