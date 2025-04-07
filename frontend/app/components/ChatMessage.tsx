'use client';

import { Message } from './types';
import { FaDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ChatMessage({ message }: { message: Message }) {
  const isMe = message.sender === 'me';

  // Optional: Extract file name from URL
  const fileName = message.fileUrl?.split('/').pop();

  const isDownloadable =
    message.fileType === 'video' ||
    message.fileType === 'pdf' ||
    message.fileType === 'other';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-2xl shadow text-sm relative ${
          isMe ? 'bg-green-200 rounded-br-none' : 'bg-white rounded-bl-none'
        }`}
      >
        {message.text && <p>{message.text}</p>}

        {message.fileUrl && (
          <div className="mt-2">
            {message.fileType === 'image' ? (
              <img src={message.fileUrl} className="rounded max-w-full h-auto" />
            ) : (
              <a
              href={`http://localhost:1000${message.fileUrl}`} // ✅ full URL!
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
            >
              📥 Download File
            </a>
            
            )}
          </div>
        )}

        <div className="text-[10px] text-gray-500 text-right mt-1">
          {message.time} {isMe && message.read ? '✅✅' : isMe ? '✅' : ''}
        </div>
      </div>
    </motion.div>
  );
}


//