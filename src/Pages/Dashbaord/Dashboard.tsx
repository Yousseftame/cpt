import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  ShoppingCart,
  Package,
  DollarSign,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import EnhancedDashboardHeader from './EnhancedDashboardHeader';

const colors = {
  primary: "#5E35B1",
  primaryLight: "#7E57C2",
  secondary: "#1E88E5",
  secondaryLight: "#42A5F5",
  accent: "#FFB74D",
  success: "#66BB6A",
  error: "#EF5350",
  lightBg: "#F5F5F5",
  cardBg: "#FFFFFF",
  textPrimary: "#263238",
  textSecondary: "#607D8B",
  border: "#E0E0E0",
  lavender: "#EDE7F6",
} as const;

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

// Animated Counter Component
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "" 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

// Stat Card Component with Animation
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const isPositive = change >= 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: gradient,
        color: "white",
        boxShadow: "0 4px 20px rgba(94, 53, 177, 0.3)",
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        },
        "&:hover": {
          transform: isVisible ? "translateY(-4px) scale(1.02)" : "translateY(20px)",
          boxShadow: "0 8px 30px rgba(94, 53, 177, 0.4)",
        },
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm opacity-90 font-medium">{title}</p>
        <Icon size={24} className="opacity-75" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold mb-2">
            <AnimatedCounter end={value} />
          </p>
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUp size={16} className="opacity-90" />
            ) : (
              <TrendingDown size={16} className="opacity-90" />
            )}
            <span className="opacity-90">
              {isPositive ? "+" : ""}{change}% from last month
            </span>
          </div>
        </div>
      </div>
    </Paper>
  );
};

interface SimpleBarChartProps {
  data: number[];
  height?: number;
}

// Chart Component (Simplified Bar Chart)
const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, height = 200 }) => {
  const [animatedData, setAnimatedData] = useState<number[]>(data.map(() => 0));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  const maxValue = Math.max(...data);

  return (
    <div style={{ height, display: "flex", alignItems: "flex-end", gap: "12px", padding: "20px 0" }}>
      {animatedData.map((value, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            borderRadius: "8px 8px 0 0",
            height: `${(value / maxValue) * 100}%`,
            transition: "height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            position: "relative",
            boxShadow: "0 -2px 10px rgba(94, 53, 177, 0.2)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "12px",
              fontWeight: "600",
              color: colors.textPrimary,
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  color: string;
  delay?: number;
}

// Recent Activity Item
const ActivityItem: React.FC<ActivityItemProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  time, 
  color, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        borderRadius: "12px",
        backgroundColor: colors.lightBg,
        transform: isVisible ? "translateX(0)" : "translateX(-20px)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.5s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.backgroundColor = colors.lavender;
        target.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.backgroundColor = colors.lightBg;
        target.style.transform = "translateX(0)";
      }}
    >
      <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
        <Icon size={20} />
      </Avatar>
      <div style={{ flex: 1 }}>
        <h4 style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: "4px" }}>
          {title}
        </h4>
        <p style={{ color: colors.textSecondary, fontSize: "14px", marginBottom: "8px" }}>
          {description}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: colors.textSecondary, fontSize: "12px" }}>
          <Clock size={12} />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
};

interface PerformanceCardProps {
  title: string;
  value: number;
  target: number;
  icon: LucideIcon;
  color: string;
}

// Performance Card
const PerformanceCard: React.FC<PerformanceCardProps> = ({ 
  title, 
  value, 
  target, 
  icon: Icon, 
  color 
}) => {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: colors.cardBg,
        border: `1px solid ${colors.border}`,
        "&:hover": {
          boxShadow: "0 4px 20px rgba(94, 53, 177, 0.15)",
          transform: "translateY(-2px)",
        },
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
          <Icon size={20} />
        </Avatar>
        <div>
          <p style={{ color: colors.textSecondary, fontSize: "14px" }}>{title}</p>
          <p style={{ color: colors.textPrimary, fontSize: "20px", fontWeight: "700" }}>
            {value} / {target}
          </p>
        </div>
      </div>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: `${color}20`,
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
      <p style={{ color: colors.textSecondary, fontSize: "12px", marginTop: "8px", textAlign: "right" }}>
        {percentage.toFixed(0)}% Complete
      </p>
    </Paper>
  );
};

interface StatData {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  gradient: string;
}

interface ActivityData {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  color: string;
}

