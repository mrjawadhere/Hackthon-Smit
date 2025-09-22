import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent";
  delay?: number;
  loading?: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, delay = 0, loading = false }: StatCardProps) => {
  const colorClasses = {
    primary: "stat-card-primary",
    secondary: "stat-card-secondary", 
    accent: "stat-card-accent"
  };

  const iconColors = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={colorClasses[color]}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="shimmer h-4 w-24 rounded" />
            <div className="shimmer h-8 w-8 rounded-lg" />
          </div>
          <div className="shimmer h-8 w-16 rounded" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className={`p-2 rounded-lg bg-gradient-to-br from-background to-muted/20 ${iconColors[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
            className="text-3xl font-bold text-foreground"
          >
            {value}
          </motion.div>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: delay + 0.4, duration: 0.6 }}
            className={`h-1 rounded-full mt-4 ${
              color === "primary" ? "bg-gradient-to-r from-primary to-primary-glow" :
              color === "secondary" ? "bg-gradient-to-r from-secondary to-secondary-hover" :
              "bg-gradient-to-r from-accent to-accent-hover"
            }`}
          />
        </>
      )}
    </motion.div>
  );
};

export default StatCard;