import { validateAdditionalInfo, validateBasicInfo, validateCTA, type ValidationErrors } from '@/lib/types';
import { CtaTypeEnum } from '@prisma/client';
import { create } from 'zustand';

export type WebinarFormState = {
    basicInfo: {
        webinarName?: string;
        description?: string;
        date?: Date
        time?: string
        timeFormat?: 'AM' | 'PM';
    }
    cta: {
        ctaLabel?: string;
        tags?: string[];
        ctaType: CtaTypeEnum
        aiAgent?: string
        priceId?: string
    }
    additionalInfo: {
        lockChat?: boolean
        couponCode?: string
        couponEnabled?: boolean
    }
}

type ValidationState = {
    basicInfo: {
        valid: boolean
        errors: ValidationErrors
    },
    cta: {
        valid: boolean
        errors: ValidationErrors
    }
    additionalInfo: {
        valid: boolean
        errors: ValidationErrors
    }
}


type WebinarStore = {
    isModalOpen: boolean;
    isComplete: boolean;
    isSubmitting: boolean;
    formData: WebinarFormState
    validation: ValidationState

    setModalOpen: (open: boolean) => void;
    setIsComplete: (complete: boolean) => void;
    setIsSubmitting: (submitting: boolean) => void;
    addTag: (tag: string) => void,
    removeTag: (tag: string) => void,
    updateBasicInfoField: <K extends keyof WebinarFormState['basicInfo']>(
        field: K,
        value: WebinarFormState['basicInfo'][K]
    ) => void,
    updateCTAField: <K extends keyof WebinarFormState['cta']>(
        field: K,
        value: WebinarFormState['cta'][K]
    ) => void,
    updateAdditionalInfoField: <K extends keyof WebinarFormState['additionalInfo']>(
        field: K,
        value: WebinarFormState['additionalInfo'][K]
    ) => void,
    validateStep: (stepId: keyof WebinarFormState) => boolean,

    getStepValidationErrors: (stepId: keyof WebinarFormState) => ValidationErrors,

    resetForm: () => void
}

const initialState: WebinarFormState = {
    basicInfo: {
        webinarName: "",
        description: "",
        date: undefined,
        time: "",
        timeFormat: "AM",
    },
    cta: {
        ctaLabel: "",
        tags: [],
        ctaType: "BOOK_A_CALL",
        aiAgent: "",
        priceId: ""
    },
    additionalInfo: {
        lockChat: false,
        couponCode: "",
        couponEnabled: false,
    }
}

const initialValidation: ValidationState = {
    basicInfo: { valid: false, errors: {} },
    cta: { valid: false, errors: {} },
    additionalInfo: { valid: true, errors: {} }
}


export const useWebinarStore = create<WebinarStore>((set, get) => ({
    isModalOpen: false,
    isComplete: false,
    isSubmitting: false,
    formData: initialState,
    validation: initialValidation,

    setModalOpen: (open: boolean) => set({ isModalOpen: open }),
    setIsComplete: (complete: boolean) => set({ isComplete: complete }),
    setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
    updateBasicInfoField: (field, value) => {
        set((state) => {
            const newBasicInfo = { ...state.formData.basicInfo, [field]: value }
            const validationResult = validateBasicInfo(newBasicInfo)

            return {
                formData: { ...state.formData, basicInfo: newBasicInfo },
                validation: { ...state.validation, basicInfo: validationResult }
            }
        })
    },
    updateCTAField: (field, value) => {
        set((state) => {
            const newCta = { ...state.formData.cta, [field]: value };
            const validationResult = validateCTA(newCta)

            return {
                formData: { ...state.formData, cta: newCta },
                validation: { ...state.validation, cta: validationResult }
            };
        });
    },
    updateAdditionalInfoField: (field, value) => {
        set((state) => {
            const newAdditionalInfo = { ...state.formData.additionalInfo, [field]: value };
            // const validationResult = validateAdditionalInfo(newAdditionalInfo)
            return {
                formData: { ...state.formData, additionalInfo: newAdditionalInfo },
                validation: { ...state.validation, additionalInfo: { valid: true, errors: {} } }
            };
        });
    },
    validateStep: (stepId: keyof WebinarFormState) => {
        const { formData } = get()
        let validationResult;

        switch (stepId) {
            case 'basicInfo':
                validationResult = validateBasicInfo(formData.basicInfo)
                break
            case 'cta':
                validationResult = validateCTA(formData.cta)
                break
            case 'additionalInfo':
                validationResult = validateAdditionalInfo(formData.additionalInfo)
                break
        }
        set((state) => {
            return {
                validation: {
                    ...state.validation, [stepId]:
                        validationResult
                }
            }
        })
        return validationResult.valid
    },
    getStepValidationErrors: (stepId: keyof WebinarFormState) => {
        return get().validation[stepId].errors
    },
    resetForm: () =>
        set({
            isComplete: false,
            isSubmitting: false,
            formData: initialState,
            validation: initialValidation,
        }),
    addTag: (tag: string) =>
        set((state) => {
            const newTags = [...(state.formData.cta.tags || []), tag]
            const newCTA = {
                ...state.formData.cta,
                tags: newTags
            }
            return {
                formData: {
                    ...state.formData,
                    cta: newCTA
                }
            }
        }),
    removeTag: (tag: string) =>
        set((state) => {
            const newTags = (state.formData.cta.tags || []).filter(t => t !== tag);
            const newCTA = {
                ...state.formData.cta,
                tags: newTags
            }
            return {
                formData: {
                    ...state.formData,
                    cta: newCTA
                }
            }
        })

}))