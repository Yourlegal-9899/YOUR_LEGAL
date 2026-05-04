'use client';

import React, { FormEvent, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-base';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface HubspotFormProps {
  portalId: string;
  formId: string;
}

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  jurisdiction: string;
  serviceRequired: string;
  requirement: string;
};

const DEFAULT_FORM: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  jurisdiction: '',
  serviceRequired: '',
  requirement: '',
};

const JURISDICTIONS = [
  'USA',
  'Dubai',
  'Singapore',
  'UK',
  'Australia',
  'Saudi Arabia',
  'India',
  'Netherlands',
  'Other',
];

const SERVICES = [
  'Company Formation',
  'Annual Compliance',
  'Tax Compliance',
  'Bookkeeping',
  'Accounting',
  'Virtual CFO',
  'Payroll',
  'Cross Border Accounting',
  'Other',
];

export const HubspotForm: React.FC<HubspotFormProps> = ({ portalId, formId }) => {
  const [form, setForm] = useState<ContactFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const setField = (key: keyof ContactFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!form.name.trim() || !form.email.trim()) {
      setStatus('error');
      setStatusMessage('Please enter your name and email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus('idle');
      setStatusMessage('');

      const response = await fetch(`${API_BASE_URL}/zoho/public-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || 'Unable to submit your details right now.');
      }

      setStatus('success');
      setStatusMessage(data?.message || 'Thanks! Our team will contact you shortly.');
      setForm(DEFAULT_FORM);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unable to submit your details right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id={`hbspt-form-container-${portalId}-${formId}`} className="w-full">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(2,6,23,0.08)]">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name*</Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email*</Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
                placeholder="+1 555 123 4567"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label>Jurisdiction</Label>
              <Select value={form.jurisdiction} onValueChange={(value) => setField('jurisdiction', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {JURISDICTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Service Required</Label>
            <Select value={form.serviceRequired} onValueChange={(value) => setField('serviceRequired', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-requirement">Tell us about your requirement</Label>
            <Textarea
              id="contact-requirement"
              value={form.requirement}
              onChange={(event) => setField('requirement', event.target.value)}
              placeholder="Tell us about your goals, timeline, and what support you need."
              className="min-h-28 resize-y"
            />
          </div>

          <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>

          {status === 'success' ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {statusMessage}
            </div>
          ) : null}

          {status === 'error' ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {statusMessage}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

