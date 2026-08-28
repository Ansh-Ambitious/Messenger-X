import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { CONVERSATIONS, CURRENT_USER, MESSAGES } from '../data/mockData';
import type { Conversation, Message, User } from '../types';
import { createSocket } from '../utils/socket';

interface AppContextValue {
  currentUser: User;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  isAuthenticated: boolean;
  socketStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  login: (token?: string) => void;
  logout: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  updateUser: (updates: Partial<User>) => void;
  pushNotifications: boolean;
  setPushNotifications: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('messenger-x-auth') === 'true',
  );
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [messages, setMessages] = useState(MESSAGES);
  const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('messenger-x-token');
    if (!isAuthenticated || !token) {
      setSocketStatus('disconnected');
      return;
    }

    const socket: Socket = createSocket(token);
    socketRef.current = socket;
    setSocketStatus('connecting');
    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    socket.on('connect_error', () => setSocketStatus('error'));
    socket.on('session:identified', ({ userId }: { userId: string }) => {
      setCurrentUser((previous) => ({ ...previous, id: userId }));
      console.info(`Real-time session established for ${userId}`);
    });
    socket.on('receive_message', (message: { id: string; conversationId: string; senderId: string; content: string; status: Message['status']; createdAt: string }) => {
      const receivedMessage: Message = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        type: 'text',
        status: message.status,
      };

      setMessages((previous) => {
        const existing = previous[message.conversationId] ?? [];
        if (existing.some((item) => item.id === receivedMessage.id)) return previous;
        return { ...previous, [message.conversationId]: [...existing, receivedMessage] };
      });
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === message.conversationId
            ? { ...conversation, lastMessage: message.content, lastMessageTime: receivedMessage.timestamp }
            : conversation,
        ),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const login = (token?: string) => {
    if (token) {
      sessionStorage.setItem('messenger-x-token', token);
    }
    sessionStorage.setItem('messenger-x-auth', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('messenger-x-auth');
    sessionStorage.removeItem('messenger-x-token');
  };

  const sendMessage = (conversationId: string, content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !socketRef.current?.connected) return;

    socketRef.current.emit(
      'send_message',
      { conversationId, content: trimmedContent },
      (result: { ok: boolean; error?: string }) => {
        if (!result.ok) console.error(result.error ?? 'Unable to send message');
      },
    );
  };

  const updateUser = (updates: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const value = useMemo(
    () => ({
      currentUser,
      conversations,
      messages,
      isAuthenticated,
      socketStatus,
      login,
      logout,
      sendMessage,
      updateUser,
      pushNotifications,
      setPushNotifications,
      darkMode,
      setDarkMode,
    }),
    [currentUser, conversations, messages, isAuthenticated, socketStatus, pushNotifications, darkMode],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
