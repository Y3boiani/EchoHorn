import Header from "@/components/header/header";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard - Echohorn",
  description: "Manage trial bookings and reservations",
};

export default function AdminPage() {
  return (
    <div>
      <Header />
      <AdminDashboard />
    </div>
  );
}
