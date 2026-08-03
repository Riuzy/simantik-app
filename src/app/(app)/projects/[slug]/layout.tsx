'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Center, Loader } from '@mantine/core';
import { useProjectBySlug } from '../../../../features/projects/hooks';
import { useProjectStore } from '../../../../stores/project-store';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const { data: project, isLoading } = useProjectBySlug(slug);
  const setSelectedProject = useProjectStore((s) => s.setSelectedProject);

  useEffect(() => {
    if (project) {
      setSelectedProject({
        id: project.id,
        code: project.code,
        name: project.name,
        slug: project.slug,
      });
    }
  }, [project, setSelectedProject]);

  if (isLoading) {
    return <Center h={300}><Loader /></Center>;
  }

  if (!project) {
    return <Center h={300}>Project not found</Center>;
  }

  return <>{children}</>;
}
