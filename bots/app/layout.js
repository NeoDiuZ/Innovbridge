import { Inter } from 'next/font/google';
import './globals.css';
import ViewportHandler from './components/ViewportHandler';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>CoachBot - Your AI Coach</title>
        <meta name="description" content="Get personalized guidance and support from our AI coach to help you achieve your goals and unlock your potential." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-title" content="Innovbridge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-secondary-50 font-sans antialiased">
        <ViewportHandler />
        {children}
      </body>
    </html>
  );
}