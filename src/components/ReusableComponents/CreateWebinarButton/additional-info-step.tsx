"use client"
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useWebinarStore } from '@/store/useWebinarStore'
import { Info } from 'lucide-react'



export const AdditionalInfoStep = () => {
    const { formData, updateAdditionalInfoField, getStepValidationErrors } = useWebinarStore()
    const errors = getStepValidationErrors('additionalInfo');
    const { lockChat, couponCode, couponEnabled } = formData.additionalInfo;
    const handleToggleLockChat = (checked: boolean) => {
        updateAdditionalInfoField('lockChat', checked);
    }
    const handleToggleCoupon = (checked: boolean) => {
        updateAdditionalInfoField('couponEnabled', checked);
    }
    return (
        <div className='space-y-8'>
            <div className='flex items-center justify-between'>
                <div>
                    <Label htmlFor='lock-chat' className='text-base font-medium'>
                        Lock Chat
                    </Label>
                    <p className='text-sm text-gray-400'>Turn it on to make chat visible to your users at all time</p>
                </div>
                <Switch id="lock-chat" checked={lockChat || false} onCheckedChange={handleToggleLockChat} />
            </div>
            <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <div>
                        <Label htmlFor='coupon-enabled' className='text-base font-medium'>
                            Coupon Code
                        </Label>
                        <p className='text-sm text-gray-400'>
                            Turn it on to offer discounts to your viewers
                        </p>
                    </div>
                    <Switch
                        id="coupon-enabled"
                        checked={couponEnabled || false}
                        onCheckedChange={handleToggleCoupon} />
                </div>
                {couponEnabled && (
                    <div className='space-y-2'>
                        <input
                            id="coupon-code"
                            name="couponCode"
                            value={couponCode || ''}
                            onChange={(e) => updateAdditionalInfoField('couponCode', e.target.value)}
                            placeholder='Enter coupon code'
                            className={`!bg-background/50 border border-input px-2 rounded-md py-2 w-full
                                ${errors.couponCode ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        />
                        {errors.couponCode && (
                            <p className='text-sm text-red-400'>{errors.couponCode}</p>
                        )}
                        <div className='flex items-start gap-2 text-sm text-gray-400 mt-2'>
                            <Info className='h-4 w-4 mt-0.5' />
                            <p>
                                This coupon code can be used to promotes a sale. Users can use it for the buy now CTA
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}