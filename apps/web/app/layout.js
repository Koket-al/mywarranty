import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Ewnet (እውነት) — Digital Warranty Management Platform',
  description: 'Ethiopia-first digital warranty platform for electronics and technology retailers'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

