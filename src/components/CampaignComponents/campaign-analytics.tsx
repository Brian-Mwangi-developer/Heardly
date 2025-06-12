"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/trpc/react"
import { Loader2, Mail, Target, TrendingDown, TrendingUp, Users, Zap } from "lucide-react"
import { useState } from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts"

const COLORS = {
    potential: "#10b981",
    query: "#f59e0b",
    dead: "#ef4444",
}

// Status color mapping
const getStatusColor = (status: string) => {
    switch (status) {
        case "ACTIVE":
            return "bg-green-100 text-green-800"
        case "PAUSED":
            return "bg-yellow-100 text-yellow-800"
        case "COMPLETED":
            return "bg-blue-100 text-blue-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

export function CampaignAnalytics() {
    const [selectedCampaign, setSelectedCampaign] = useState<string>("all")
    const [timeRange, setTimeRange] = useState<string>("30d")

    // Fetch campaigns using tRPC
    const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = api.campaign.getCampaigns.useQuery()

    if (campaignsLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading campaign data...</span>
            </div>
        )
    }

    if (campaignsError) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading campaigns</p>
                    <p className="text-gray-600 text-sm">{campaignsError.message}</p>
                </div>
            </div>
        )
    }

    if (!campaigns || campaigns.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-gray-600 mb-2">No campaigns found</p>
                    <p className="text-gray-500 text-sm">Create your first campaign to see analytics</p>
                </div>
            </div>
        )
    }

    // Filter campaigns based on selection
    const filteredCampaigns = selectedCampaign === "all" ? campaigns : campaigns.filter(c => c.id === selectedCampaign)

    // Calculate totals
    const totalEmails = filteredCampaigns.reduce((sum, campaign) => sum + campaign.emailCount, 0)
    const totalPotential = filteredCampaigns.reduce((sum, campaign) => sum + campaign.potentialCount, 0)
    const totalQuery = filteredCampaigns.reduce((sum, campaign) => sum + campaign.queryCount, 0)
    const totalDead = filteredCampaigns.reduce((sum, campaign) => sum + campaign.deadCount, 0)

    const conversionRate = totalEmails > 0 ? (totalPotential / totalEmails) * 100 : 0
    const responseRate = totalEmails > 0 ? ((totalPotential + totalQuery) / totalEmails) * 100 : 0

    // Prepare pie chart data
    const pieData = [
        { name: "Potential", value: totalPotential, color: COLORS.potential },
        { name: "Query", value: totalQuery, color: COLORS.query },
        { name: "Dead", value: totalDead, color: COLORS.dead },
    ].filter(item => item.value > 0) // Only show categories with data

    // Prepare campaign comparison data
    const campaignComparison = filteredCampaigns.map((campaign) => ({
        name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
        fullName: campaign.name,
        potential: campaign.potentialCount,
        query: campaign.queryCount,
        dead: campaign.deadCount,
        total: campaign.emailCount,
        conversionRate: campaign.emailCount > 0 ? (campaign.potentialCount / campaign.emailCount) * 100 : 0,
    }))

    // Calculate trend indicators (mock for now - you can implement actual trend calculation)
    const emailTrend = { direction: 'up', value: 12 }
    const potentialTrend = { direction: 'up', value: 8 }
    const conversionTrend = { direction: 'up', value: 5 }
    const responseTrend = { direction: 'down', value: 2 }

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
                            {campaigns.map((campaign) => (
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
                                <p className="text-2xl font-bold text-gray-900">{totalEmails.toLocaleString()}</p>
                            </div>
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                            {emailTrend.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            <span className={`text-sm ${emailTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {emailTrend.direction === 'up' ? '+' : '-'}{emailTrend.value}% from last period
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Potential Leads</p>
                                <p className="text-2xl font-bold text-green-600">{totalPotential.toLocaleString()}</p>
                            </div>
                            <Target className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="mt-4 flex items-center">
                            {potentialTrend.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            <span className={`text-sm ${potentialTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {potentialTrend.direction === 'up' ? '+' : '-'}{potentialTrend.value}% conversion rate
                            </span>
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
                            {conversionTrend.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            <span className={`text-sm ${conversionTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {conversionRate > 15 ? 'Above' : 'Below'} industry avg
                            </span>
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
                            {responseTrend.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            <span className={`text-sm ${responseTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {responseTrend.direction === 'up' ? '+' : '-'}{responseTrend.value}% from last period
                            </span>
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
                        {pieData.length > 0 ? (
                            <>
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
                                                {entry.name}: {entry.value.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                No data available for selected campaigns
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Campaign Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {campaignComparison.length > 0 ? (
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
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            fontSize={12}
                                        />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="potential" stackId="a" fill={COLORS.potential} />
                                        <Bar dataKey="query" stackId="a" fill={COLORS.query} />
                                        <Bar dataKey="dead" stackId="a" fill={COLORS.dead} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                No campaigns to compare
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Rate Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Conversion Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    {campaignComparison.length > 0 ? (
                        <ChartContainer
                            config={{
                                conversionRate: { label: "Conversion Rate (%)", color: "#3b82f6" },
                            }}
                            className="h-[300px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={campaignComparison}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line
                                        type="monotone"
                                        dataKey="conversionRate"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                            No data available for trend analysis
                        </div>
                    )}
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
                                {filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">
                                            <div>
                                                <p className="font-medium">{campaign.name}</p>
                                                {campaign.description && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {campaign.description.length > 50
                                                            ? campaign.description.substring(0, 50) + '...'
                                                            : campaign.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center p-2">{campaign.emailCount.toLocaleString()}</td>
                                        <td className="text-center p-2">
                                            <span className="text-green-600 font-semibold">
                                                {campaign.potentialCount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="text-center p-2">
                                            <span className="text-yellow-600 font-semibold">
                                                {campaign.queryCount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="text-center p-2">
                                            <span className="text-red-600 font-semibold">
                                                {campaign.deadCount.toLocaleString()}
                                            </span>
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
                                            <Badge className={getStatusColor(campaign.status)}>
                                                {campaign.status.toLowerCase()}
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