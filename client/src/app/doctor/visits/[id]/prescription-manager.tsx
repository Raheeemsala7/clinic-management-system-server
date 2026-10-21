'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPrescriptionAction, markPrescriptionPrintedAction, searchDrugsAction, type PrescriptionItemInput } from '@/features/prescriptions/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ar } from '@/i18n/messages/ar';
import { formatDate, formatTime } from '@/lib/utils';
import { Pill, Plus, Trash2, Printer, Check, CheckCheck, Loader2, Sparkles, FileText } from 'lucide-react';

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  sortOrder: number;
}

export interface Prescription {
  id: string;
  versionNumber: number;
  notes: string | null;
  printedAt: string | null;
  createdAt: string;
  items: PrescriptionItem[];
}

interface PrescriptionManagerProps {
  visitId: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string;
  doctorName?: string;
  clinicName?: string;
  initialPrescriptions: Prescription[];
  isClosed?: boolean;
}

const COMMON_FREQUENCIES = [
  'قرص 3 مرات يومياً بعد الأكل',
  'قرص مرتين يومياً (صباحاً ومساءً)',
  'قرص واحد يومياً قبل النوم',
  'قرص واحد يومياً قبل الإفطار',
  'ملعقة 3 مرات يومياً بعد الوجبات',
  'كل 8 ساعات عند اللزوم',
];

const COMMON_DURATIONS = [
  'لمدة 3 أيام',
  'لمدة 5 أيام',
  'لمدة أسبوع',
  'لمدة 10 أيام',
  'لمدة أسبوعين',
  'لمدة شهر',
];

