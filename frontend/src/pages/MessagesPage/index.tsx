import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './MessagesPage.module.scss';

type ChatUser = {
  id: number;
  login: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  image: string | null;
};

type ConversationListItem = {
  id: number;
  friend: ChatUser;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    sender: ChatUser;
  } | null;
  updatedAt: string;
  isOnline: boolean;
};

type MessageItem = {
  id: number;
  content: string;
  createdAt: string;
  sender: ChatUser;
};

type ConversationsResponse = {
  conversations: ConversationListItem[];
};

type MessagesResponse = {
  conversation: {
    id: number;
    friend: ChatUser;
  };
  messages: MessageItem[];
};

const getImageUrl = (image?: string | null) => {
  if (!image) {
    return null;
  }

  if (image.startsWith('http')) {
    return image;
  }

  return `http://localhost:3000${image}`;
};

const SOCKET_EVENTS = {
  SOCIAL: {
    MESSAGE_RECEIVED: 'social.message.received',
    PRESENCE_CHANGED: 'social.presence.changed',
  },
} as const;

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { socket, user } = useUser();
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    [],
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(conversationId ? Number(conversationId) : null);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await fetch('/api/conversations', {
        credentials: 'include',
      });

      if (!response.ok) {
        setConversations([]);
        return;
      }

      const data = (await response.json()) as ConversationsResponse;
      setConversations(data.conversations ?? []);

      if (!selectedConversationId && data.conversations?.length) {
        setSelectedConversationId(data.conversations[0].id);
        navigate(`/messages/${data.conversations[0].id}`, { replace: true });
      }
    } catch (error) {
      console.error('Could not load conversations:', error);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (activeConversationId: number) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(
        `/api/conversations/${activeConversationId}/messages`,
        {
          credentials: 'include',
        },
      );

      if (!response.ok) {
        setMessages([]);
        return;
      }

      const data = (await response.json()) as MessagesResponse;
      setMessages(data.messages ?? []);
    } catch (error) {
      console.error('Could not load messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      const numericConversationId = Number(conversationId);
      if (!Number.isNaN(numericConversationId)) {
        setSelectedConversationId(numericConversationId);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!socket || !selectedConversationId) {
      return;
    }

    const handleIncomingMessage = ({
      conversationId: incomingConversationId,
      message,
    }: {
      conversationId: number;
      message: MessageItem;
    }) => {
      if (incomingConversationId !== selectedConversationId) {
        void loadConversations();
        return;
      }

      setMessages((current) => {
        const alreadyExists = current.some((item) => item.id === message.id);
        return alreadyExists ? current : [...current, message];
      });

      void loadConversations();
    };

    socket.on(SOCKET_EVENTS.SOCIAL.MESSAGE_RECEIVED, handleIncomingMessage);

    return () => {
      socket.off(SOCKET_EVENTS.SOCIAL.MESSAGE_RECEIVED, handleIncomingMessage);
    };
  }, [socket, selectedConversationId]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handlePresenceChanged = ({
      userId,
      status,
    }: {
      userId: number;
      status: 'online' | 'offline';
    }) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.friend.id === userId
            ? { ...conversation, isOnline: status === 'online' }
            : conversation,
        ),
      );
    };

    socket.on(SOCKET_EVENTS.SOCIAL.PRESENCE_CHANGED, handlePresenceChanged);

    return () => {
      socket.off(SOCKET_EVENTS.SOCIAL.PRESENCE_CHANGED, handlePresenceChanged);
    };
  }, [socket]);

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    navigate(`/messages/${id}`);
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageText.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `/api/conversations/${selectedConversationId}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageText.trim() }),
        },
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setMessages((current) => [...current, data.message]);
      setMessageText('');
      void loadConversations();
    } catch (error) {
      console.error('Could not send message:', error);
    }
  };

  return (
    <div className={styles.messagesPage}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>Messages</h1>
          <span>{conversations.length}</span>
        </div>

        {loadingConversations ? (
          <p className={styles.emptyState}>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p className={styles.emptyState}>No conversations yet.</p>
        ) : (
          <div className={styles.conversationList}>
            {conversations.map((conversation) => {
              const name =
                conversation.friend.displayName ??
                conversation.friend.login ??
                'Unknown user';
              const avatarUrl = getImageUrl(conversation.friend.image);
              const isActive = conversation.id === selectedConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`${styles.conversationItem} ${isActive ? styles.active : ''}`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className={styles.friendInfo}>
                    <div className={styles.avatarWrapper}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          {name.slice(0, 1)}
                        </div>
                      )}
                    </div>

                    <div className={styles.friendMeta}>
                      <strong>{name}</strong>
                      <p>
                        {conversation.lastMessage
                          ? conversation.lastMessage.content
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`${styles.presenceDot} ${
                      conversation.isOnline ? styles.online : styles.offline
                    }`}
                    aria-label={conversation.isOnline ? 'Online' : 'Offline'}
                    title={conversation.isOnline ? 'Online' : 'Offline'}
                  />
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <section className={styles.chatPane}>
        {selectedConversation ? (
          <>
            <header className={styles.chatHeader}>
              <div>
                <h2>
                  {selectedConversation.friend.displayName ??
                    selectedConversation.friend.login}
                </h2>
                <p>@{selectedConversation.friend.login}</p>
              </div>
              <span
                className={`${styles.presenceBadge} ${
                  selectedConversation.isOnline
                    ? styles.onlineBadge
                    : styles.offlineBadge
                }`}
              >
                {selectedConversation.isOnline ? 'Online' : 'Offline'}
              </span>
            </header>

            <div className={styles.messagesList}>
              {loadingMessages ? (
                <p className={styles.emptyState}>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className={styles.emptyState}>No messages yet. Say hello.</p>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender.id === user?.id;

                  return (
                    <article
                      key={message.id}
                      className={`${styles.messageBubble} ${isMine ? styles.mine : styles.theirs}`}
                    >
                      <p>{message.content}</p>
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </article>
                  );
                })
              )}
            </div>

            <div className={styles.composer}>
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Write a message..."
                rows={3}
              />
              <button type="button" onClick={() => void handleSendMessage()}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyChatState}>
            <h2>Select a conversation</h2>
            <p>Pick a friend on the left to start chatting.</p>
          </div>
        )}
      </section>
    </div>
  );
}
