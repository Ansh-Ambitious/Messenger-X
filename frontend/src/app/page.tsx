import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Image,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Smile,
  Sparkles,
  Video,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { CONVERSATIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function Home() {
  const {
    currentUser,
    conversations,
    messages,
    sendMessage,
    loadMessages,
    setTyping,
    typingUsers,
    markMessageRead,
    setSelectedConversation,
    connectionStatus,
    errorMessage,
    clearError,
  } = useApp();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageCursor, setMessageCursor] = useState<string | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesPanel = useRef<HTMLDivElement | null>(null);

  const visibleConversations = useMemo(
    () => conversations.filter(({ participant }) => participant.name.toLowerCase().includes(search.toLowerCase())),
    [conversations, search],
  );
  const selectedConversation =
    conversations.find(({ id }) => id === conversationId) ?? conversations[0] ?? CONVERSATIONS[0];
  const selectedMessages = messages[selectedConversation.id] ?? [];
  const bannerMessage = errorMessage ?? (connectionStatus === 'connecting' ? 'Reconnecting...' : connectionStatus === 'disconnected' ? 'Connection lost' : null);

  useEffect(() => {
    setSelectedConversation(selectedConversation.id);
  }, [selectedConversation.id, setSelectedConversation]);

  useEffect(() => {
    if (!/^[a-f\d]{24}$/i.test(selectedConversation.id)) return;
    setHasMoreMessages(false);
    setMessageCursor(null);
    setIsLoadingMessages(true);
    loadMessages(selectedConversation.id)
      .then(({ hasMore, nextCursor }) => {
        setHasMoreMessages(hasMore);
        setMessageCursor(nextCursor);
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoadingMessages(false));
  }, [selectedConversation.id]);

  async function handleMessagesScroll() {
    const panel = messagesPanel.current;
    if (!panel || panel.scrollTop > 80 || !hasMoreMessages || !messageCursor || isLoadingMessages) return;

    const previousHeight = panel.scrollHeight;
    setIsLoadingMessages(true);
    try {
      const result = await loadMessages(selectedConversation.id, messageCursor);
      setHasMoreMessages(result.hasMore);
      setMessageCursor(result.nextCursor);
      requestAnimationFrame(() => {
        if (messagesPanel.current) {
          messagesPanel.current.scrollTop += messagesPanel.current.scrollHeight - previousHeight;
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    selectedMessages.forEach((message) => {
      if (message.senderId !== currentUser.id && message.status !== 'read') {
        markMessageRead(message.id);
      }
    });
  }, [currentUser.id, markMessageRead, selectedMessages]);

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(selectedConversation.id, draft);
    setTyping(selectedConversation.id, false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    setDraft('');
  }

  function handleDraftChange(value: string) {
    const wasTyping = draft.trim().length > 0;
    setDraft(value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (value.trim()) {
      if (!wasTyping) setTyping(selectedConversation.id, true);
      typingTimeout.current = setTimeout(() => setTyping(selectedConversation.id, false), 800);
    } else if (wasTyping) {
      setTyping(selectedConversation.id, false);
    }
  }

  return (
    <AppShell activePath="/app/conversations">
      <div className="flex min-h-dvh flex-col bg-[radial-gradient(circle_at_top_right,rgba(0,112,235,0.08),transparent_32%),var(--color-background)]">
        <header className="flex h-19 items-center justify-between border-b border-border/40 bg-white/75 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Chat App</p>
              <h1 className="text-xl font-semibold tracking-tight">Messenger X</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex size-10 items-center justify-center rounded-xl text-text-secondary hover:bg-surface" aria-label="Notifications">
              <Bell className="size-5" />
            </button>
            <Avatar user={currentUser} size="sm" showOnline isOnline />
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-5 p-4 md:p-6 lg:flex-row lg:gap-6 lg:p-8">
          <section className="flex min-h-70 w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-white/80 shadow-[0_12px_40px_rgba(22,41,79,0.06)] lg:w-85 lg:shrink-0">
            <div className="border-b border-border/40 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Users</h2>
                  <p className="mt-1 text-sm text-text-secondary">{conversations.length} conversations</p>
                </div>
                <button className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/15" aria-label="Start a new conversation">
                  <Sparkles className="size-4" />
                </button>
              </div>
              <label className="relative mt-5 block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" className="w-full rounded-xl border border-border/60 bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary" />
              </label>
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
              {visibleConversations.map((conversation) => {
                const isSelected = conversation.id === selectedConversation.id;
                return (
                  <button key={conversation.id} onClick={() => navigate(`/app/chat/${conversation.id}`)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/15' : 'hover:bg-surface'}`}>
                    <Avatar user={conversation.participant} size="md" showOnline isOnline={conversation.participant.isOnline} />
                    <span className="min-w-0 flex-1">
                      <span className={`flex items-center justify-between gap-2 text-sm font-semibold ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                        <span className="truncate">{conversation.participant.name}</span>
                        <span className={`shrink-0 text-[11px] font-normal ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>{conversation.lastMessageTime}</span>
                      </span>
                      <span className={`mt-1 block truncate text-xs ${isSelected ? 'text-white/75' : 'text-text-secondary'}`}>{conversation.lastMessage}</span>
                    </span>
                    {!!conversation.unreadCount && !isSelected && <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{conversation.unreadCount}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex min-h-130 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/50 bg-white/85 shadow-[0_12px_40px_rgba(22,41,79,0.06)]">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar user={selectedConversation.participant} size="md" showOnline isOnline={selectedConversation.participant.isOnline} />
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{selectedConversation.participant.name}</h2>
                  <p className="mt-0.5 text-xs text-online-dark">{selectedConversation.participant.isOnline ? 'Online now' : 'Last seen recently'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <button className="hidden size-9 items-center justify-center rounded-xl hover:bg-surface sm:flex" aria-label="Start video call"><Video className="size-4" /></button>
                <button className="flex size-9 items-center justify-center rounded-xl hover:bg-surface" aria-label="More conversation options"><MoreHorizontal className="size-5" /></button>
              </div>
            </div>
            <div ref={messagesPanel} onScroll={handleMessagesScroll} className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,249,254,0.4),rgba(255,255,255,0.7))] px-4 py-6 md:px-8">
              {bannerMessage && (
                <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <span>{bannerMessage}</span>
                  {errorMessage && (
                    <button type="button" onClick={clearError} className="text-xs font-semibold text-amber-700 hover:text-amber-900">
                      Dismiss
                    </button>
                  )}
                </div>
              )}
              {isLoadingMessages && hasMoreMessages && <p className="text-center text-xs text-text-muted">Loading older messages...</p>}
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" />Today</div>
              {selectedMessages.map((message) => {
                const isMine = message.senderId === currentUser.id;
                return (
                  <div key={message.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && <Avatar user={selectedConversation.participant} size="sm" />}
                    <div className={`max-w-[78%] md:max-w-[62%] ${isMine ? 'items-end' : 'items-start'}`}>
                      {message.type === 'image' && message.imageUrl ? <img src={message.imageUrl} alt="Shared in conversation" className="max-h-64 rounded-2xl border border-border/40 object-cover" /> : <p className={`rounded-2xl px-4 py-3 text-sm leading-6 ${isMine ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md border border-border/40 bg-white text-text-primary'}`}>{message.content}</p>}
                      <span className={`mt-1 flex items-center gap-1 text-[11px] text-text-muted ${isMine ? 'justify-end' : ''}`}>{message.timestamp}{isMine && <CheckCheck className="size-3.5 text-primary" />}</span>
                    </div>
                  </div>
                );
              })}
              {selectedMessages.length === 0 && <div className="flex h-full items-center justify-center text-sm text-text-muted">Start a new conversation with {selectedConversation.participant.name}.</div>}
              {typingUsers.length > 0 && <p className="text-xs text-text-muted">{selectedConversation.participant.name} is typing...</p>}
            </div>
            <form onSubmit={handleSend} className="border-t border-border/40 bg-white p-4 md:p-5">
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-2 focus-within:border-primary">
                <button type="button" className="flex size-9 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-surface" aria-label="Attach a file"><Paperclip className="size-4" /></button>
                <input value={draft} onChange={(event) => handleDraftChange(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-text-muted" />
                <button type="button" className="hidden size-9 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-surface sm:flex" aria-label="Add image"><Image className="size-4" /></button>
                <button type="button" className="hidden size-9 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-surface sm:flex" aria-label="Add emoji"><Smile className="size-4" /></button>
                <button type="submit" disabled={!draft.trim()} className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-[#004a9e] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send className="size-4" /></button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </AppShell>
  );
}
