"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStreamingAnalysis } from "@/hooks/use-streaming-analysis";
import { api } from "@/trpc/react";
import { TrendingUp } from "lucide-react";
import { Progress } from "../ui/progress";

type Props = {
    threadId?: string;
}

export const EmailAnalysis = ({ threadId }: Props) => {
    const {
        startAnalysis,
        isAnalyzing,
        progress,
        currentStep,
        results,
        error
    } = useStreamingAnalysis();

    const handleAnalyzeClick = async () => {
        if (!threadId) return;
        await startAnalysis(threadId);
    };


    const VconById = api.vcon.getVconsByThreadId.useQuery({ threadId: threadId ?? "" });
    const ThreadData = api.account.getThreadById.useQuery({ threadId: threadId ?? "" });
    if (VconById.data) { console.log("VconById", VconById.data) }
    const analysis = [1, 2, 3, 4]

    if (isAnalyzing) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
                        <p className="text-sm text-gray-600">Analyzing your email thread...</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                                <p className="text-sm text-gray-600 text-center">{currentStep}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <p className="text-red-600 text-center">{error}</p>
                            <button
                                onClick={handleAnalyzeClick}
                                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Retry Analysis
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show results when available
    if (results) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis Complete</h3>
                        <p className="text-sm text-gray-600">
                            Analyzed {results.totalEmails} emails • {new Date(results.analyzedAt).toLocaleString()}
                        </p>
                    </div>

                    {results.analyses.map((analysis: any, index: number) => (
                        <Card key={analysis.emailId} className="border-2 border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-sm">
                                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                    Email {index + 1} Analysis - {analysis.analysis?.overallCategory?.toUpperCase() || 'PROCESSING'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analysis.analysis && (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Confidence</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {analysis.analysis.urgencyLevel === 'high' ? '85%' :
                                                        analysis.analysis.urgencyLevel === 'medium' ? '65%' : '35%'}
                                                </span>
                                            </div>
                                            <Progress
                                                value={analysis.analysis.urgencyLevel === 'high' ? 85 :
                                                    analysis.analysis.urgencyLevel === 'medium' ? 65 : 35}
                                                className="h-2"
                                            />
                                        </div>

                                        {analysis.analysis.keyRecommendations?.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                <p className="font-medium mb-1">Key Recommendations:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {analysis.analysis.keyRecommendations.slice(0, 3).map((rec: string, i: number) => (
                                                        <li key={i}>{rec}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {analysis.error && (
                                    <p className="text-red-600 text-sm">Error: {analysis.error}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Default state - show analyze button
    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
                    <p className="text-sm text-gray-600">Ready to analyze your email thread</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <button
                            onClick={handleAnalyzeClick}
                            disabled={!threadId}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                        >
                            Start Analysis
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

