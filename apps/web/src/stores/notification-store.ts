import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

interface NotificationStore {
  count: number;
  items: Notification[];
  setCount: (count: number) => void;
  setItems: (items: Notification[]) => void;
  addItem: (item: Notification) => void;
  markRead: (id: string) => void;
  decrementCount: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  count: 0,
  items: [],
  setCount: (count) => set({ count }),
  setItems: (items) => set({ items }),
  addItem: (item) => set((s) => ({ items: [item, ...s.items], count: s.count + 1 })),
  markRead: (id) => set((s) => ({
    items: s.items.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
    count: Math.max(0, s.count - 1),
  })),
  decrementCount: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
}));
