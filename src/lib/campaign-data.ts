import { db } from "@/server/db"
import { CampaignStatusEnum } from "@prisma/client"

// export 

export const mockCampaigns = [
    {
        name: "Q1 AI Product Launch",
        description: "Outreach campaign for our new AI-powered analytics platform targeting tech startups and scale-ups.",
        targetAudience: "SaaS Startups, Tech CTOs, AI Enthusiasts",
        goals: "Generate 50 qualified leads, 10 demos scheduled, 3 pilot customers",
        status: CampaignStatusEnum.ACTIVE,
        threadIds: [],
        emailCount: 45,
        potentialCount: 12,
        queryCount: 18,
        deadCount: 15,
    },
    {
        name: "Enterprise AI Consulting",
        description: "Targeting enterprise companies looking for AI transformation and consulting services.",
        targetAudience: "Enterprise CTOs, Digital Transformation Leaders",
        goals: "Book 20 consultation calls, close 2 enterprise deals",
        status: CampaignStatusEnum.ACTIVE,
        threadIds: [],
        emailCount: 32,
        potentialCount: 8,
        queryCount: 12,
        deadCount: 12,
    },
    {
        name: "Developer Tools Outreach",
        description: "Promoting our AI development tools and APIs to software developers and engineering teams.",
        targetAudience: "Software Developers, Engineering Managers, DevOps Teams",
        goals: "1000 API signups, 100 paid conversions",
        threadIds: [],
        status: CampaignStatusEnum.PAUSED,
        emailCount: 28,
        potentialCount: 5,
        queryCount: 15,
        deadCount: 8,
    },
    {
        name: "Holiday Season Promotion",
        description: "Special holiday pricing campaign for our AI email analysis platform.",
        targetAudience: "Sales Teams, Marketing Professionals, Small Businesses",
        goals: "200 new subscriptions, $50k revenue",
        threadIds: [],
        status: CampaignStatusEnum.COMPLETED,
        emailCount: 156,
        potentialCount: 42,
        queryCount: 67,
        deadCount: 47,
    },
]

export const mockAnalyticsData = [
    { date: "2024-01-01", campaignId: "1", potential: 3, query: 5, dead: 2, total: 10 },
    { date: "2024-01-02", campaignId: "1", potential: 2, query: 4, dead: 3, total: 9 },
    { date: "2024-01-03", campaignId: "2", potential: 4, query: 3, dead: 1, total: 8 },
    { date: "2024-01-04", campaignId: "2", potential: 1, query: 5, dead: 4, total: 10 },
    { date: "2024-01-05", campaignId: "3", potential: 2, query: 6, dead: 2, total: 10 },
    { date: "2024-01-06", campaignId: "1", potential: 3, query: 4, dead: 5, total: 12 },
]


async function seed() {
    try {
        for (const campaign of mockCampaigns) {
            await db.campaign.create({
                data: campaign,
            });
        }
        console.log('🌱 Campaign data seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding campaign data:', error);
    } finally {
        await db.$disconnect();
    }
}

seed();