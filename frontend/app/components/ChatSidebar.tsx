type ChatSidebarProps = {
    users: string[];
    currentUser: string;
    activeUser: string | null;
    unread: Record<string, number>;
    onSelectUser: (user: string) => void;
    
  };
  
  export default function ChatSidebar({
    users,
    currentUser,
    activeUser,
    unread, 
    onSelectUser
  }: ChatSidebarProps) {
    return (
      <aside className="w-20 bg-white shadow-lg p-3 flex flex-col gap-4 overflow-y-auto">
       {users.map(name => {
  if (name === currentUser) return null;
  return (
    <div
      key={name}
      className="relative cursor-pointer"
      onClick={() => onSelectUser(name)}
      title={name}
    >
      <img
        src={`https://i.pravatar.cc/150?u=${name}`}
        alt={name}
        className={`w-12 h-12 object-cover rounded-full ${activeUser === name ? 'ring-2 ring-blue-500' : ''}`}
      />
      {unread[name] > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
          {unread[name]}
        </div>
      )}
    </div>
  );
})}

      </aside>
    );
  }
  