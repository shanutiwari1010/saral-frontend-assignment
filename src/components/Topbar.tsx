import { Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-14 border-b border-border bg-white px-6 flex items-center justify-between">
      <h1 className="text-sm font-medium text-foreground">Gamification</h1>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            5
          </span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
          <img
            src="/Notification.svg"
            alt="User avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
    </header>
  );
}
