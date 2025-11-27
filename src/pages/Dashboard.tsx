import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DoorOpen, DoorClosed, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch students count
      const { count: studentsCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // Fetch rooms data
      const { data: rooms } = await supabase
        .from("rooms")
        .select("status");

      const totalRooms = rooms?.length || 0;
      const availableRooms = rooms?.filter((r) => r.status === "available").length || 0;
      const occupiedRooms = totalRooms - availableRooms;

      setStats({
        totalStudents: studentsCount || 0,
        totalRooms,
        availableRooms,
        occupiedRooms,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: DoorOpen,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Available Rooms",
      value: stats.availableRooms,
      icon: DoorClosed,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Occupied Rooms",
      value: stats.occupiedRooms,
      icon: TrendingUp,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Hostel Management System</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-card hover:shadow-hover transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Add new students to the system
              </p>
              <p className="text-sm text-muted-foreground">
                • Manage room allocations
              </p>
              <p className="text-sm text-muted-foreground">
                • Export student data to CSV
              </p>
              <p className="text-sm text-muted-foreground">
                • Monitor room availability
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The hostel management system helps you efficiently manage student records,
                room allocations, and hostel operations.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Use the sidebar to navigate between different sections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
