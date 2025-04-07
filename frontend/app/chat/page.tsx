'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import ChatSidebar from '../components/ChatSidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { Message } from '../components/types';

const socket = io('http://localhost:1000');

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeUser, setActiveUser] = useState<string>('');
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load current user and set activeUser to someone else
  useEffect(() => {
    const u = localStorage.getItem('user'); // ✅ correct key!
    if (u) {
      const parsed = JSON.parse(u);
      setCurrentUser(parsed);
      socket.emit('join', parsed.username);

      // Set first available user that's not me
      const others = ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'].filter(name => name !== parsed.username);
      if (others.length > 0) setActiveUser(others[0]);
    }
  }, []);

  // Fetch messages when active user changes
  useEffect(() => {
    if (!currentUser || !activeUser) return;
    fetchMessages();
  }, [activeUser, currentUser]);

  const fetchMessages = async () => {
    const res = await fetch(`http://localhost:1000/api/messages/${currentUser.username}/${activeUser}`);
    const data = await res.json();
    setMessages(data.messages || []);
    scrollToBottom();
  };

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      if (
        (msg.sender === activeUser && msg.receiver === currentUser?.username) ||
        (msg.sender === currentUser?.username && msg.receiver === activeUser)
      ) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      } else {
        setUnread(prev => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1
        }));
      }
    };
  
    socket.on('newMessage', handleNewMessage);
  
    return () => {
      socket.off('newMessage', handleNewMessage); // ✅ correct cleanup
    };
  }, [activeUser, currentUser]);
  
  const handleSend = async (text: string, files: File[]) => {
    const formData = new FormData();
    formData.append('sender', currentUser.username);
    formData.append('receiver', activeUser);
    if (text) formData.append('text', text);
    if (files[0]) formData.append('file', files[0]);

    const res = await fetch('http://localhost:1000/api/message', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    setMessages(prev => [...prev, data.msg]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {currentUser && (
        <ChatSidebar
          users={['user1', 'user2', 'user3', 'user4', 'user5', 'user6']}
          currentUser={currentUser.username}
          activeUser={activeUser}
          unread={unread}
          onSelectUser={(name) => {
            setActiveUser(name);
            setUnread(prev => ({ ...prev, [name]: 0 }));
          }}
        />
      )}

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white flex items-center">
          <img
            src={`https://i.pravatar.cc/150?u=${activeUser}`}
            className="w-10 h-10 rounded-full mr-3"
            alt=""
          />
          <div>
            <h2 className="text-lg font-semibold">{activeUser}</h2>
            <p className="text-sm text-gray-500">online</p>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            backgroundImage: 'url("/chat-bg.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto'
          }}
        >
          {messages.map((msg) => (
            <ChatMessage key={msg._id || msg.timestamp || Math.random()} message={msg} />
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} />
      </main>
    </div>
  );
}
