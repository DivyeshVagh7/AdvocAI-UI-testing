import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/document-analyser", label: "Document Analyzer" },
    { to: "/document-creation", label: "Document Generator" },
    { to: "/lawyer-connect", label: "Connect" },
    { to: "/my-documents", label: "My Documents", requiresAuth: true },
  ];

  if (isAuthenticated) {
    navLinks.push({ to: "/chat", label: "Messages", requiresAuth: true });
  }

  if (isAuthenticated && user?.role === "lawyer") {
    navLinks.push({
      to: "/lawyer-dashboard",
      label: "Lawyer Dashboard",
      requiresAuth: true,
    });
  }

  return (
    <nav className="bg-background sticky top-0 z-50 border-b py-4 border-border shadow-lg shadow-black/20">
      <div className="container mx-auto px-5 h-full">
        <div className="flex items-center justify-between h-17">
          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-extrabold hover:text-primary transition-colors duration-200 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
          >
            AdvocAI
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(
              (link, index) =>
                (!link.requiresAuth || isAuthenticated) && (
                  <Link
                    to={link.to}
                    key={index}
                    className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-foreground/5 transition-all duration-200 relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" className="hover:bg-foreground/5 rounded-full">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt="Profile"
                        className="w-9 h-8 rounded-full border-2 border-primary/50 hover:border-primary transition-colors"
                      />
                    ) : (
                      <div className="w-9 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <User size={17} className="text-primary" />
                      </div>
                    )}
                  </Button>
                </Link>

                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <LogOut size={15} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-all duration-200">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Toggle menu"
              className="p-3 rounded-lg hover:bg-foreground/10 transition-colors duration-200 text-muted-foreground hover:text-foreground"
            >
              <Menu size={23} />
            </button>
          </div>
        </div>
      </div>

      {/* SINGLE DARK OVERLAY */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* MOBILE MENU PANEL */}
      <div
        data-testid="mobile-menu"
        className={`md:hidden fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-background 
        border-l border-border z-[60] flex flex-col py-6 px-6 transform transition-transform 
        duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
          className="absolute top-6 right-6 p-3 rounded-lg hover:bg-foreground/10 transition-colors"
        >
          <X size={26} />
        </button>

        <div className="mt-20 flex flex-col space-y-6">
          {navLinks.map(
            (link, index) =>
              (!link.requiresAuth || isAuthenticated) && (
                <Link
                  key={index}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-bold text-foreground hover:text-primary transition-all"
                >
                  {link.label}
                </Link>
              )
          )}

          {isAuthenticated ? (
            <Button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              variant="outline"
              size="lg"
              className="text-2xl mt-6 w-full"
            >
              Logout
            </Button>
          ) : (
            <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
              <Button size="lg" className="w-full text-2xl font-bold">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
