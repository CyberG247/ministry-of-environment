import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Leaf, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Report Issue", href: "/submit-report" },
    { label: "Track Report", href: "/#track" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];

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
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isScrolled
                    ? "text-foreground hover:bg-secondary hover:text-primary"
                    : "text-background/90 hover:text-background hover:bg-background/10"
                }`}
              >
                {link.label}
              </a>
            ))}
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
                  variant={isScrolled ? "secondary" : "heroOutline"}
                  size="sm"
                  onClick={handleLogout}
                >
                  <User className="w-4 h-4" />
                  Sign Out
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
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-2 border-t border-border mt-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="outline" className="w-full" onClick={() => navigate("/admin")}>
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  )}
                  <Button variant="secondary" className="w-full" onClick={handleLogout}>
                    Sign Out
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
