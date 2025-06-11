import { CampaignManagement } from "@/components/CampaignComponents/campaign-management"

const CampaignsPage = () => {
    return (
        <div className="h-full p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
                <p className="text-gray-600 mt-2">
                    Create and manage email campaigns, track their effectiveness and analyze outcomes
                </p>
            </div>
            <CampaignManagement />
        </div>
    )
}

export default CampaignsPage