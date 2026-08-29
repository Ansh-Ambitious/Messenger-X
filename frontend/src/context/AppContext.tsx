import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { CONVERSATIONS, CURRENT_USER, MESSAGES } from '../data/mockData';
import type { Conversation, Message, User } from '../types';
import { createSocket } from '../utils/socket';

interface AppContextValue {
  currentUser: User;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Record<string, Message[]>;
  isAuthenticated: boolean;
  socketStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  onlineUsers: string[];
  typingUsers: string[];
  login: (token?: string) => void;
  logout: () => void;
  clearError: () => void;
  setSelectedConversation: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, content: string) => void;
  loadMessages: (conversationId: string, before?: string) => Promise<{ hasMore: boolean; nextCursor: string | null }>;
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState(MESSAGES);
  const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const selectedConversation = conversations.find(({ id }) => id === selectedConversationId) ?? null;

  const clearError = () => setErrorMessage(null);

  const setUserFacingError = (message: string | null | undefined) => {
    if (!message) {
      setErrorMessage(null);
      return;
    }

    setErrorMessage(message);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('messenger-x-token');
    if (!isAuthenticated || !token) {
      setSocketStatus('disconnected');
      setErrorMessage('Session expired');
      return;
    }

    const socket: Socket = createSocket(token);
    socketRef.current = socket;
    setSocketStatus('connecting');
    setErrorMessage('Reconnecting...');

    socket.on('connect', () => {
      setSocketStatus('connected');
      setErrorMessage(null);
    });
    socket.on('disconnect', (reason) => {
      setSocketStatus('disconnected');
      if (reason === 'io client disconnect') return;
      setUserFacingError('Connection lost');
    });
    socket.on('connect_error', (error: Error & { message?: string }) => {
      const message = error?.message ?? 'Connection lost';
      setSocketStatus('error');
      if (/invalid|expired|authentication|token/i.test(message)) {
        setUserFacingError('Session expired');
        return;
      }
      setUserFacingError('Connection lost');
    });
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
    setErrorMessage(null);
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
    setSocketStatus('disconnected');
    setErrorMessage('Session expired');
    sessionStorage.removeItem('messenger-x-auth');
    sessionStorage.removeItem('messenger-x-token');
  };

  const setSelectedConversation = (conversationId: string | null) => {
    setSelectedConversationId(conversationId);
  };

  const sendMessage = (conversationId: string, content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    if (!socketRef.current?.connected) {
      setUserFacingError('Connection lost');
      return;
    }

    socketRef.current.emit(
      'send_message',
      { conversationId, content: trimmedContent },
      (result: { ok: boolean; error?: string }) => {
        if (!result.ok) {
          const nextMessage = result.error ?? 'Unable to send message';
          setUserFacingError(nextMessage === 'Conversation not found' ? 'User not found' : nextMessage);
          return;
        }

        setErrorMessage(null);
      },
    );
  };

  const loadMessages = async (conversationId: string, before?: string) => {
    const token = sessionStorage.getItem('messenger-x-token');
    if (!token) return { hasMore: false, nextCursor: null };

    const query = new URLSearchParams({ limit: '30' });
    if (before) query.set('before', before);
    const response = await fetch(`http://127.0.0.1:5000/api/chats/${conversationId}/messages?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as { message?: string };
      const message = errorBody.message ?? 'Unable to load messages';
      if (/invalid|expired|authentication/i.test(message)) {
        setUserFacingError('Session expired');
        throw new Error('Session expired');
      }
      if (/user not found|conversation not found/i.test(message)) {
        setUserFacingError('User not found');
        throw new Error('User not found');
      }
      setUserFacingError(message);
      throw new Error(message);
    }

    const data = (await response.json()) as {
      messages: Array<{ _id: string; conversationId: string; senderId: string; content: string; status: Message['status']; createdAt: string }>;
      hasMore: boolean;
      nextCursor: string | null;
    };
    const loadedMessages: Message[] = data.messages.map((message) => ({
      id: message._id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      type: 'text',
      status: message.status,
    }));

    setMessages((previous) => {
      const existing = before ? (previous[conversationId] ?? []) : [];
      const combined = before ? [...loadedMessages, ...existing] : loadedMessages;
      const unique = combined.filter((message, index, all) => all.findIndex((item) => item.id === message.id) === index);
      return { ...previous, [conversationId]: unique };
    });
    return { hasMore: data.hasMore, nextCursor: data.nextCursor };
  };

  const updateUser = (updates: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const value = useMemo(
    () => ({
      currentUser,
      conversations,
      selectedConversation,
      messages,
      isAuthenticated,
      socketStatus,
      connectionStatus: socketStatus,
      errorMessage,
      onlineUsers,
      typingUsers,
      login,
      logout,
      clearError,
      setSelectedConversation,
      sendMessage,
      loadMessages,
      setTyping,
      markMessageRead,
      updateUser,
      pushNotifications,
      setPushNotifications,
      darkMode,
      setDarkMode,
    }),
    [currentUser, conversations, selectedConversation, messages, isAuthenticated, socketStatus, errorMessage, onlineUsers, typingUsers, pushNotifications, darkMode],
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
