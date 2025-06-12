import { CampaignAnalytics } from "@/components/CampaignComponents/campaign-analytics";

export default function AnalyticsPage() {
    return (
        <div className="h-full p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Campaign Analytics</h1>
                <p className="text-gray-600 mt-2">Track campaign performance and analyze email outcomes</p>
            </div>
            <CampaignAnalytics />
        </div>
    )
}
