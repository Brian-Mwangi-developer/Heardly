import type { Attendee, User, Webinar } from '@prisma/client';
import { z } from "zod";
export interface SyncResponse {
  syncUpdatedToken: string;
  syncDeletedToken: string;
  ready: boolean;
}
export interface SyncUpdatedResponse {
  nextPageToken?: string;
  nextDeltaToken: string;
  records: EmailMessage[];
}

export const emailAddressSchema = z.object({
  name: z.string(),
  address: z.string(),
})

export interface EmailMessage {
  id: string;
  threadId: string;
  createdTime: string;
  lastModifiedTime: string;
  sentAt: string;
  receivedAt: string;
  internetMessageId: string;
  subject: string;
  sysLabels: Array<"junk" | "trash" | "sent" | "inbox" | "unread" | "flagged" | "important" | "draft">;
  keywords: string[];
  sysClassifications: Array<"personal" | "social" | "promotions" | "updates" | "forums">;
  sensitivity: "normal" | "private" | "personal" | "confidential";
  meetingMessageMethod?: "request" | "reply" | "cancel" | "counter" | "other";
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo: EmailAddress[];
  hasAttachments: boolean;
  body?: string;
  bodySnippet?: string;
  attachments: EmailAttachment[];
  inReplyTo?: string;
  references?: string;
  threadIndex?: string;
  internetHeaders: EmailHeader[];
  nativeProperties: Record<string, string>;
  folderId?: string;
  omitted: Array<"threadId" | "body" | "attachments" | "recipients" | "internetHeaders">;
}



export interface EmailAddress {
  name?: string;
  address: string;
  raw?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  inline: boolean;
  contentId?: string;
  content?: string;
  contentLocation?: string;
}

export interface EmailHeader {
  name: string;
  value: string;
}



export type ValidationErrors = Record<string, string>

export type ValidationResult = {
  valid: boolean
  errors: ValidationErrors
}

export const validateBasicInfo = (data: {
  webinarName?: string
  description?: string
  date?: Date
  time?: string
  timeFormat?: 'AM' | 'PM'
}): ValidationResult => {
  const errors: ValidationErrors = {}

  if (!data.webinarName?.trim()) {
    errors.webinarName = 'Webinar name is required'
  }

  if (!data.description?.trim()) {
    errors.description = 'Description is required'
  }

  if (!data.date) {
    errors.date = 'Date is required'
  }

  if (!data.time?.trim()) {
    errors.time = 'Time is required'
  } else {
    // Validate time format (HH:MM)
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/
    if (!timeRegex.test(data.time)) {
      errors.time = 'Time must be in format HH:MM (e.g., 10:30)'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateCTA = (data: {
  ctaLabel?: string
  tags?: string[]
  ctaType: string
  aiAgent?: string
}): ValidationResult => {
  const errors: ValidationErrors = {}

  if (!data.ctaLabel?.trim()) {
    errors.ctaLabel = 'CTA label is required'
  }

  if (!data.ctaType) {
    errors.ctaType = 'Please select a CTA type'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateAdditionalInfo = (data: {
  lockChat?: boolean
  couponCode?: string
  couponEnabled?: boolean
}): ValidationResult => {
  const errors: ValidationErrors = {}

  // If coupon is enabled, code is required
  if (data.couponEnabled && !data.couponCode?.trim()) {
    errors.couponCode = 'Coupon code is required when enabled'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export type AttendanceData = {
  count: number
  users: Attendee[]
}

export type WebinarWithPresenter = Webinar & {
  presenter: User
}

export type StreamCallRecording = {
  filename: string
  url: string
  start_time: Date
  end_time: Date
  session_id: string
}

export enum CallStatusTypes {
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}