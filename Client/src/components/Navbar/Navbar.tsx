import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Crown } from "../icons/Crown.icon";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/Dropdown-menu";
import { Menu } from "../icons/Menu.icon";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { Logout } from "../icons/Logout.icon";
import { cn } from "../../lib/utils";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Explore", path: "/home" },
    { name: "Puzzles", path: "/puzzles" },
    { name: "Create Study", path: "/create-study" },
    ...(user ? [{ name: "My Studies", path: "/my-studies" }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-border bg-background/80 left-1/2 mt-4 w-[calc(100%-3rem)] max-w-5xl -translate-x-1/2 transform rounded-full border backdrop-blur-sm"
          : "bg-background right-0 left-0 w-full"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex h-12 items-center justify-between md:h-14">
          <a href="/" className="group flex items-center gap-3">
            <Crown className="border-border bg-pastel-mint h-10 w-10 rounded-full" />
            <span className="text-foreground text-2xl font-bold tracking-wide">
              Chess-It
            </span>
          </a>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-12 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    "cursor-pointer text-sm font-medium tracking-wide transition-colors duration-200",
                    isActive
                      ? "text-pastel-mint"
                      : "text-muted-foreground hover:text-pastel-mint",
                  )}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <ThemeToggle />
            {user ? (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className={cn(
                    "cursor-pointer text-sm transition-colors",
                    location.pathname === "/profile"
                      ? "text-pastel-mint"
                      : "text-muted-foreground hover:text-pastel-mint",
                  )}
                >
                  Hi, {user.username}
                </button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-sm"
                >
                  <Logout className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-sm"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-pastel-mint text-foreground hover:bg-pastel-mint/80 text-sm transition-colors dark:!text-[#1A1A1A]"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background w-xs">
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.name}
                  onClick={() => navigate(link.path)}
                >
                  {link.name}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <div className="flex w-full items-center justify-between">
                  <span style={{ fontFamily: "minecraft" }}>Theme</span>
                  <ThemeToggle />
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {user ? (
                <>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Hi, {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <Logout className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    style={{ fontFamily: "minecraft" }}
                  >
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/register")}
                    style={{ fontFamily: "minecraft" }}
                  >
                    Get Started
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
