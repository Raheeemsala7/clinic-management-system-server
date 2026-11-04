import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

import {
  DashboardLayoutClient,
  UserRole,
} from "@/features/dashboard";

interface DashboardContentProps {
  children?: React.ReactNode;
  admin?: React.ReactNode;
  doctor?: React.ReactNode;
  receptionist?: React.ReactNode;
}

export default async function DashboardContent({
  children,
  admin,
  doctor,
  receptionist,
}: DashboardContentProps) {
  const session = await getServerSession(authOptions);

  // المستخدم غير مسجل دخول
  if (!session?.user) {
    redirect("/auth/login");
  }

  const rawRole = session.user.role?.toUpperCase();

  let role: UserRole;

  switch (rawRole) {
    case "ADMIN":
      role = "ADMIN";
      break;

    case "DOCTOR":
      role = "DOCTOR";
      break;

    case "RECEPTION":
    case "RECEPTIONIST":
      role = "RECEPTIONIST";
      break;

    default:
      redirect("/unauthorized");
  }

  console.log(role);
  

  const renderRoleContent = () => {
    switch (role) {
      case "DOCTOR":
        return doctor 

      case "RECEPTIONIST":
        return receptionist 

      case "ADMIN":
        return admin 
    }
  };

  return (
    <DashboardLayoutClient role={role}>
      { renderRoleContent() || children }
    </DashboardLayoutClient>
  );
}