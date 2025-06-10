import {
    analysisStateAtom,
    setAnalyzingAtom,
    setErrorAtom,
    setResultsAtom,
    updateProgressAtom
} from '@/store/useAnalysisStore';
import { api } from '@/trpc/react';
import { useAtom } from 'jotai';
import { useCallback } from 'react';

export const useStreamingAnalysis = () => {
    const [analysisState] = useAtom(analysisStateAtom);
    const [, setAnalyzing] = useAtom(setAnalyzingAtom);
    const [, updateProgress] = useAtom(updateProgressAtom);
    const [, setResults] = useAtom(setResultsAtom);
    const [, setError] = useAtom(setErrorAtom);

    const analyzeMutation = api.analysis.analyzeThread.useMutation();

    const startAnalysis = useCallback(async (threadId: string) => {
        try {
            setAnalyzing({ threadId, isAnalyzing: true });
            console.log(`Starting analysis for thread ID: ${threadId}`);

            updateProgress({ progress: 5, step: 'Initializing analysis...' });
            await new Promise(resolve => setTimeout(resolve, 200));

            updateProgress({ progress: 10, step: 'Fetching thread data...' });

            // Start the actual analysis
            const result = await analyzeMutation.mutateAsync({ threadId });

            // Simulate progressive updates for better UX
            const emailCount = result.totalEmails;

            for (let i = 0; i < emailCount; i++) {
                const baseProgress = 20;
                const emailProgress = (i / emailCount) * 70; // 70% of progress for email processing

                updateProgress({
                    progress: baseProgress + emailProgress,
                    step: `Analyzing email ${i + 1} of ${emailCount}...`
                });

                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 800));

                // Show intermediate results as they come in
                if (result.analyses[i]) {
                    updateProgress({
                        progress: baseProgress + emailProgress + (70 / emailCount * 0.8),
                        step: `Completed analysis of email ${i + 1}`
                    });
                }
            }

            updateProgress({ progress: 95, step: 'Finalizing results...' });
            await new Promise(resolve => setTimeout(resolve, 300));

            updateProgress({ progress: 100, step: 'Analysis complete!' });
            setResults(result);

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Analysis failed');
        }
    }, [analyzeMutation, setAnalyzing, updateProgress, setResults, setError]);

    return {
        startAnalysis,
        isAnalyzing: analysisState.isAnalyzing,
        progress: analysisState.progress,
        currentStep: analysisState.currentStep,
        results: analysisState.results,
        error: analysisState.error,
    };
};

