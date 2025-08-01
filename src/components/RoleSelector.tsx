import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Settings } from "lucide-react";

interface RoleSelectorProps {
  onRoleSelect: (role: "manager" | "resident") => void;
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* VocaLinc Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">VocaLinc</h1>
          <p className="text-gray-400">Voice-First Community</p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Welcome to Event Hub</CardTitle>
            <CardDescription className="text-gray-400">
              Please select your role to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => onRoleSelect("manager")}
              variant="outline"
              className="w-full h-16 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Manager</div>
                  <div className="text-sm text-gray-400">Create events & view analytics</div>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => onRoleSelect("resident")}
              variant="outline"
              className="w-full h-16 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Resident</div>
                  <div className="text-sm text-gray-400">Provide feedback on events</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}