// Main Dashboard Component
export default function Dashboard() {
  const statsData: StatData[] = [
    {
      title: "Total Users",
      value: 18765,
      change: 12.6,
      icon: Users,
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    },
    {
      title: "Active Tickets",
      value: 4876,
      change: 0.2,
      icon: MessageSquare,
      gradient: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.secondaryLight} 100%)`,
    },
    {
      title: "Purchase Requests",
      value: 678,
      change: -0.1,
      icon: ShoppingCart,
      gradient: `linear-gradient(135deg, ${colors.success} 0%, #81C784 100%)`,
    },
    {
      title: "Total Revenue",
      value: 55566,
      change: 8.5,
      icon: DollarSign,
      gradient: `linear-gradient(135deg, ${colors.accent} 0%, #FFD54F 100%)`,
    },
  ];

  const chartData = [52, 48, 65, 43, 58, 72, 48, 55, 68, 62, 58, 70];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const recentActivities: ActivityData[] = [
    {
      icon: CheckCircle2,
      title: "New ticket resolved",
      description: "Support ticket #TK-1234 was marked as resolved",
      time: "2 minutes ago",
      color: colors.success,
    },
    {
      icon: Users,
      title: "New user registered",
      description: "John Doe joined the platform",
      time: "15 minutes ago",
      color: colors.secondary,
    },
    {
      icon: ShoppingCart,
      title: "Purchase request approved",
      description: "Order #PR-5678 has been approved",
      time: "1 hour ago",
      color: colors.primary,
    },
    {
      icon: AlertCircle,
      title: "High priority ticket",
      description: "New urgent ticket requires attention",
      time: "2 hours ago",
      color: colors.error,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1900, mx: "auto", p: { xs: 2, md: 3 }, bgcolor: colors.lightBg, minHeight: "100vh" }}>
      {/* Welcome Header */}
      <EnhancedDashboardHeader />

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          mb: 4,
        }}
      >
        {statsData.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 100} />
        ))}
      </Box>

      {/* Charts and Activity Row */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          mb: 4,
        }}
      >
        {/* Monthly Overview Chart */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ color: colors.textPrimary, fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>
                Monthly Overview
              </h2>
              <p style={{ color: colors.textSecondary, fontSize: "14px" }}>
                Ticket resolution trends for 2023
              </p>
            </div>
            <Avatar sx={{ bgcolor: colors.lavender }}>
              <Activity size={20} style={{ color: colors.primary }} />
            </Avatar>
          </div>
          <SimpleBarChart data={chartData} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px" }}>
            {months.map((month) => (
              <span key={month} style={{ fontSize: "11px", color: colors.textSecondary }}>
                {month}
              </span>
            ))}
          </div>
        </Paper>

        {/* Quick Stats */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2 style={{ color: colors.textPrimary, fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>
            Quick Stats
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar sx={{ bgcolor: `${colors.success}20`, width: 40, height: 40 }}>
                  <CheckCircle2 size={20} style={{ color: colors.success }} />
                </Avatar>
                <div>
                  <p style={{ color: colors.textSecondary, fontSize: "12px" }}>Resolved</p>
                  <p style={{ color: colors.textPrimary, fontSize: "18px", fontWeight: "700" }}>
                    <AnimatedCounter end={912} />
                  </p>
                </div>
              </div>
              <Chip label="+9.1%" size="small" sx={{ bgcolor: "#E8F5E9", color: colors.success, fontWeight: 600 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar sx={{ bgcolor: `${colors.secondary}20`, width: 40, height: 40 }}>
                  <Clock size={20} style={{ color: colors.secondary }} />
                </Avatar>
                <div>
                  <p style={{ color: colors.textSecondary, fontSize: "12px" }}>Pending</p>
                  <p style={{ color: colors.textPrimary, fontSize: "18px", fontWeight: "700" }}>
                    <AnimatedCounter end={195} />
                  </p>
                </div>
              </div>
              <Chip label="+1.9%" size="small" sx={{ bgcolor: "#E3F2FD", color: colors.secondary, fontWeight: 600 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar sx={{ bgcolor: `${colors.accent}20`, width: 40, height: 40 }}>
                  <Zap size={20} style={{ color: colors.accent }} />
                </Avatar>
                <div>
                  <p style={{ color: colors.textSecondary, fontSize: "12px" }}>Avg Response</p>
                  <p style={{ color: colors.textPrimary, fontSize: "18px", fontWeight: "700" }}>
                    <AnimatedCounter end={2} suffix="h" />
                  </p>
                </div>
              </div>
              <Chip label="-12%" size="small" sx={{ bgcolor: "#FFF3E0", color: colors.accent, fontWeight: 600 }} />
            </div>
          </div>
        </Paper>
      </Box>

      {/* Performance Metrics */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          mb: 4,
        }}
      >
        <PerformanceCard
          title="Monthly Target"
          value={38566}
          target={55000}
          icon={Target}
          color={colors.primary}
        />
        <PerformanceCard
          title="Conversion Rate"
          value={75}
          target={100}
          icon={TrendingUp}
          color={colors.success}
        />
        <PerformanceCard
          title="Active Projects"
          value={8}
          target={10}
          icon={Package}
          color={colors.secondary}
        />
      </Box>

      {/* Recent Activity */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: colors.cardBg,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ color: colors.textPrimary, fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>
              Recent Activity
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: "14px" }}>
              Latest updates and notifications
            </p>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: colors.primary,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.gap = "8px";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.gap = "4px";
            }}
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {recentActivities.map((activity, index) => (
            <ActivityItem key={index} {...activity} delay={index * 100} />
          ))}
        </div>
      </Paper>
    </Box>
  );
}