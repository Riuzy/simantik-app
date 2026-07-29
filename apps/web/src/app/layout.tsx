import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/nprogress/styles.css';
import { Providers } from '../providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SIMANTIK',
  description: 'Software Testing Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
