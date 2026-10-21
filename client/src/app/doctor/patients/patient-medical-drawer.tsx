'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ar } from '@/i18n/messages/ar';
import { formatDate } from '@/lib/utils';
import { AlertCircle, HeartPulse, Pill, FileText, Calendar, Phone, Activity, User } from 'lucide-react';
import type { PatientSummary } from '@/features/patients/queries';

interface PatientMedicalDrawerProps {
  summary: PatientSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientMedicalDrawer({ summary, open, onOpenChange }: PatientMedicalDrawerProps) {
  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
              {summary.fullName.slice(0, 2)}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{summary.fullName}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {summary.gender === 'MALE' ? ar.patients.male : ar.patients.female}
                {summary.age !== null && ` • ${summary.age} ${ar.patients.years}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* CRITICAL: Allergies Alert */}
          {summary.allergies && summary.allergies.length > 0 ? (
            <div className="rounded-lg border-2 border-red-200 bg-red-50/80 p-3.5 text-red-950">
              <div className="flex items-center gap-2 mb-1.5 font-bold text-red-700 text-sm">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{ar.patients.allergies} (تحذير طبي)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.allergies.map((allergy, i) => (
                  <Badge key={i} variant="destructive" className="bg-red-600 text-white font-medium text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="size-3.5 text-muted-foreground" />
                {ar.patients.allergies}
              </span>
              <span>{ar.patients.none}</span>
            </div>
          )}

          {/* Chronic Conditions */}
          {summary.chronicConditions && summary.chronicConditions.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-amber-950">
              <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-800 text-sm">
                <HeartPulse className="size-4 shrink-0 text-amber-600" />
                <span>{ar.patients.chronicConditions}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.chronicConditions.map((condition, i) => (
                  <Badge key={i} variant="outline" className="border-amber-300 text-amber-900 bg-amber-100/60 font-medium text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <HeartPulse className="size-3.5 text-muted-foreground" />
                {ar.patients.chronicConditions}
              </span>
              <span>{ar.patients.none}</span>
            </div>
          )}

          {/* Clinical Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-none border bg-card">
              <CardContent className="p-3.5">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Activity className="size-3.5 text-primary" />
                  {ar.patients.visitCount}
                </p>
                <p className="text-2xl font-bold mt-1 text-foreground">
                  {summary.visitCount}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none border bg-card">
              <CardContent className="p-3.5">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3.5 text-primary" />
                  {ar.patients.lastVisit}
                </p>
                <p className="text-sm font-bold mt-1.5 text-foreground truncate">
                  {summary.lastVisitDate ? formatDate(summary.lastVisitDate) : ar.common.empty}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Last Diagnosis */}
          {summary.lastDiagnosis && (
            <Card className="shadow-none border">
              <CardHeader className="py-2.5 px-3.5 bg-muted/20 border-b">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" />
                  {ar.patients.lastDiagnosis}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3.5 text-sm text-foreground leading-relaxed">
                {summary.lastDiagnosis}
              </CardContent>
            </Card>
          )}

          {/* Last Prescription */}
          {summary.lastPrescriptionItems && summary.lastPrescriptionItems.length > 0 && (
            <Card className="shadow-none border">
              <CardHeader className="py-2.5 px-3.5 bg-muted/20 border-b">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Pill className="size-3.5 text-emerald-600" />
                  {ar.patients.lastPrescription}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 divide-y">
                {summary.lastPrescriptionItems.map((item, i) => (
                  <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.drugName}</span>
                    <span className="text-muted-foreground font-mono">
                      {item.dose} • {item.frequency} • {item.duration}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {ar.common.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
