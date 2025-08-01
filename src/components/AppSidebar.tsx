import { Calendar, BarChart3, Settings, Shield, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const sidebarItems = [
  { id: "dashboard", title: "Dashboard", icon: Home },
  { id: "operations", title: "Operations", icon: Settings },
  { id: "aura-safety", title: "Aura Safety Engine", icon: Shield },
  { id: "event-hub", title: "Event Hub", icon: Calendar },
  { id: "analytics", title: "Analytics", icon: BarChart3 },
];

export function AppSidebar({ activeItem, onItemClick }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} bg-gray-900 border-r border-gray-800`}>
      <SidebarContent className="bg-gray-900">
        {/* VocaLinc Branding */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <User className="w-2 h-2 text-purple-600" />
              </div>
            </div>
            {!collapsed && (
              <div>
                <h3 className="text-white font-semibold">VocaLinc</h3>
                <p className="text-gray-400 text-sm">Voice-First Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = activeItem === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onItemClick(item.id)}
                      className={`
                        w-full justify-start px-3 py-2 rounded-lg text-left transition-colors
                        ${isActive 
                          ? "bg-purple-600 text-white" 
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Voice Assistant at bottom */}
        <div className="mt-auto p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {!collapsed && (
              <div>
                <p className="text-green-400 text-sm font-medium">Voice Assistant</p>
                <p className="text-gray-400 text-xs">Ready to assist</p>
                <p className="text-gray-500 text-xs">Say "Hey VocaLinc"</p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}