
import { Button } from "@/components/ui/button";
import { Bookmark, Home, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    { name: "My Posts", icon: MessageSquare, path: "/my-posts" },
    { name: "Profile", icon: User, path: "/profile" }
  ];
  
  return (
    <div className="w-64 hidden md:flex flex-col h-screen sticky top-0 border-r bg-secondary/30">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-6 mt-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Anonymous
          </span>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                location.pathname === item.path 
                  ? "bg-secondary text-primary font-medium" 
                  : "hover:bg-secondary"
              }`}
              asChild
            >
              <Link to={item.path} className="flex items-center space-x-3">
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t">
        <div className="p-4 bg-secondary/50 rounded-lg">
          <h4 className="font-medium mb-2">Express Freely</h4>
          <p className="text-sm text-muted-foreground">Share your thoughts without judgment in a safe space.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
