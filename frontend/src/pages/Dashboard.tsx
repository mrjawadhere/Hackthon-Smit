import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Building2, UserPlus, TrendingUp, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import ThemePreview from "@/components/ThemePreview";
import { useAnalytics, useRefreshAnalytics } from "@/hooks/useApi";
import { toast } from "sonner";

// Color palette for charts
const CHART_COLORS = [
  "#2563eb", "#06b6d4", "#8b5cf6", "#f59e0b", 
  "#10b981", "#ef4444", "#f97316", "#84cc16"
];

const Dashboard = () => {
  const {
    totalStudents,
    studentsByDepartment,
    recentStudents,
    activeStudents,
    isLoading,
    isError
  } = useAnalytics();
  
  const refreshAnalytics = useRefreshAnalytics();

  // Transform department data for pie chart
  const departmentChartData = useMemo(() => {
    if (!studentsByDepartment.data?.results) return [];
    
    return studentsByDepartment.data.results.map((dept, index) => ({
      name: dept.department,
      value: dept.count,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [studentsByDepartment.data]);

  // Generate mock onboarding data for the week (can be enhanced later with real API)
  const mockOnboardingData = [
    { day: "Mon", count: 12 },
    { day: "Tue", count: 8 },
    { day: "Wed", count: 15 },
    { day: "Thu", count: 6 },
    { day: "Fri", count: 18 },
    { day: "Sat", count: 4 },
    { day: "Sun", count: 2 }
  ];

  // Handle refresh button
  const handleRefresh = () => {
    refreshAnalytics();
  };

  // Show error toast if any API calls fail
  useEffect(() => {
    if (isError) {
      toast.error("Failed to load some dashboard data. Please check your connection.");
    }
  }, [isError]);

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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Campus Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time insights into campus operations and student data</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </motion.div>

        {/* Theme Preview */}
        <ThemePreview />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={isLoading ? "..." : totalStudents.data?.total_students ?? 0}
            icon={Users}
            color="primary"
            delay={0}
            loading={isLoading}
          />
          <StatCard
            title="Departments"
            value={isLoading ? "..." : studentsByDepartment.data?.total_departments ?? 0}
            icon={Building2}
            color="secondary"
            delay={0.1}
            loading={isLoading}
          />
          <StatCard
            title="Recent Onboardings"
            value={isLoading ? "..." : recentStudents.data?.count ?? 0}
            icon={UserPlus}
            color="accent"
            delay={0.2}
            loading={isLoading}
          />
          <StatCard
            title="Active Last 7 Days"
            value={isLoading ? "..." : activeStudents.data?.count ?? 0}
            icon={TrendingUp}
            color="primary"
            delay={0.3}
            loading={isLoading}
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
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="shimmer h-48 w-48 rounded-full" />
              </div>
            ) : departmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {departmentChartData.map((entry, index) => (
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
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No department data available
              </div>
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
            {isLoading ? (
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
          
          {isLoading ? (
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
          ) : recentStudents.data?.students && recentStudents.data.students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.data.students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-muted-foreground">#{student.id}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{student.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{student.department || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{student.email}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent students data available
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;