import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Language } from '../hooks/useTranslation';
import { useToast } from './ToastContext';

export interface User {
  id: number;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  image: string | null;
}

interface UserContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  socket: Socket | null;
  unreadConvIds: Set<number>;
  markConvRead: (convId: number) => void;
  clearUnreadConvs: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'es' || saved === 'fr') return saved;
    } catch {}
    return 'en';
  });
  const { showToast } = useToast();

  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [unreadConvIds, setUnreadConvIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem('language', language); } catch {}
  }, [language]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Could not fetch user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Seed unread conv IDs from persisted DB notifications on login
  useEffect(() => {
    if (!user) { setUnreadConvIds(new Set()); return; }
    fetch('/api/users/notifications', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const ids: number[] = (data.messageNotifications ?? []).map(
          (n: { conversationId: number }) => n.conversationId,
        );
        if (ids.length) setUnreadConvIds(new Set(ids));
      })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      console.log('[Socket] No user, disconnecting');
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    if (socketRef.current) {
      console.log('[Socket] Already connected');
      return;
    }

    console.log('[Socket] Creating connection...');

    const newSocket = io({
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    return () => {
      console.log('[Socket] Cleanup');
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleFriendRequested = ({
      senderName,
    }: {
      userId: number;
      senderName?: string;
    }) => {
      showToast({
        message: `${senderName ?? 'Someone'} sent you a friend request`,
        type: 'info',
        location: 'TOP-RIGHT',
      });
    };

    socket.on('social.friend.requested', handleFriendRequested);
    return () => { socket.off('social.friend.requested', handleFriendRequested); };
  }, [socket, user, showToast]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleMessageReceived = ({
      conversationId,
      message,
    }: {
      conversationId: number;
      message: { sender: { displayName?: string | null; login?: string | null } };
    }) => {
      const currentPath = window.location.pathname;
      if (currentPath === `/messages/${conversationId}`) return;

      setUnreadConvIds(prev => new Set([...prev, conversationId]));

      const senderName =
        message.sender.displayName ?? message.sender.login ?? 'Someone';

      showToast({
        message: `New message from ${senderName}`,
        type: 'info',
        location: 'TOP-RIGHT',
      });
    };

    socket.on('social.message.received', handleMessageReceived);
    return () => { socket.off('social.message.received', handleMessageReceived); };
  }, [socket, user, showToast]);

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Logout failed');
      setUser(null);
    } catch (error) {
      console.error('Could not logout:', error);
    }
  };

  const markConvRead = useCallback((convId: number) => {
    setUnreadConvIds(prev => { const next = new Set(prev); next.delete(convId); return next; });
  }, []);

  const clearUnreadConvs = useCallback(() => setUnreadConvIds(new Set()), []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      logout,
      language,
      setLanguage,
      socket,
      unreadConvIds,
      markConvRead,
      clearUnreadConvs,
    }),
    [user, loading, language, socket, unreadConvIds, markConvRead, clearUnreadConvs],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used inside UserProvider');
  }

  return context;
}
