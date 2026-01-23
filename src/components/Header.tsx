import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Leaf, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Only track sections on homepage
      if (location.pathname !== "/") return;

      const sections = ["categories", "how-it-works", "stats"];
      const scrollPosition = window.scrollY + 150;

      // Check if at top of page
      if (window.scrollY < 100) {
        setActiveSection("");
        return;
      }

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", href: "/", isSection: false, sectionId: "" },
    { label: "Categories", href: "/#categories", isSection: true, sectionId: "categories" },
    { label: "How It Works", href: "/#how-it-works", isSection: true, sectionId: "how-it-works" },
    { label: "Statistics", href: "/stats", isSection: false, sectionId: "" },
    { label: "News", href: "/news", isSection: false, sectionId: "" },
  ];

  const isLinkActive = (link: typeof navLinks[0]) => {
    if (link.isSection && location.pathname === "/") {
      return activeSection === link.sectionId;
    }
    if (!link.isSection && link.href !== "/") {
      return location.pathname === link.href;
    }
    if (link.href === "/" && location.pathname === "/" && !activeSection) {
      return true;
    }
    return false;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    if (link.isSection) {
      e.preventDefault();
      const sectionId = link.href.replace("/#", "");
      
      // If on homepage, scroll to section
      if (location.pathname === "/") {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to homepage first, then scroll
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
      setIsMobileMenuOpen(false);
    } else if (link.href === "/") {
      e.preventDefault();
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      setIsMobileMenuOpen(false);
    }
  };

  const isAdmin = userRole === "admin" || userRole === "super_admin" || userRole === "field_officer";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-gov border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-gov">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isScrolled ? 'bg-primary' : 'bg-background/20'} transition-colors`}>
              <Leaf className={`w-6 h-6 ${isScrolled ? 'text-primary-foreground' : 'text-background'}`} />
            </div>
            <div className={`${isScrolled ? 'text-foreground' : 'text-background'} transition-colors`}>
              <p className="font-serif font-bold text-lg leading-tight">ECSRS</p>
              <p className="text-xs opacity-80">Jigawa State</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer relative ${
                    isScrolled
                      ? active
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:bg-secondary hover:text-primary"
                      : active
                        ? "text-background bg-background/20"
                        : "text-background/90 hover:text-background hover:bg-background/10"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full ${
                      isScrolled ? "bg-primary" : "bg-background"
                    }`} />
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
              {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant={isScrolled ? "outline" : "heroOutline"}
                    size="sm"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Button>
                )}
                <Button
                  variant={isScrolled ? "outline" : "heroOutline"}
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="w-4 h-4" />
                  My Dashboard
                </Button>
              </>
            ) : (
              <Button
                variant={isScrolled ? "outline" : "heroOutline"}
                size="sm"
                onClick={() => navigate("/auth")}
              >
                <User className="w-4 h-4" />
                Sign In
              </Button>
            )}
            <Button
              variant={isScrolled ? "default" : "hero"}
              size="sm"
              onClick={() => navigate("/submit-report")}
            >
              Report Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-background'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-background'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-fade-in">
          <nav className="container-gov py-4 space-y-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`block px-4 py-3 rounded-lg transition-colors font-medium cursor-pointer ${
                    active
                      ? "text-primary bg-primary/10 border-l-4 border-primary"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-4 space-y-2 border-t border-border mt-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="outline" className="w-full" onClick={() => navigate("/admin")}>
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                    <User className="w-4 h-4" />
                    My Dashboard
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              )}
              <Button className="w-full" onClick={() => navigate("/submit-report")}>
                Report Now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
