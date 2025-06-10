import { atom } from 'jotai';

export interface AnalysisState {
    isAnalyzing: boolean;
    threadId: string | null;
    progress: number;
    currentStep: string;
    results: any | null;
    error: string | null;
}

export const analysisStateAtom = atom<AnalysisState>({
    isAnalyzing: false,
    threadId: null,
    progress: 0,
    currentStep: '',
    results: null,
    error: null,
});


export const setAnalyzingAtom = atom(
    null,
    (get, set, { threadId, isAnalyzing }: { threadId: string; isAnalyzing: boolean }) => {
        set(analysisStateAtom, {
            ...get(analysisStateAtom),
            isAnalyzing,
            threadId,
            progress: isAnalyzing ? 0 : 100,
            currentStep: isAnalyzing ? 'Initializing analysis...' : '',
            error: null,
        });
    }
);

export const updateProgressAtom = atom(
    null,
    (get, set, { progress, step }: { progress: number; step: string }) => {
        set(analysisStateAtom, {
            ...get(analysisStateAtom),
            progress,
            currentStep: step,
        });
    }
);

export const setResultsAtom = atom(
    null,
    (get, set, results: any) => {
        set(analysisStateAtom, {
            ...get(analysisStateAtom),
            results,
            isAnalyzing: false,
            progress: 100,
            currentStep: 'Analysis complete',
        });
    }
);
export const setErrorAtom = atom(
    null,
    (get, set, error: string) => {
        set(analysisStateAtom, {
            ...get(analysisStateAtom),
            error,
            isAnalyzing: false,
            progress: 0,
            currentStep: 'Analysis failed',
        });
    }
);