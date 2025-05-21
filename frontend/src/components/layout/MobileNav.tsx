
import { Bookmark, Home, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MobileNav = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    { name: "My Posts", icon: MessageSquare, path: "/my-posts" },
    { name: "Profile", icon: User, path: "/profile" }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t md:hidden z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center py-2 px-4 ${
              location.pathname === item.path 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
