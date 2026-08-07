'use client';

import { useState, useCallback } from 'react';
import { Box, Stack, Text, Button, Group, Avatar, FileInput, Progress, Alert } from '@mantine/core';
import { IconPhoto, IconTrash, IconUpload, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface AvatarUploadProps {
  currentAvatar: string | null;
  userName: string;
  onUpload: (file: File) => Promise<{ avatarUrl: string }>;
  isLoading?: boolean;
}

export function AvatarUpload({ currentAvatar, userName, onUpload, isLoading = false }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const initials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      notifications.show({
        title: 'Error',
        message: 'Only JPG, PNG, and WEBP formats are supported.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    if (file.size > maxSize) {
      notifications.show({
        title: 'Error',
        message: 'File size must not exceed 2 MB.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(30);
      const result = await onUpload(selectedFile);
      setUploadProgress(100);
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      
      notifications.show({
        title: 'Success',
        message: 'Profile picture uploaded successfully.',
        color: 'green',
      });
    } catch (error) {
      setUploadProgress(0);
      notifications.show({
        title: 'Error',
        message: 'Failed to upload profile picture.',
        color: 'red',
      });
    }
  }, [selectedFile, onUpload]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setSelectedFile(null);
  }, []);

  const displayUrl = previewUrl || currentAvatar;
  const hasChanges = selectedFile !== null;

  return (
    <Stack gap="md">
      <Box style={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar
          src={displayUrl}
          size={120}
          radius="xl"
          color="blue"
        >
          {initials}
        </Avatar>
      </Box>

      <FileInput
        label="Profile Picture"
        placeholder="Click to select or drag and drop"
        leftSection={<IconPhoto size={14} />}
        value={selectedFile}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        clearable
      />

      <Text size="xs" c="dimmed">
        Supported formats: JPG, JPEG, PNG, WEBP. Maximum file size: 2 MB.
      </Text>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Progress value={uploadProgress} animated />
      )}

      <Group justify="space-between">
        <Group>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconUpload size={16} />}
            onClick={handleUpload}
            loading={isLoading || uploadProgress > 0}
            disabled={!hasChanges || isLoading}
          >
            Upload Photo
          </Button>
          <Button
            variant="light"
            color="red"
            size="sm"
            leftSection={<IconTrash size={16} />}
            onClick={handleRemove}
            disabled={!hasChanges}
          >
            Remove Photo
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
