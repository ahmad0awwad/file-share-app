// components/types.ts
export type Message = {
    _id: number;
    sender: string;
    receiver: string;
    text?: string;
    fileUrl?: string;
    fileType?: 'image' | 'video' | 'pdf' | 'other';
    time: string;
    read?: boolean; // NEW
    timestamp?: string;

  };
  
  