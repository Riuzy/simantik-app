'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function BlankLayout({ children }: Props) {
  return <>{children}</>;
}
