import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CONVERSATIONS, CURRENT_USER, MESSAGES } from '../data/mockData';
import type { Conversation, Message, User } from '../types';

interface AppContextValue {
  currentUser: User;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  isAuthenticated: boolean;
  login: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [messages, setMessages] = useState(MESSAGES);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const login = () => setIsAuthenticated(true);

  const logout = () => {
    setIsAuthenticated(false);
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      type: 'text',
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: content.trim(),
              lastMessageTime: newMessage.timestamp,
              unreadCount: 0,
            }
          : conv,
      ),
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
      login,
      logout,
      sendMessage,
      updateUser,
      pushNotifications,
      setPushNotifications,
      darkMode,
      setDarkMode,
    }),
    [currentUser, conversations, messages, isAuthenticated, pushNotifications, darkMode],
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
