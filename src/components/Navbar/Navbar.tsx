import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// import { Logout } from "../icons/Logout.icon";

const navLinks = [
  { name: "Learn", href: "#learn" },
  { name: "Tools", href: "#tools" },
  { name: "Create Study", href: "#create-study" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-border mx-100 mt-6 rounded-4xl border-b backdrop-blur-sm"
          : "bg-background top-0 left-0 mx-0 mt-0 w-full rounded-none border-none"
      }`}
    >
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <a href="/" className="group flex items-center gap-3">
            <Crown className="border-border bg-pastel-mint h-10 w-10 rounded-full" />
            <span className="text-foreground text-2xl font-bold tracking-wide">
              Chess-It
            </span>
          </a>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-12 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium tracking-wide transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            {/* {user ? (
              <>
                <span className="text-sm">Hi, {user.username}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <> */}
            <Button variant="ghost" className="text-sm">
              Sign In
            </Button>
            <Button
              className="bg-pastel-mint text-foreground hover:bg-pastel-mint/80 text-sm transition-colors"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>

            {/* </>
            )} */}
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
                <DropdownMenuItem key={link.name} asChild>
                  <a href={link.href}>{link.name}</a>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              {/* {user ? (
                <>
                  <DropdownMenuItem disabled>
                    Hi, {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <> */}
              <DropdownMenuItem style={{ fontFamily: "minecraft" }}>
                Sign In
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/register")}
                style={{ fontFamily: "minecraft" }}
              >
                Get Started
              </DropdownMenuItem>

              {/* </>
              )} */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
