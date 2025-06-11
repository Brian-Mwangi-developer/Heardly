"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStreamingAnalysis } from "@/hooks/use-streaming-analysis";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
    AlertTriangle,
    CheckCircle,
    Lightbulb,
    MessageSquare,
    Target,
    TrendingUp,
    XCircle
} from "lucide-react";
import { useEffect } from "react";
import { Progress } from "../ui/progress";

type Props = {
    threadId?: string;
}

// Helper function to get category styling
const getCategoryConfig = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'potential':
            return {
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                iconColor: 'text-green-600',
                textColor: 'text-green-800',
                icon: TrendingUp,
                label: 'High Potential Lead',
                confidence: { high: 90, medium: 75, low: 60 }
            };
        case 'query':
            return {
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                iconColor: 'text-yellow-600',
                textColor: 'text-yellow-800',
                icon: MessageSquare,
                label: 'Information Seeker',
                confidence: { high: 70, medium: 55, low: 40 }
            };
        case 'dead':
            return {
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                iconColor: 'text-red-600',
                textColor: 'text-red-800',
                icon: XCircle,
                label: 'Low Priority Lead',
                confidence: { high: 40, medium: 25, low: 15 }
            };
        default:
            return {
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                iconColor: 'text-gray-600',
                textColor: 'text-gray-800',
                icon: AlertTriangle,
                label: 'Processing...',
                confidence: { high: 50, medium: 35, low: 20 }
            };
    }
};

// Helper function to get urgency styling
const getUrgencyConfig = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
        case 'high':
            return { color: 'text-red-600', bg: 'bg-red-100', label: 'HIGH URGENCY' };
        case 'medium':
            return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'MEDIUM URGENCY' };
        case 'low':
            return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'LOW URGENCY' };
        default:
            return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'UNKNOWN' };
    }
};

