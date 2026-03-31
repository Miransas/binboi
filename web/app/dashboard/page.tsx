"use client"
import DashboardPage from '../../components/dashboard/shared/dashboard'
import { DashboardRouteFrame } from "./_components/dashboard-route-frame";

export default function Page() {
  return (
    <DashboardRouteFrame variant="overview">
      <DashboardPage />
    </DashboardRouteFrame>
  )
}
