"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/trpc/react"
import { Loader2, Target, X } from "lucide-react"
import { useEffect, useState } from "react"

interface CampaignAssignmentModalProps {
    emails: Array<{
        id: string
        sender: string
        subject: string
        threadId?: string
        emailId?: string
    }>
    isOpen: boolean
    onClose: () => void
    onAssign: (emailIds: string[], campaignId: string) => void
    isAssigning: boolean
}

export function CampaignAssignmentModal({ emails, isOpen, onClose, onAssign, isAssigning = false }: CampaignAssignmentModalProps) {
    const [selectedCampaign, setSelectedCampaign] = useState<string>("")
    const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = api.campaign.getCampaigns.useQuery(
        undefined,
        { enabled: isOpen }
    )

    // Reset selected campaign when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedCampaign("")
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleAssign = () => {
        if (selectedCampaign && emails.length > 0) {
            const emailIds = emails.map((email) => email.emailId || email.id)
            onAssign(emailIds, selectedCampaign)
            onClose()
        }
    }

    const handleClose = () => {
        setSelectedCampaign("")
        onClose()
    }
    const selectedCampaignData = campaigns?.find(c => c.id === selectedCampaign)

    return (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                            <Target className="h-5 w-5 mr-2 text-blue-600" />
                            Assign to Campaign
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            Assign {emails.length} email{emails.length > 1 ? "s" : ""} to a campaign for tracking and analytics.
                        </p>

                        <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
                            {emails.map((email) => (
                                <div key={email.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium truncate">{email.sender}</span>
                                    <span className="text-xs text-gray-500">
                                        {email.subject.length > 30 ? `${email.subject.substring(0, 30)}...` : email.subject}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Select Campaign</label>

                        {/* Loading state for campaigns */}
                        {campaignsLoading ? (
                            <div className="flex items-center justify-center p-4 border rounded-md bg-gray-50">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="text-sm text-gray-600">Loading campaigns...</span>
                            </div>
                        ) : campaignsError ? (
                            <div className="p-4 border rounded-md bg-red-50 text-red-600">
                                <span className="text-sm">Error loading campaigns. Please try again.</span>
                            </div>
                        ) : (
                            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a campaign..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {campaigns && campaigns.length > 0 ? (
                                        campaigns.map((campaign) => (
                                            <SelectItem key={campaign.id} value={campaign.id}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{campaign.name}</span>
                                                    <Badge
                                                        className={
                                                            campaign.status === "ACTIVE"
                                                                ? "bg-green-100 text-green-800 ml-2"
                                                                : "bg-gray-100 text-gray-800 ml-2"
                                                        }
                                                    >
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="" disabled>
                                            No campaigns available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    {selectedCampaignData && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">{selectedCampaignData.name}</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Current: {selectedCampaignData.emailCount || 0} threads
                                    </p>
                                </div>
                                <div className="text-xs text-blue-600">
                                    <div>P: {selectedCampaignData.potentialCount || 0}</div>
                                    <div>Q: {selectedCampaignData.queryCount || 0}</div>
                                    <div>D: {selectedCampaignData.deadCount || 0}</div>
                                </div>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                                {selectedCampaignData.description || "No description available"}
                            </p>
                        </div>
                    )}

                    <div className="flex space-x-2 pt-4">
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedCampaign || campaignsLoading || emails.length === 0}
                            className="flex-1"
                        >
                            {campaignsLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                'Assign to Campaign'
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                        You can create new campaigns in the Campaigns section
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}