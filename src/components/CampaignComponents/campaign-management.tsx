"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"

import { api } from "@/trpc/react"
import { Calendar, Edit, Plus, Target, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
// import type { CampaignStatusEnum } from "@prisma/client"

export const CampaignStatusEnum = {
    ACTIVE: "active",
    PAUSED: "paused",
    COMPLETED: "completed",
    ARCHIVED: "archived",
} as const

export interface Campaign {
    id: string
    name: string
    description: string | null
    targetAudience: string
    goals: string
    createdAt?: Date
    status: keyof typeof CampaignStatusEnum
    emailCount: number | null
    potentialCount: number | null
    queryCount: number | null
    deadCount: number | null
}

export function CampaignManagement() {
    const results = api.campaign.getCampaigns.useQuery()
    const createCampaignMutation = api.campaign.createNewCampaign.useMutation({
        onSuccess: () => {
            results.refetch()
            toast.success("Campaign created successfully");
            setNewCampaign({
                name: "",
                description: "",
                targetAudience: "",
                goals: "",
            });
            setIsCreating(false);
        }
    })

    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
    const [newCampaign, setNewCampaign] = useState({
        name: "",
        description: "",
        targetAudience: "",
        goals: "",
    })

    useEffect(() => {
        if (results.data) {
            setCampaigns(results.data)
        }
    }, [results.data])

    const createCampaign = () => {
        if (!newCampaign.name.trim()) {
            toast.error("Campaign name is required")
            return
        }
        createCampaignMutation.mutateAsync({
            name: newCampaign.name,
            description: newCampaign.description || null,
            targetAudience: newCampaign.targetAudience,
            goals: newCampaign.goals,
            status: "ACTIVE",
        })
    }

    const deleteCampaign = (id: string) => {
        setCampaigns((prev) => prev.filter((c) => c.id !== id))
        toast.success("Campaign deleted successfully")
    }

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
                    <p className="text-gray-600 mt-1">Manage your email outreach campaigns</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                </Button>
            </div>

            {isCreating && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Target className="h-5 w-5 mr-2 text-blue-600" />
                            Create New Campaign
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Campaign Name</Label>
                                <Input
                                    placeholder="e.g., Q1 Product Launch"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign((prev) => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Target Audience</Label>
                                <Input
                                    placeholder="e.g., SaaS Startups, Enterprise CTOs"
                                    value={newCampaign.targetAudience}
                                    onChange={(e) => setNewCampaign((prev) => ({ ...prev, targetAudience: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe your campaign objectives and strategy..."
                                value={newCampaign.description}
                                onChange={(e) => setNewCampaign((prev) => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>Goals</Label>
                            <Textarea
                                placeholder="What do you want to achieve with this campaign?"
                                value={newCampaign.goals}
                                onChange={(e) => setNewCampaign((prev) => ({ ...prev, goals: e.target.value }))}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={createCampaign} disabled={!newCampaign.name.trim()}
                                className="cursor-pointer">
                                Create Campaign
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                    <Badge className={`mt-2 ${getStatusColor(campaign.status)}`}>{campaign.status}</Badge>
                                </div>
                                <div className="flex space-x-1">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingCampaign(campaign)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteCampaign(campaign.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="h-4 w-4 mr-2" />
                                    {campaign.targetAudience}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Created {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : "Unknown"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{campaign.emailCount}</div>
                                    <div className="text-xs text-gray-600">Total Emails</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{campaign.potentialCount}</div>
                                    <div className="text-xs text-gray-600">Potential Leads</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-yellow-600">{campaign.queryCount}</div>
                                    <div className="text-xs text-gray-600">Queries</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-red-600">{campaign.deadCount}</div>
                                    <div className="text-xs text-gray-600">Dead Leads</div>
                                </div>
                            </div>

                            {(campaign.emailCount ?? 0) > 0 && (
                                <div className="pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Conversion Rate</span>
                                        <span className="font-semibold text-green-600">
                                            {(((campaign.potentialCount ?? 0) / (campaign.emailCount ?? 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {campaigns.length === 0 && !isCreating && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                        <p className="text-gray-600 mb-4">Create your first campaign to start tracking email effectiveness</p>
                        <Button onClick={() => setIsCreating(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Campaign
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
