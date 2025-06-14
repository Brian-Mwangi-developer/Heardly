import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useWebinarStore } from '@/store/useWebinarStore';
import { api } from '@/trpc/react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

type Step = {
    id: string;
    title: string;
    description: string;
    component: React.ReactNode;
}

type Props = {
    steps: Step[]
    onComplete: (id: string) => void
}

export const MultiStepForm = ({ steps, onComplete }: Props) => {
    const { formData, validateStep, isSubmitting, setIsSubmitting, setModalOpen } = useWebinarStore()
    const [completedSteps, setCompletedSteps] = useState<string[]>([])
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [validationErrors, setValidationErrors] = useState<string | null>(null);
    const router = useRouter();
    const createWebinar = api.webinar.createWebinar.useMutation();


    const handleBack = () => {
        if (isFirstStep) {
            setModalOpen(false)
        } else {
            setCurrentStepIndex(currentStepIndex - 1)
            setValidationErrors(null)
        }
    }
    const handleNext = async () => {
        setValidationErrors(null)
        const isValid = validateStep(currentStep.id as keyof typeof formData)
        if (!isValid) {
            setValidationErrors('Please fill in all the required fields')
            return
        }
        if (!completedSteps.includes(currentStep.id)) {
            setCompletedSteps([...completedSteps, currentStep.id])
        }
        if (isLastStep) {
            try {
                setIsSubmitting(true)
                const result = await createWebinar.mutateAsync(formData)
                if (result.status === 200 && result.webinarId) {
                    toast.success('Your webinar has been created successfully!')
                    onComplete(result.webinarId)
                } else {
                    toast.error(result.message || 'Failed to create webinar')
                }
                setValidationErrors(result.message)
                setModalOpen(false)
                router.refresh()
            } catch (error) {
                console.error('Error creating webinar:', error);
                toast.error('An error occurred while creating the webinar. Please try again.');
                setValidationErrors('Failed to create webinar. Please try again later.');
            } finally {
                setIsSubmitting(false)
            }
        } else {
            setCurrentStepIndex(currentStepIndex + 1)
        }

    }
    if (!steps.length || !steps[currentStepIndex]) {
        return <div>No steps available.</div>;
    }
    const currentStep = steps[currentStepIndex]
    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === steps.length - 1
    return (
        <div
            className='flex flex-col justify-center items-center border border-border rounded-3xl
        overflow-hidden max-w-6xl mx-auto backdrop-blur-[106px]'>
            <div className='flex items-center justify-start'>
                <div className='w-full md:w-1/3 p-6 mx-2'>
                    <div className='space-y-6'>
                        {steps.map((step, index) => {
                            const isCompleted = completedSteps.includes(step.id)
                            const isCurrent = index === currentStepIndex
                            const isPast = index < currentStepIndex

                            return (
                                <div key={step.id} className='relative'>
                                    <div className='flex items-start gap-4'>
                                        <div className='relative'>
                                            <motion.div initial={false}
                                                animate={{
                                                    backgroundColor:
                                                        isCurrent || isCompleted
                                                            ? 'rgb(147,51,234)'
                                                            : 'rgb(31,41,55)',
                                                    scale: [isCurrent && isCompleted ? 0.8 : 1, 1],
                                                    transition: { duration: 0.3 },
                                                }}
                                                className="flex items-center justify-center w-8 h-8 rounded-full z-10"
                                            >
                                                <AnimatePresence mode='wait'>
                                                    {isCompleted ? (
                                                        <motion.div
                                                            key="check"
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Check className='w-5 h-5 text-white' />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="number"
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.5 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="text-white"
                                                        >
                                                            <Check className='w-5 h-5 text-white/50' />

                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                            {index < steps.length - 1 && (
                                                <div className='absolute top-8 left-4 w-0.5 h-16 bg-gray-700 overflow-hidden'>
                                                    <motion.div
                                                        initial={{ height: isPast || isCompleted ? '100%' : '0%' }}
                                                        animate={{
                                                            height: isPast || isCompleted ? '100%' : '0%',
                                                            backgroundColor: 'rgb(147,51,234)'
                                                        }}
                                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                                        className='w-full h-full'
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className='pt-1'>
                                            <motion.h3
                                                animate={{
                                                    color: isCurrent || isCompleted ? 'rgb(147,51,234)' : 'rgb(156,163,175)',
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className='font-medium'>
                                                {step.title}
                                            </motion.h3>
                                            <p className='text-sm text-gray-500'>{step.description} </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <Separator orientation='vertical' className='data-[orientation=vertical]:h-1/2 ' />
                <div className='w-full md:w-2/3'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStep.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='p-6'
                        >
                            <div className='mb-6'>
                                <h2 className='text-xl font-semibold'>{currentStep.title}</h2>
                                <p className='text-gray-400'>{currentStep.description}</p>
                            </div>
                            {currentStep.component}
                            {/* Validation Error */}
                            {
                                validationErrors && (
                                    <div className='mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md
                                     flex items-start gap-2 text-red-300'>
                                        <AlertCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                                        <p>{validationErrors}</p>
                                    </div>
                                )
                            }
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <div className='w-full p-6 flex justify-between'>
                <Button
                    variant='outline'
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className={cn('border-gray-700 text-gray-700 hover:bg-gray-800 hover:text-white',
                        isFirstStep && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {isFirstStep ? 'Cancel' : 'Back'}
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                >
                    {isLastStep ? (
                        isSubmitting ? (
                            <>
                                <Loader2 className='animate-spin' />
                                Creating ...
                            </>
                        ) : (
                            'Complete'
                        )
                    ) : (
                        'Next'
                    )}
                    {!isLastStep && <ChevronRight className='ml-1 h-4 w-4' />}
                </Button>
            </div>
        </div>
    )
}