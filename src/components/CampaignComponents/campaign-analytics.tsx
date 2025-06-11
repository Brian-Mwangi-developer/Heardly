"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Mail, Users, Zap } from "lucide-react"
import { mockCampaigns, mockAnalyticsData } from "@/lib/campaign-data"

const COLORS = {
    potential: "#10b981",
    query: "#f59e0b",
    dead: "#ef4444",
}

export function CampaignAnalytics() {
    const [selectedCampaign, setSelectedCampaign] = useState<string>("all")
    const [timeRange, setTimeRange] = useState<string>("30d")

    const filteredData =
        selectedCampaign === "all" ? mockAnalyticsData : mockAnalyticsData.filter((d) => d.campaignId === selectedCampaign)

    const totalEmails = filteredData.reduce((sum, d) => sum + d.total, 0)
    const totalPotential = filteredData.reduce((sum, d) => sum + d.potential, 0)
    const totalQuery = filteredData.reduce((sum, d) => sum + d.query, 0)
    const totalDead = filteredData.reduce((sum, d) => sum + d.dead, 0)

    const conversionRate = totalEmails > 0 ? (totalPotential / totalEmails) * 100 : 0
    const responseRate = totalEmails > 0 ? ((totalPotential + totalQuery) / totalEmails) * 100 : 0

    const pieData = [
        { name: "Potential", value: totalPotential, color: COLORS.potential },
        { name: "Query", value: totalQuery, color: COLORS.query },
        { name: "Dead", value: totalDead, color: COLORS.dead },
    ]

    const campaignComparison = mockCampaigns.map((campaign) => ({
        name: campaign.name,
        potential: campaign.potentialCount,
        query: campaign.queryCount,
        dead: campaign.deadCount,
        total: campaign.emailCount,
        conversionRate: campaign.emailCount > 0 ? (campaign.potentialCount / campaign.emailCount) * 100 : 0,
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Campaign Performance</h2>
                    <p className="text-gray-600 mt-1">Track and analyze your email campaign effectiveness</p>
                </div>
                <div className="flex gap-4">
                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Campaigns</SelectItem>
                            {mockCampaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                    {campaign.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                                <p className="text-2xl font-bold text-gray-900">{totalEmails}</p>
                            </div>
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm text-green-600">+12% from last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Potential Leads</p>
                                <p className="text-2xl font-bold text-green-600">{totalPotential}</p>
                            </div>
                            <Target className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm text-green-600">+8% conversion rate</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                <p className="text-2xl font-bold text-blue-600">{conversionRate.toFixed(1)}%</p>
                            </div>
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm text-green-600">Above industry avg</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                                <p className="text-2xl font-bold text-purple-600">{responseRate.toFixed(1)}%</p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            <span className="text-sm text-red-600">-2% from last period</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Outcomes Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Email Outcomes Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                potential: { label: "Potential", color: COLORS.potential },
                                query: { label: "Query", color: COLORS.query },
                                dead: { label: "Dead", color: COLORS.dead },
                            }}
                            className="h-[300px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="flex justify-center space-x-6 mt-4">
                            {pieData.map((entry) => (
                                <div key={entry.name} className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                                    <span className="text-sm text-gray-600">
                                        {entry.name}: {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Campaign Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                potential: { label: "Potential", color: COLORS.potential },
                                query: { label: "Query", color: COLORS.query },
                                dead: { label: "Dead", color: COLORS.dead },
                            }}
                            className="h-[300px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={campaignComparison}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="potential" stackId="a" fill={COLORS.potential} />
                                    <Bar dataKey="query" stackId="a" fill={COLORS.query} />
                                    <Bar dataKey="dead" stackId="a" fill={COLORS.dead} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Rate Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Conversion Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            conversionRate: { label: "Conversion Rate", color: "#3b82f6" },
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={campaignComparison}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="conversionRate" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Campaign Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Campaign</th>
                                    <th className="text-center p-2">Total Emails</th>
                                    <th className="text-center p-2">Potential</th>
                                    <th className="text-center p-2">Query</th>
                                    <th className="text-center p-2">Dead</th>
                                    <th className="text-center p-2">Conversion Rate</th>
                                    <th className="text-center p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{campaign.name}</td>
                                        <td className="text-center p-2">{campaign.emailCount}</td>
                                        <td className="text-center p-2">
                                            <span className="text-green-600 font-semibold">{campaign.potentialCount}</span>
                                        </td>
                                        <td className="text-center p-2">
                                            <span className="text-yellow-600 font-semibold">{campaign.queryCount}</span>
                                        </td>
                                        <td className="text-center p-2">
                                            <span className="text-red-600 font-semibold">{campaign.deadCount}</span>
                                        </td>
                                        <td className="text-center p-2">
                                            <span className="font-semibold">
                                                {campaign.emailCount > 0
                                                    ? ((campaign.potentialCount / campaign.emailCount) * 100).toFixed(1)
                                                    : 0}
                                                %
                                            </span>
                                        </td>
                                        <td className="text-center p-2">
                                            <Badge
                                                className={
                                                    campaign.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                                }
                                            >
                                                {campaign.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