export const EmailAnalysis = ({ threadId }: Props) => {
    const {
        startAnalysis,
        isAnalyzing,
        progress,
        currentStep,
        results,
        setResults,
        error
    } = useStreamingAnalysis();

    const { data: existingAnalysis, isLoading: isLoadingAnalysis } = api.analysis.getThreadAnalysis.useQuery(
        { threadId: threadId ?? "" },
        { enabled: !!threadId }
    );
    const handleAnalyzeClick = async () => {
        if (!threadId) return;
        await startAnalysis(threadId);
    };
    useEffect(() => {
        setResults(null);
    }, [threadId, setResults]);
    useEffect(() => {
        if (existingAnalysis && !results) {
            setResults(existingAnalysis);
        }
    }, [existingAnalysis, results, setResults]);

    // Loading state
    if (isAnalyzing) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
                        <p className="text-sm text-gray-600">Analyzing your email thread...</p>
                    </div>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                                <p className="text-sm text-gray-600 text-center animate-pulse">{currentStep}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-red-800">
                                <XCircle className="h-5 w-5 mr-2" />
                                Analysis Failed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-600 text-center mb-4">{error}</p>
                            <button
                                onClick={handleAnalyzeClick}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Retry Analysis
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Results state
    if (results) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis Complete</h3>
                        <p className="text-sm text-gray-600">
                            Analyzed {results.totalEmails} email{results.totalEmails > 1 ? 's' : ''} • {new Date(results.analyzedAt).toLocaleString()}
                        </p>
                    </div>

                    {results.analyses.map((analysis: any, index: number) => {
                        const categoryConfig = getCategoryConfig(analysis.analysis?.overallCategory);
                        const urgencyConfig = getUrgencyConfig(analysis.analysis?.urgencyLevel);
                        const CategoryIcon = categoryConfig.icon;
                        const confidenceScore = categoryConfig.confidence[analysis.analysis?.urgencyLevel as keyof typeof categoryConfig.confidence] || 50;

                        return (
                            <Card key={analysis.emailId} className={cn("border-2", categoryConfig.borderColor, categoryConfig.bgColor)}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center text-sm">
                                            <CategoryIcon className={cn("h-4 w-4 mr-2", categoryConfig.iconColor)} />
                                            Email {index + 1}: {categoryConfig.label}
                                        </div>
                                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", urgencyConfig.bg, urgencyConfig.color)}>
                                            {urgencyConfig.label}
                                        </span>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {analysis.analysis ? (
                                        <>
                                            {/* Confidence Score */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                                                    <span className="text-sm font-bold text-gray-900">{confidenceScore}%</span>
                                                </div>
                                                <Progress value={confidenceScore} className="h-2" />
                                            </div>

                                            {/* Potential Criteria Met */}
                                            {analysis.analysis.potentialCriteriaMet?.length > 0 && (
                                                <Card className="bg-green-25 border-green-100">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="flex items-center text-sm text-green-800">
                                                            <TrendingUp className="h-3 w-3 mr-1" />
                                                            Potential Lead Indicators ({analysis.analysis.potentialCriteriaMet.length})
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="space-y-2">
                                                            {analysis.analysis.potentialCriteriaMet.slice(0, 3).map((item: any, i: number) => (
                                                                <div key={i} className="text-xs">
                                                                    <div className="flex items-start">
                                                                        <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-medium text-green-800">{item.criteria}</p>
                                                                            <p className="text-green-600 italic">"{item.quote}"</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {analysis.analysis.potentialCriteriaMet.length > 3 && (
                                                                <p className="text-xs text-green-600">
                                                                    +{analysis.analysis.potentialCriteriaMet.length - 3} more indicators
                                                                </p>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Query Criteria Met */}
                                            {analysis.analysis.queryCriteriaMet?.length > 0 && (
                                                <Card className="bg-yellow-25 border-yellow-100">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="flex items-center text-sm text-yellow-800">
                                                            <MessageSquare className="h-3 w-3 mr-1" />
                                                            Query Indicators ({analysis.analysis.queryCriteriaMet.length})
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="space-y-2">
                                                            {analysis.analysis.queryCriteriaMet.slice(0, 2).map((item: any, i: number) => (
                                                                <div key={i} className="text-xs">
                                                                    <div className="flex items-start">
                                                                        <MessageSquare className="h-3 w-3 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-medium text-yellow-800">{item.criteria}</p>
                                                                            <p className="text-yellow-600 italic">"{item.quote}"</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Dead Lead Criteria */}
                                            {analysis.analysis.deadCriteriaMet?.length > 0 && (
                                                <Card className="bg-red-25 border-red-100">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="flex items-center text-sm text-red-800">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Negative Indicators ({analysis.analysis.deadCriteriaMet.length})
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <div className="space-y-2">
                                                            {analysis.analysis.deadCriteriaMet.slice(0, 2).map((item: any, i: number) => (
                                                                <div key={i} className="text-xs">
                                                                    <div className="flex items-start">
                                                                        <XCircle className="h-3 w-3 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                                                                        <div>
                                                                            <p className="font-medium text-red-800">{item.criteria}</p>
                                                                            <p className="text-red-600 italic">"{item.quote}"</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Key Recommendations */}
                                            {analysis.analysis.keyRecommendations?.length > 0 && (
                                                <Card className="bg-blue-25 border-blue-100">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="flex items-center text-sm text-blue-800">
                                                            <Lightbulb className="h-3 w-3 mr-1" />
                                                            Key Recommendations
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <ul className="space-y-1">
                                                            {analysis.analysis.keyRecommendations.slice(0, 4).map((rec: string, i: number) => (
                                                                <li key={i} className="flex items-start text-xs">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2 mt-1.5 flex-shrink-0" />
                                                                    <span className="text-blue-800">{rec}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Next Steps */}
                                            {analysis.analysis.nextSteps?.length > 0 && (
                                                <Card className="bg-purple-25 border-purple-100">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="flex items-center text-sm text-purple-800">
                                                            <Target className="h-3 w-3 mr-1" />
                                                            Immediate Next Steps
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="pt-0">
                                                        <ol className="space-y-1">
                                                            {analysis.analysis.nextSteps.slice(0, 3).map((step: string, i: number) => (
                                                                <li key={i} className="flex items-start text-xs">
                                                                    <span className="bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center mr-2 flex-shrink-0 text-xs font-bold">
                                                                        {i + 1}
                                                                    </span>
                                                                    <span className="text-purple-800">{step}</span>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No analysis data available</p>
                                        </div>
                                    )}

                                    {analysis.error && (
                                        <Card className="bg-red-50 border-red-200">
                                            <CardContent className="pt-4">
                                                <p className="text-red-600 text-sm flex items-center">
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Error: {analysis.error}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Retry Analysis Button */}
                    <Card className="border-gray-200">
                        <CardContent className="pt-4">
                            <button
                                onClick={handleAnalyzeClick}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                            >
                                Re-analyze Thread
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Default state - show analyze button
    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Email Analysis</h3>
                    <p className="text-sm text-gray-600">Get instant insights about lead potential and sales opportunities</p>
                </div>

                <Card className="border-gray-200">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                                    <span>Potential Leads</span>
                                </div>
                                <div className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1 text-yellow-500" />
                                    <span>Queries</span>
                                </div>
                                <div className="flex items-center">
                                    <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                    <span>Low Priority</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyzeClick}
                                disabled={!threadId}
                                className="w-full px-4 py-2 bg-gradient-to-r from-pink-200 to-purple-500 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {threadId ? 'Start AI Analysis' : 'Select Thread to Analyze'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};