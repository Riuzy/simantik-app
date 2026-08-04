'use client';

import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconDownload, IconRestore, IconZoomIn, IconZoomOut } from '@tabler/icons-react';

interface ScreenshotViewerProps {
  src: string;
  alt?: string;
  opened: boolean;
  onClose: () => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

function downloadFileName(src: string, alt: string): string {
  const fromPath = src.split('/').pop();
  if (fromPath) return fromPath;
  return `${alt || 'screenshot'}.png`;
}

async function downloadScreenshot(src: string, alt: string): Promise<void> {
  const response = await fetch(src);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadFileName(src, alt);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ScreenshotViewer({ src, alt = 'Execution screenshot', opened, onClose }: ScreenshotViewerProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  useEffect(() => {
    if (!opened) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [opened]);

  const zoomIn = () => setScale((s) => Math.min(s * 1.25, MAX_SCALE));
  const zoomOut = () => setScale((s) => Math.max(s / 1.25, MIN_SCALE));
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.startOffsetX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.startOffsetY + (e.clientY - dragRef.current.startY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  return (
    <Modal opened={opened} onClose={onClose} fullScreen padding={0} radius={0} transitionProps={{ transition: 'fade', duration: 150 }}>
      <Stack gap={0} style={{ height: '100%' }}>
        <Group justify="space-between" px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Text size="sm" fw={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {alt}
          </Text>
          <Group gap="xs">
            <Text size="xs" c="dimmed">{Math.round(scale * 100)}%</Text>
            <Tooltip label="Zoom out">
              <ActionIcon variant="light" onClick={zoomOut} disabled={scale <= MIN_SCALE} aria-label="Zoom out">
                <IconZoomOut size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Zoom in">
              <ActionIcon variant="light" onClick={zoomIn} disabled={scale >= MAX_SCALE} aria-label="Zoom in">
                <IconZoomIn size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Reset view">
              <ActionIcon variant="light" onClick={resetView} disabled={scale === 1 && offset.x === 0 && offset.y === 0} aria-label="Reset view">
                <IconRestore size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Download">
              <ActionIcon variant="light" onClick={() => void downloadScreenshot(src, alt)} aria-label="Download screenshot">
                <IconDownload size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            flex: 1,
            overflow: 'hidden',
            cursor: scale > 1 ? 'grab' : 'default',
            touchAction: 'none',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </Stack>
    </Modal>
  );
}
