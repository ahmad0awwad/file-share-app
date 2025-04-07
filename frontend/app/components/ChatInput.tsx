import { useRef } from 'react';

type ChatInputProps = {
  onSend: (text: string, files: File[]) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onSend('', files);
  };

  return (
    <div
      className="p-3 border-t bg-white flex gap-2 items-center"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <input
        type="text"
        ref={inputRef}
        placeholder="Type a message"
        className="flex-1 border rounded-full px-4 py-2 text-sm"
        onKeyDown={e => {
          if (e.key === 'Enter' && inputRef.current?.value) {
            onSend(inputRef.current.value, []);
            inputRef.current.value = '';
          }
        }}
      />
      <label htmlFor="fileInput" className="cursor-pointer text-blue-600 text-lg">📎</label>
      <input
        id="fileInput"
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onSend('', files);
        }}
      />
    </div>
  );
}
