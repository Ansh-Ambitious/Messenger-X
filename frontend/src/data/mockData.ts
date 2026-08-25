import type { Conversation, Message, User } from '../types';

export const CURRENT_USER: User = {
  id: 'user-1',
  name: 'Alex Rivers',
  username: 'alexrivers',
  email: 'alex.rivers@nexuschat.com',
  avatar: 'https://www.figma.com/api/mcp/asset/1a053b2b-bc98-41e2-aeb4-97c5ead6cffb.png',
  bio: 'Product designer passionate about minimalist interfaces.',
};

export const USERS: User[] = [
  {
    id: 'user-2',
    name: 'Sarah Jenkins',
    username: 'sarahjenkins',
    email: 'sarah.jenkins@nexuschat.com',
    avatar: 'https://www.figma.com/api/mcp/asset/f21b3db1-3a5d-4f02-b063-dbc5a497d326.png',
    isOnline: true,
  },
  {
    id: 'user-3',
    name: 'Marketing Team',
    username: 'marketing',
    email: 'marketing@nexuschat.com',
    isOnline: false,
  },
  {
    id: 'user-4',
    name: 'James Wilson',
    username: 'jameswilson',
    email: 'james.wilson@nexuschat.com',
    avatar: 'https://www.figma.com/api/mcp/asset/c6bb4a87-9ffc-45e4-98bc-edc21bdb067e.png',
    isOnline: false,
  },
  {
    id: 'user-5',
    name: 'Project Alpha Sync',
    username: 'projectalpha',
    email: 'alpha@nexuschat.com',
    isOnline: false,
  },
  {
    id: 'user-6',
    name: 'Alex Rivers',
    username: 'alexrivers',
    email: 'alex.rivers@nexuschat.com',
    avatar: 'https://www.figma.com/api/mcp/asset/5a35acb5-1953-4871-b6bd-35f2b91193ad.png',
    isOnline: true,
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: USERS[0],
    lastMessage: 'Are we still on for the design review later today? I have the files ready.',
    lastMessageTime: '9:41 AM',
    unreadCount: 3,
    isActive: true,
  },
  {
    id: 'conv-2',
    participant: USERS[1],
    lastMessage: "David: The new campaign assets look fantastic. Let's proceed.",
    lastMessageTime: 'Yesterday',
  },
  {
    id: 'conv-3',
    participant: USERS[2],
    lastMessage: "Thanks, I'll take a look at it soon.",
    lastMessageTime: 'Mon',
  },
  {
    id: 'conv-4',
    participant: USERS[3],
    lastMessage: 'Meeting notes attached.',
    lastMessageTime: 'Oct 12',
  },
];

export const MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-2',
      content: 'Hey! Are we still on for the design sync at 2 PM?',
      timestamp: '10:43 AM',
      type: 'text',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-2',
      content:
        'I have the updated Figma files ready for review. Did you get a chance to look at the new typography scale?',
      timestamp: '10:43 AM',
      type: 'text',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: "Yes, we're on! 🚀",
      timestamp: '10:45 AM',
      type: 'text',
      status: 'read',
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content:
        'I saw the typography updates. The Inter pairing looks incredibly clean. I just have one note on the mobile display sizes.',
      timestamp: '10:45 AM',
      type: 'text',
      status: 'read',
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'user-2',
      content: '',
      timestamp: '10:48 AM',
      type: 'image',
      imageUrl:
        'https://www.figma.com/api/mcp/asset/16842331-a621-4817-a593-d97fe275b381.png',
    },
  ],
};

export const LANDING_FEATURES = [
  {
    title: 'One-to-One Messaging',
    description: 'Dedicated spaces for private, secure conversations.',
    icon: 'messages',
  },
  {
    title: 'Real-Time Experience',
    description: 'Lightning fast UI engineered for instant message delivery.',
    icon: 'zap',
  },
  {
    title: 'Privacy First',
    description: 'Your data remains yours. No ads, no tracking, pure communication.',
    icon: 'shield',
  },
  {
    title: 'Online Presence',
    description: 'Subtle real-time status indicators to know when friends are active.',
    icon: 'users',
  },
  {
    title: 'Typing Indicators',
    description: 'See in real-time when someone is crafting a reply.',
    icon: 'typing',
  },
  {
    title: 'Read Receipts',
    description: 'Clear status tracking so you always know message state.',
    icon: 'check',
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Create Account',
    description: 'Sign up securely in seconds using just an email.',
  },
  {
    step: 2,
    title: 'Find People',
    description: 'Connect easily via username or simple invite links.',
  },
  {
    step: 3,
    title: 'Start Chatting',
    description: 'Enjoy distraction-free, secure conversations immediately.',
  },
];
