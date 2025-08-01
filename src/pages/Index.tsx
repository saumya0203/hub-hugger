import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { User, LogOut } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { RoleSelector } from "@/components/RoleSelector";
import { ManagerDashboard } from "@/components/ManagerDashboard";
import { ResidentDashboard } from "@/components/ResidentDashboard";

type UserRole = "manager" | "resident" | null;

const Index = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [activeItem, setActiveItem] = useState("event-hub");

  if (!userRole) {
    return <RoleSelector onRoleSelect={setUserRole} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <AppSidebar activeItem={activeItem} onItemClick={setActiveItem} />
        
        <main className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white hover:bg-gray-700" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-white font-semibold">VocaLinc</h1>
                  <p className="text-gray-400 text-sm">Voice-First Community</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="h-4 w-4" />
                <span className="capitalize">{userRole}</span>
              </div>
              <Button
                onClick={() => setUserRole(null)}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeItem === "event-hub" && (
              <div>
                {/* Event Hub Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-lg"></div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Event Hub</h1>
                      <p className="text-gray-400">Community events and engagement platform</p>
                    </div>
                  </div>
                </div>

                {/* Role-based Content */}
                {userRole === "manager" ? <ManagerDashboard /> : <ResidentDashboard />}
              </div>
            )}
            
            {activeItem !== "event-hub" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-2 capitalize">{activeItem.replace("-", " ")}</h2>
                <p className="text-gray-400">This section is coming soon.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
