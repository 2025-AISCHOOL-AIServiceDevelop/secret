import { useEffect } from 'react';
import { create } from 'zustand';

/**
 * Toast Store - 전역 토스트 메시지 관리
 */
export const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast]
    }));
    
    // 자동 삭제
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },
  
  // 편의 메서드
  success: (message, duration) => get().addToast(message, 'success', duration),
  error: (message, duration) => get().addToast(message, 'error', duration),
  warning: (message, duration) => get().addToast(message, 'warning', duration),
  info: (message, duration) => get().addToast(message, 'info', duration),
}));

/**
 * Toast Component - 개별 토스트 메시지
 */
function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration);
    
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);
  
  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: '✅',
      border: 'border-green-600'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-500',
      icon: '❌',
      border: 'border-red-600'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: '⚠️',
      border: 'border-yellow-600'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
      icon: 'ℹ️',
      border: 'border-blue-600'
    }
  };
  
  const style = typeStyles[toast.type] || typeStyles.info;
  
  return (
    <div
      className={`${style.bg} ${style.border} border-2 rounded-xl px-4 py-3 shadow-lg transform transition-all duration-300 animate-slideIn flex items-center gap-3 min-w-[300px] max-w-[500px]`}
    >
      <div className="text-2xl flex-shrink-0">{style.icon}</div>
      <div className="flex-1 text-white font-bold text-sm">{toast.message}</div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white hover:text-gray-200 transition-colors flex-shrink-0 text-lg"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * ToastContainer - 토스트 메시지 컨테이너
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;

