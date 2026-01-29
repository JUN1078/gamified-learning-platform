import { create } from 'zustand';
import { ToastNotification, ModalState } from '@/types';

interface UIState {
  toasts: ToastNotification[];
  modal: ModalState;
  sidebarOpen: boolean;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  openModal: (type: ModalState['type'], data?: any) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  modal: { isOpen: false, type: null },
  sidebarOpen: true,

  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    set({ toasts: [...get().toasts, newToast] });

    // Auto-remove toast after duration
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  openModal: (type, data) => {
    set({ modal: { isOpen: true, type, data } });
  },

  closeModal: () => {
    set({ modal: { isOpen: false, type: null, data: undefined } });
  },

  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen });
  },

  setSidebarOpen: (sidebarOpen) => {
    set({ sidebarOpen });
  },
}));
