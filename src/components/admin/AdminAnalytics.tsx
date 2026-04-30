"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Activity,
  UserCheck,
  DollarSign,
  Percent,
  BarChart2,
} from "lucide-react";

const COLORS = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
};

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  COMPLETED: UserCheck,
  CANCELLED: XCircle,
};

export default function AdminAnalytics() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            Analytics Error
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Failed to load analytics. Please try refreshing the page.
        </CardContent>
      </Card>
    );
  }

  const statusData = [
    { name: "Pending",   value: data.statusCounts.PENDING,   color: COLORS.PENDING },
    { name: "Confirmed", value: data.statusCounts.CONFIRMED, color: COLORS.CONFIRMED },
    { name: "Completed", value: data.statusCounts.COMPLETED, color: COLORS.COMPLETED },
    { name: "Cancelled", value: data.statusCounts.CANCELLED, color: COLORS.CANCELLED },
  ].filter((s) => s.value > 0);

  // Calculate metrics
  const totalAppointments = Object.values(data.statusCounts).reduce((a: number, b: number) => a + b, 0);
  const completionRate = totalAppointments > 0
    ? ((data.statusCounts.COMPLETED / totalAppointments) * 100).toFixed(1)
    : 0;
  const cancellationRate = totalAppointments > 0
    ? ((data.statusCounts.CANCELLED / totalAppointments) * 100).toFixed(1)
    : 0;

  // Active doctors from totals (not filtered topDoctors)
  const activeDoctorsCount = data.totals?.activeDoctors ?? data.topDoctors.filter((d: any) => d.isActive).length;
  const totalDoctorsCount = data.totals?.totalDoctors ?? data.topDoctors.length;

  // Format daily dates: "2026-04-24" → "Apr 24"
  const formattedDaily = data.daily.map((d: any) => ({
    ...d,
    day: new Date(d.day + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Appointments */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>

        {/* Active Doctors */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDoctorsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">of {totalDoctorsCount} total</p>
          </CardContent>
        </Card>

        {/* Cancellation Rate */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <Percent className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Trend Chart - Enhanced */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Appointments Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedDaily}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004A61" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#004A61" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#004A61"
                  strokeWidth={3}
                  fill="url(#colorCount)"
                  dot={{ fill: '#004A61', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown - Enhanced */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} (${totalAppointments > 0 ? ((value / totalAppointments) * 100).toFixed(1) : 0}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {statusData.map((status) => {
                const pct = totalAppointments > 0 ? ((status.value / totalAppointments) * 100).toFixed(0) : 0;
                return (
                  <div key={status.name} className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
                    <span className="text-xs font-medium truncate">{status.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(data.statusCounts).map(([status, count]) => {
          const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS];
          const color = COLORS[status as keyof typeof COLORS];
          return (
            <Card key={status} className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: color }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {status.toLowerCase()}
                </CardTitle>
                <Icon className="size-4" style={{ color }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalAppointments > 0 ? ((count / totalAppointments) * 100).toFixed(1) : 0}% of total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Doctors - Enhanced */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Top Doctors by Bookings
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Showing {data.topDoctors.length} doctors
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {data.topDoctors.map((d: any, index: number) => (
              <div 
                key={d.doctorId} 
                className="border rounded-xl p-4 hover:shadow-md transition-all hover:border-primary/50 relative overflow-hidden group"
              >
                {/* Rank Badge */}
                {index < 3 && (
                  <div className="absolute top-2 right-2">
                    <div className={`
                      size-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                      ${index === 1 ? 'bg-gray-400 text-gray-900' : ''}
                      ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                    `}>
                      {index + 1}
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate group-hover:text-primary transition-colors">
                      {d.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{d.speciality}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{d.count} bookings</span>
                  </div>
                  <span className={`
                    text-xs font-medium px-2 py-1 rounded-full
                    ${d.isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }
                  `}>
                    {d.isActive ? '● Active' : '● Inactive'}
                  </span>
                </div>

                {/* Progress bar showing booking volume */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Booking volume</span>
                    <span>{((d.count / data.topDoctors[0].count) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(d.count / data.topDoctors[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.topDoctors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="size-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No doctor data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Performance Comparison */}
      {data.topDoctors.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="size-5 text-primary" />
              Doctor Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topDoctors.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#6b7280"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 74, 97, 0.08)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#004A61"
                  radius={[8, 8, 0, 0]}
                  activeBar={{ fill: '#00698a' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}