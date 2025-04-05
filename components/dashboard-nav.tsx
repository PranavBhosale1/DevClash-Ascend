import { FC } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconType } from "react-icons"
import { LuPlus, LuBookMarked, LuLayoutDashboard, LuSearch } from "react-icons/lu"
import { cn } from "@/lib/utils"

interface DashboardNavProps {}

interface NavItem {
  path: string
  name: string
  icon: IconType
}

const navItems: NavItem[] = [
  {
    path: "/dashboard",
    name: "Overview",
    icon: LuLayoutDashboard,
  },
  {
    path: "/dashboard/my-roadmaps",
    name: "My Roadmaps",
    icon: LuBookMarked,
  },
  {
    path: "/dashboard/browse",
    name: "Browse",
    icon: LuSearch,
  },
  {
    path: "/dashboard/create",
    name: "Create",
    icon: LuPlus,
  },
]

const DashboardNav: FC<DashboardNavProps> = ({}) => {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link key={index} href={item.path}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.path ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.name}</span>
          </span>
        </Link>
      ))}
    </nav>
  )
}

export default DashboardNav 