export function PrescriptionManager({
  visitId,
  patientName,
  patientAge,
  patientGender,
  doctorName,
  clinicName = 'عيادة الرعاية الطبية المتكاملة',
  initialPrescriptions,
  isClosed,
}: PrescriptionManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [showAddForm, setShowAddForm] = useState(initialPrescriptions.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Print modal state
  const [printPrescription, setPrintPrescription] = useState<Prescription | null>(null);

  // New Prescription Items
  const [items, setItems] = useState<PrescriptionItemInput[]>([
    { drugName: '', dose: '1 قرص', frequency: '3 مرات يومياً بعد الأكل', duration: 'لمدة 5 أيام', instructions: '' },
  ]);
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { drugName: '', dose: '1 قرص', frequency: '3 مرات يومياً بعد الأكل', duration: 'لمدة 5 أيام', instructions: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItemInput, value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const validItems = items.filter((it) => it.drugName.trim().length > 0);
    if (validItems.length === 0) {
      setError('يرجى كتابة اسم دواء واحد على الأقل');
      return;
    }

    startTransition(async () => {
      const res = await createPrescriptionAction(visitId, {
        notes: notes.trim() || undefined,
        items: validItems.map((item, idx) => ({ ...item, sortOrder: idx })),
      });

      if (res.success) {
        setShowAddForm(false);
        router.refresh();
      } else {
        setError(res.error ?? ar.errors.generic);
      }
    });
  };

  const handlePrint = (p: Prescription) => {
    setPrintPrescription(p);
  };

  const executePrint = () => {
    if (printPrescription) {
      startTransition(async () => {
        await markPrescriptionPrintedAction(printPrescription.id);
      });
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Existing Prescriptions List */}
      {prescriptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Pill className="size-5 text-emerald-600" />
              الروشتات الطبية المسجلة ({prescriptions.length})
            </h3>
            {!showAddForm && !isClosed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              >
                <Plus className="size-3.5" />
                تحرير روشتة إضافية
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <Card key={rx.id} className="border shadow-sm">
                <CardHeader className="py-3 px-4 bg-muted/20 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      روشتة علاجية (إصدار v{rx.versionNumber})
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDate(rx.createdAt)} {formatTime(rx.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rx.printedAt ? (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1">
                        <CheckCheck className="size-3" />
                        تمت الطباعة
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        غير مطبوعة
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => handlePrint(rx)}
                    >
                      <Printer className="size-3.5" />
                      طباعة الروشتة
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="divide-y text-sm">
                    {rx.items.map((item, idx) => (
                      <div key={item.id || idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-primary font-bold text-xs mt-0.5">#{idx + 1}</span>
                          <div>
                            <p className="font-bold text-foreground text-sm">{item.drugName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              الجرعة: <span className="font-medium text-foreground">{item.dose}</span> • {item.frequency} • {item.duration}
                            </p>
                            {item.instructions && (
                              <p className="text-xs text-emerald-700 mt-0.5 italic">
                                ℹ {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {rx.notes && (
                    <div className="mt-3 pt-2.5 border-t text-xs text-muted-foreground bg-muted/30 p-2.5 rounded">
                      <span className="font-semibold text-foreground">ملاحظات الطبيب: </span>
                      {rx.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Prescription Form */}
      {(!isClosed || prescriptions.length === 0) && showAddForm && (
        <Card className="border-2 border-emerald-200/80 shadow-md">
          <CardHeader className="pb-3 border-b bg-emerald-50/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-950">
                  <Pill className="size-5 text-emerald-600" />
                  تحرير الروشتة الطبية (Rx)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  إضافة الأدوية والجرعات ومواعيد الاستخدام والتعليمات
                </CardDescription>
              </div>
              {prescriptions.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => setShowAddForm(false)}
                >
                  إلغاء
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSavePrescription} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-lg border bg-card/60 space-y-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                        <Pill className="size-3.5" />
                        الدواء #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="size-3.5 me-1" />
                          حذف الدواء
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">اسم الدواء / المادة الفعالة *</Label>
                        <Input
                          placeholder="مثال: Augmentin 1g, Panadol Extra..."
                          value={item.drugName}
                          onChange={(e) => handleItemChange(index, 'drugName', e.target.value)}
                          className="h-9 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">الجرعة (Dose)</Label>
                        <Input
                          placeholder="مثال: قرص واحد، 500 ملجم، ملعقة..."
                          value={item.dose}
                          onChange={(e) => handleItemChange(index, 'dose', e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">التكرار (Frequency)</Label>
                        <Input
                          placeholder="مثال: 3 مرات يومياً، كل 12 ساعة..."
                          value={item.frequency}
                          onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                          className="h-9 text-sm"
                        />
                        {/* Quick preset chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {['3 مرات يومياً', 'مرتين يومياً', 'مرة قبل النوم'].map((p) => (
                            <button
                              type="button"
                              key={p}
                              onClick={() => handleItemChange(index, 'frequency', p)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">المدة (Duration)</Label>
                        <Input
                          placeholder="مثال: لمدة 5 أيام، لمدة أسبوع..."
                          value={item.duration}
                          onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                          className="h-9 text-sm"
                        />
                        {/* Quick preset chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {['لمدة 5 أيام', 'لمدة أسبوع', 'لمدة شهر'].map((d) => (
                            <button
                              type="button"
                              key={d}
                              onClick={() => handleItemChange(index, 'duration', d)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">تعليمات إضافية للمريض (اختياري)</Label>
                      <Input
                        placeholder="مثال: بعد الأكل، مع كمية وفيرة من الماء، تجنب القيادة بعد تناوله..."
                        value={item.instructions ?? ''}
                        onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add row button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="w-full border-dashed gap-1.5 text-xs text-primary hover:bg-primary/5"
              >
                <Plus className="size-4" />
                + إضافة دواء آخر للروشتة
              </Button>

              {/* General prescription notes */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="rxNotes" className="text-xs">ملاحظات عامة على الروشتة (تظهر في الطباعة)</Label>
                <Input
                  id="rxNotes"
                  placeholder="مثال: الراحة التامة، شرب سوائل دافئة، المتابعة بعد 5 أيام..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold px-6">
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  حفظ الروشتة الطبية ✓
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Print Prescription Modal */}
      {printPrescription && (
        <Dialog open={!!printPrescription} onOpenChange={(v) => !v && setPrintPrescription(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-3 no-print">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold">معاينة طباعة الروشتة</DialogTitle>
                <Button size="sm" onClick={executePrint} className="gap-1.5 bg-primary">
                  <Printer className="size-4" />
                  طباعة الآن
                </Button>
              </div>
            </DialogHeader>

            {/* Printable Paper Canvas */}
            <div id="printable-rx" className="p-6 bg-white text-black font-sans space-y-6 border rounded-lg shadow-sm">
              {/* Header */}
              <div className="border-b-2 border-black pb-4 flex items-center justify-between text-start">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{clinicName}</h2>
                  <p className="text-xs text-gray-600 mt-0.5">{doctorName ? `د. ${doctorName}` : 'عيادة التخصصات الطبية'}</p>
                </div>
                <div className="text-end text-xs font-mono text-gray-500">
                  <p className="font-bold text-sm text-black">Rx</p>
                  <p>{formatDate(printPrescription.createdAt)}</p>
                </div>
              </div>

              {/* Patient Bar */}
              <div className="rounded border border-gray-300 p-3 bg-gray-50/70 text-xs flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-gray-700">المريض: </span>
                  <span className="font-bold text-black text-sm">{patientName}</span>
                </div>
                {patientAge !== null && (
                  <div>
                    <span className="font-bold text-gray-700">العمر: </span>
                    <span className="font-mono">{patientAge} سنة</span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-gray-700">الجنس: </span>
                  <span>{patientGender === 'MALE' ? 'ذكر' : 'أنثى'}</span>
                </div>
              </div>

              {/* Rx Symbol */}
              <div className="text-3xl font-serif font-black text-gray-900 border-b border-gray-200 pb-1">
                ℞
              </div>

              {/* Medications Table / List */}
              <div className="space-y-4 min-h-[220px]">
                {printPrescription.items.map((it, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-3 flex items-start gap-3">
                    <span className="font-bold font-mono text-sm text-gray-700 mt-0.5">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-black">{it.drugName}</span>
                        <span className="font-medium text-xs text-gray-800 font-mono">{it.dose}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium">
                        {it.frequency} — {it.duration}
                      </p>
                      {it.instructions && (
                        <p className="text-xs text-gray-600 italic">
                          تعليمات: {it.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {printPrescription.notes && (
                <div className="rounded border border-gray-200 p-2.5 text-xs text-gray-700 bg-gray-50">
                  <span className="font-bold">توصيات: </span>
                  {printPrescription.notes}
                </div>
              )}

              {/* Footer Signature */}
              <div className="border-t-2 border-black pt-4 flex items-end justify-between text-xs text-gray-500">
                <p>تمنياتنا لكم بالشفاء العاجل</p>
                <div className="text-center font-medium">
                  <p className="font-bold text-black text-sm mb-6">توقيع الطبيب</p>
                  <p className="border-t border-gray-400 pt-1 px-4 text-[10px]">ختم واعتماد العيادة</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
