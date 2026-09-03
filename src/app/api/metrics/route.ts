import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const env = searchParams.get("env") || "Production"

  // Example API returning metrics based on parameters
  const metrics = [
    {
      id: "total-pipelines",
      title: "Total Pipelines",
      value: env === "Staging" ? "42" : "1900",
      changeText: "12 vs yesterday",
      isPositive: true,
      iconType: "network",
      iconBgColor: "bg-emerald-50 border border-emerald-100",
      iconColor: "text-emerald-600",
      sparklineData: [40, 55, 45, 75, 60, 80, 68, 75, 60, 85, 78, 92],
      sparklineColor: "#10b981",
    },
    {
      id: "success-rate",
      title: "Success Rate (24h)",
      value: env === "Staging" ? "98.5%" : "12.2%",
      changeText: "2.1% vs yesterday",
      isPositive: true,
      iconType: "check",
      iconBgColor: "bg-emerald-50 border border-emerald-100",
      iconColor: "text-emerald-600",
      sparklineData: [60, 70, 78, 72, 80, 75, 82, 68, 72, 85, 80, 91.3],
      sparklineColor: "#10b981",
    },
    {
      id: "runs",
      title: "Runs (24h)",
      value: "532",
      changeText: "18.7% vs yesterday",
      isPositive: true,
      iconType: "play",
      iconBgColor: "bg-blue-50 border border-blue-100",
      iconColor: "text-blue-600",
      sparklineData: [50, 60, 55, 72, 80, 68, 58, 65, 82, 75, 88, 95],
      sparklineColor: "#10b981",
    },
    {
      id: "failed-pipelines",
      title: "Failed Pipelines",
      value: "18",
      changeText: "3 vs yesterday",
      isPositive: false,
      iconType: "alert",
      iconBgColor: "bg-rose-50 border border-rose-100",
      iconColor: "text-rose-500",
      sparklineData: [50, 50, 52, 70, 80, 62, 52, 58, 70, 65, 55, 60],
      sparklineColor: "#ef4444",
    },
    {
      id: "avg-duration",
      title: "Avg. Duration (24h)",
      value: "14m 32s",
      changeText: "8.4% vs yesterday",
      isPositive: true,
      iconType: "clock",
      iconBgColor: "bg-orange-50 border border-orange-100",
      iconColor: "text-orange-500",
      sparklineData: [60, 70, 78, 65, 58, 72, 62, 80, 72, 82, 88, 92],
      sparklineColor: "#10b981",
    },
  ]

  return NextResponse.json(metrics)
}
