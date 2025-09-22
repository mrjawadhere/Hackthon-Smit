import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Building2, UserPlus, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import ThemePreview from "@/components/ThemePreview";

// Mock data - replace with real API calls
const mockStats = {
  totalStudents: 1247,
  departments: 8,
  recentOnboardings: 23,
  activeLastWeek: 892
};

const mockDepartmentData = [
  { name: "Computer Science", value: 324, color: "#2563eb" },
  { name: "Engineering", value: 298, color: "#06b6d4" },
  { name: "Business", value: 256, color: "#8b5cf6" },
  { name: "Arts", value: 189, color: "#f59e0b" },
  { name: "Sciences", value: 156, color: "#10b981" },
  { name: "Medicine", value: 24, color: "#ef4444" }
];

const mockOnboardingData = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 8 },
  { day: "Wed", count: 15 },
  { day: "Thu", count: 6 },
  { day: "Fri", count: 18 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 2 }
];

const mockRecentStudents = [
  { id: 1001, name: "Emma Johnson", department: "Computer Science", onboarded: "2024-01-15" },
  { id: 1002, name: "Michael Chen", department: "Engineering", onboarded: "2024-01-14" },
  { id: 1003, name: "Sarah Williams", department: "Business", onboarded: "2024-01-14" },
  { id: 1004, name: "David Rodriguez", department: "Sciences", onboarded: "2024-01-13" },
  { id: 1005, name: "Lisa Thompson", department: "Arts", onboarded: "2024-01-13" }
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Campus Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights into campus operations and student data</p>
        </motion.div>

        {/* Theme Preview */}
        <ThemePreview />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={loading ? "..." : mockStats.totalStudents}
            icon={Users}
            color="primary"
            delay={0}
            loading={loading}
          />
          <StatCard
            title="Departments"
            value={loading ? "..." : mockStats.departments}
            icon={Building2}
            color="secondary"
            delay={0.1}
            loading={loading}
          />
          <StatCard
            title="Recent Onboardings"
            value={loading ? "..." : mockStats.recentOnboardings}
            icon={UserPlus}
            color="accent"
            delay={0.2}
            loading={loading}
          />
          <StatCard
            title="Active Last 7 Days"
            value={loading ? "..." : mockStats.activeLastWeek}
            icon={TrendingUp}
            color="primary"
            delay={0.3}
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="admin-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Students by Department</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="shimmer h-48 w-48 rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockDepartmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {mockDepartmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="admin-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Onboardings This Week</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-end space-x-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="shimmer w-8 h-32 rounded" />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockOnboardingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                    animationBegin={200}
                    animationDuration={800}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Recent Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="admin-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Student Onboardings</h3>
          
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="shimmer h-4 w-16 rounded" />
                  <div className="shimmer h-4 w-32 rounded" />
                  <div className="shimmer h-4 w-24 rounded" />
                  <div className="shimmer h-4 w-20 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Onboarded</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-muted-foreground">#{student.id}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{student.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{student.department}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{student.onboarded}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;