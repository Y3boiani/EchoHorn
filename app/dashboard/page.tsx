import { Suspense } from 'react';
import Header from "@/components/header/header";
import Dashboard from "@/components/dashboard/Dashboard";

export const metadata = {
  title: "Dashboard - Echohorn",
  description: "Track your trips, view truck details, and manage your payments with Echohorn.",
};

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<DashboardLoading />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
