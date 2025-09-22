import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, MessageSquare, GraduationCap, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const Navbar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);

  const navItems = [
    { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/chat", icon: MessageSquare, label: "AI Chat" },
  ];

  const getThemeTitle = () => {
    switch (theme) {
      case 'minimalist': return 'Modern Minimalist';
      case 'cyber': return 'Cyber-Tech';
      case 'academia': return 'Classic Academia';
      default: return 'Modern Minimalist';
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ 
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius)'
              }}
            >
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">CampusAI Admin</h1>
              <p className="text-xs text-muted-foreground">{getThemeTitle()}</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-2 flex items-center space-x-2 transition-all duration-200 ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    style={{
                      borderRadius: 'var(--radius)',
                      background: isActive ? 'var(--gradient-primary)' : 'transparent',
                      boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
            
            {/* Theme Switcher Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowThemeSwitcher(true)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center space-x-2 transition-all duration-200"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Theme</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Theme Switcher Modal */}
      <AnimatePresence>
        {showThemeSwitcher && (
          <ThemeSwitcher
            isOpen={showThemeSwitcher}
            onClose={() => setShowThemeSwitcher(false)}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;