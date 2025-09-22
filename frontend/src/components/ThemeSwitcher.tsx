import { motion } from "framer-motion";
import { Monitor, Zap, GraduationCap } from "lucide-react";
import { useTheme, ThemeType } from "@/contexts/ThemeContext";

const themes = [
  {
    id: 'minimalist' as ThemeType,
    name: 'Modern Minimalist',
    description: 'Clean dark interface with subtle accents',
    icon: Monitor,
    preview: 'linear-gradient(135deg, hsl(222, 47%, 11%) 0%, hsl(199, 89%, 48%) 100%)'
  },
  {
    id: 'cyber' as ThemeType,
    name: 'Cyber-Tech',
    description: 'Futuristic neon-powered interface',
    icon: Zap,
    preview: 'linear-gradient(135deg, hsl(240, 10%, 4%) 0%, hsl(195, 100%, 50%) 50%, hsl(120, 100%, 50%) 100%)'
  },
  {
    id: 'academia' as ThemeType,
    name: 'Classic Academia',
    description: 'Traditional scholarly aesthetic',
    icon: GraduationCap,
    preview: 'linear-gradient(135deg, hsl(45, 25%, 95%) 0%, hsl(150, 50%, 25%) 50%, hsl(35, 80%, 45%) 100%)'
  }
];

interface ThemeSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSwitcher = ({ isOpen, onClose }: ThemeSwitcherProps) => {
  const { theme, setTheme } = useTheme();

  const handleThemeSelect = (themeId: ThemeType) => {
    setTheme(themeId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="admin-card p-6 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Theme</h2>
        <p className="text-muted-foreground mb-6">Select the visual style that best suits your workflow</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.id;
            
            return (
              <motion.div
                key={themeOption.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`theme-option ${isActive ? 'active' : ''}`}
                onClick={() => handleThemeSelect(themeOption.id)}
                style={{
                  borderColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                }}
              >
                {/* Preview */}
                <div
                  className="w-full h-20 rounded-lg mb-4 relative overflow-hidden"
                  style={{ background: themeOption.preview }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                  <div className="absolute bottom-2 right-2">
                    <Icon className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Info */}
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{themeOption.name}</h3>
                  <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTheme"
                    className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeSwitcher;