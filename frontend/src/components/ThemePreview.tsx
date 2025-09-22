import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const ThemePreview = () => {
  const { theme } = useTheme();

  const getThemeDescription = () => {
    switch (theme) {
      case 'minimalist':
        return {
          title: "Modern Minimalist Dark",
          description: "Clean, professional interface with subtle accents and soft shadows for a distraction-free workflow.",
          features: ["Muted blues & teals", "Soft rounded corners", "Subtle depth effects"]
        };
      case 'cyber':
        return {
          title: "Futuristic Cyber-Tech",
          description: "High-tech interface with glowing neon elements and angular designs for a cutting-edge experience.",
          features: ["Electric neon colors", "Sharp angular elements", "Animated glow effects"]
        };
      case 'academia':
        return {
          title: "Classic Academia",
          description: "Traditional scholarly aesthetic with warm colors and elegant typography inspired by university libraries.",
          features: ["Warm earth tones", "Serif typography", "Decorative elements"]
        };
      default:
        return {
          title: "Modern Minimalist Dark",
          description: "Clean, professional interface with subtle accents.",
          features: ["Clean design", "Easy on eyes", "Professional look"]
        };
    }
  };

  const themeInfo = getThemeDescription();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="admin-card p-6 mb-8"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Current Theme: {themeInfo.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            {themeInfo.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {themeInfo.features.map((feature, index) => (
              <motion.span
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="px-3 py-1 text-xs font-medium rounded-full border"
                style={{
                  color: 'hsl(var(--accent-foreground))',
                  backgroundColor: 'hsl(var(--accent) / 0.1)',
                  borderColor: 'hsl(var(--accent) / 0.3)'
                }}
              >
                {feature}
              </motion.span>
            ))}
          </div>
        </div>
        
        {/* Theme Color Preview */}
        <div className="flex space-x-2 ml-6">
          <div 
            className="w-8 h-8 rounded-full"
            style={{ background: 'var(--gradient-primary)' }}
            title="Primary"
          />
          <div 
            className="w-8 h-8 rounded-full"
            style={{ background: 'var(--gradient-secondary)' }}
            title="Secondary"
          />
          <div 
            className="w-8 h-8 rounded-full"
            style={{ background: 'hsl(var(--accent))' }}
            title="Accent"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ThemePreview;