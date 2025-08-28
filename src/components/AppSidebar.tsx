import { useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Video, 
  Send, 
  Settings, 
  FileText 
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Candidatos", url: "/candidatos", icon: Users },
  { title: "Cortes", url: "/cortes", icon: Scissors },
  { title: "Render", url: "/render", icon: Video },
  { title: "Postagem", url: "/postagem", icon: Send },
  { title: "Configuração", url: "/config", icon: Settings },
  { title: "Logs", url: "/logs", icon: FileText },
]

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const collapsed = state === "collapsed"
  
  const getNavClasses = (active: boolean) =>
    active 
      ? "bg-primary text-primary-foreground font-medium shadow-card" 
      : "hover:bg-accent hover:text-accent-foreground"

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            {!collapsed && "TikTok Automação"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavClasses(isActive)}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}