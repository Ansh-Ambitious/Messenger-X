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
  onlineUsers: string[];
  typingUsers: string[];
  login: (token?: string) => void;
  logout: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  markMessageRead: (messageId: string) => void;
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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
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
    socket.on('user_online', ({ userId }: { userId: string }) => {
      setOnlineUsers((previous) => previous.includes(userId) ? previous : [...previous, userId]);
      setCurrentUser((previous) => previous.id === userId ? { ...previous, isOnline: true } : previous);
      setConversations((previous) => previous.map((conversation) => conversation.participant.id === userId
        ? { ...conversation, participant: { ...conversation.participant, isOnline: true } }
        : conversation));
    });
    socket.on('user_offline', ({ userId }: { userId: string }) => {
      setOnlineUsers((previous) => previous.filter((id) => id !== userId));
      setCurrentUser((previous) => previous.id === userId ? { ...previous, isOnline: false } : previous);
      setConversations((previous) => previous.map((conversation) => conversation.participant.id === userId
        ? { ...conversation, participant: { ...conversation.participant, isOnline: false } }
        : conversation));
    });
    socket.on('typing', ({ userId }: { userId: string }) => {
      setTypingUsers((previous) => previous.includes(userId) ? previous : [...previous, userId]);
    });
    socket.on('stop_typing', ({ userId }: { userId: string }) => {
      setTypingUsers((previous) => previous.filter((id) => id !== userId));
    });
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
      if (message.senderId !== currentUser.id) {
        socket.emit('message_delivered', { messageId: message.id });
      }
    });
    socket.on('message_delivered', ({ messageId }: { messageId: string }) => {
      setMessages((previous) => Object.fromEntries(Object.entries(previous).map(([conversationId, items]) => [
        conversationId,
        items.map((item) => item.id === messageId ? { ...item, status: 'delivered' as const } : item),
      ])));
    });
    socket.on('message_read', ({ messageId }: { messageId: string }) => {
      setMessages((previous) => Object.fromEntries(Object.entries(previous).map(([conversationId, items]) => [
        conversationId,
        items.map((item) => item.id === messageId ? { ...item, status: 'read' as const } : item),
      ])));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setOnlineUsers([]);
      setTypingUsers([]);
    };
  }, [isAuthenticated]);

  const login = (token?: string) => {
    if (token) {
      sessionStorage.setItem('messenger-x-token', token);
    }
    sessionStorage.setItem('messenger-x-auth', 'true');
    setIsAuthenticated(true);
  };

  const setTyping = (conversationId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit(isTyping ? 'typing' : 'stop_typing', { conversationId });
  };

  const markMessageRead = (messageId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('message_read', { messageId });
    setMessages((previous) => Object.fromEntries(Object.entries(previous).map(([conversationId, items]) => [
      conversationId,
      items.map((item) => item.id === messageId ? { ...item, status: 'read' as const } : item),
    ])));
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
      onlineUsers,
      typingUsers,
      login,
      logout,
      sendMessage,
      setTyping,
      markMessageRead,
      updateUser,
      pushNotifications,
      setPushNotifications,
      darkMode,
      setDarkMode,
    }),
    [currentUser, conversations, messages, isAuthenticated, socketStatus, onlineUsers, typingUsers, pushNotifications, darkMode],
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
