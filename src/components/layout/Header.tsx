
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu, Settings, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, userContext, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Initiating logout...');
      await logout();
      console.log('Logout successful, redirecting to login...');
      navigate('/login');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error signing out. Please try again.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'analyst':
        return 'bg-blue-100 text-blue-800';
      case 'reviewer':
        return 'bg-green-100 text-green-800';
      case 'auditor':
        return 'bg-purple-100 text-purple-800';
      case 'executive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
      {/* Left Side - Menu Toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Show organization name */}
        {userContext?.organizationId && (
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">
              Organization
            </h1>
          </div>
        )}
      </div>

      {/* Right Side - User Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors">
               <Avatar className="h-8 w-8">
                <AvatarImage 
                  src="" 
                  alt={profile?.full_name || 'User'} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(profile?.full_name || user?.email || 'U')}
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">
                  {profile?.full_name || user?.email}
                </span>
                {userContext?.roles && userContext.roles.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getRoleBadgeColor(userContext.roles[0])}`}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {userContext.roles[0].charAt(0).toUpperCase() + userContext.roles[0].slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              {userContext?.organizationId && (
                <p className="text-xs text-muted-foreground">Organization</p>
              )}
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
