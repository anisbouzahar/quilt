import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Brand } from '@/components/brand';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <Brand /> },
    links: [
      { text: 'The idea', url: '/#the-idea' },
      { text: 'Documentation', url: '/docs' },
      { text: 'Project status', url: '/docs/project-status' },
    ],
  };
}
