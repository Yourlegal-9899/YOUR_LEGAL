import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { settingsAPI } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { AdminViewContext } from "./types";

const TRAINING_SETTINGS_KEY = "ai_chat_training_rules";

type TrainingRule = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  isActive: boolean;
  updatedAt?: string;
};

type RuleFormState = {
  id: string | null;
  question: string;
  answer: string;
  keywords: string;
  priority: string;
  isActive: boolean;
};

const createEmptyForm = (): RuleFormState => ({
  id: null,
  question: "",
  answer: "",
  keywords: "",
  priority: "5",
  isActive: true,
});

const clampPriority = (value: number) => {
  if (Number.isNaN(value)) return 5;
  return Math.min(10, Math.max(1, Math.round(value)));
};

const parseKeywords = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const normalizeRule = (raw: any, index: number): TrainingRule | null => {
  const question = String(raw?.question || "").trim();
  const answer = String(raw?.answer || "").trim();
  if (!question || !answer) return null;

  const keywords = Array.isArray(raw?.keywords)
    ? raw.keywords.map((item: any) => String(item || "").trim().toLowerCase()).filter(Boolean)
    : parseKeywords(String(raw?.keywords || ""));

  return {
    id: String(raw?.id || `rule-${Date.now()}-${index}`),
    question,
    answer,
    keywords,
    priority: clampPriority(Number(raw?.priority ?? 5)),
    isActive: raw?.isActive !== false,
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
  };
};

const parseRulesFromSetting = (value: any): TrainingRule[] => {
  const list = Array.isArray(value?.rules) ? value.rules : Array.isArray(value) ? value : [];
  return list
    .map((item: any, index: number) => normalizeRule(item, index))
    .filter((item): item is TrainingRule => Boolean(item));
};

export function AiTrainingView({ ctx }: { ctx: AdminViewContext }) {
  void ctx;
  const [rules, setRules] = useState<TrainingRule[]>([]);
  const [form, setForm] = useState<RuleFormState>(createEmptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sortedRules = useMemo(
    () =>
      [...rules].sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.question.localeCompare(b.question);
      }),
    [rules]
  );

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await settingsAPI.getByKey(TRAINING_SETTINGS_KEY);
      const nextRules = parseRulesFromSetting(data?.setting?.value);
      setRules(nextRules);
    } catch (loadError: any) {
      const rawMessage = String(loadError?.message || "");
      const isNotFound =
        rawMessage.toLowerCase().includes("setting not found") || rawMessage.toLowerCase().includes("404");

      if (isNotFound) {
        setRules([]);
      } else {
        setError(rawMessage || "Failed to load training rules.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const persistRules = useCallback(async (nextRules: TrainingRule[], successMessage: string) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await settingsAPI.createOrUpdate({
        key: TRAINING_SETTINGS_KEY,
        category: "integration",
        description: "Admin-managed training rules for YourLegal AI CFO semantic answer matching.",
        isPublic: true,
        value: {
          version: 1,
          updatedAt: new Date().toISOString(),
          rules: nextRules.map((rule) => ({
            ...rule,
            updatedAt: new Date().toISOString(),
          })),
        },
      });
      setRules(nextRules);
      setMessage(successMessage);
    } catch (persistError: any) {
      setError(String(persistError?.message || "Failed to save training rules."));
    } finally {
      setSaving(false);
    }
  }, []);

  const onSubmitRule = async () => {
    const question = form.question.trim();
    const answer = form.answer.trim();
    if (!question || !answer) {
      setError("Question and answer are required.");
      setMessage("");
      return;
    }

    const priority = clampPriority(Number(form.priority || 5));
    const nextRule: TrainingRule = {
      id: form.id || `rule-${Date.now()}`,
      question,
      answer,
      keywords: parseKeywords(form.keywords),
      priority,
      isActive: form.isActive,
      updatedAt: new Date().toISOString(),
    };

    const nextRules = form.id
      ? rules.map((rule) => (rule.id === form.id ? nextRule : rule))
      : [nextRule, ...rules];

    await persistRules(nextRules, form.id ? "Training rule updated." : "Training rule added.");
    setForm(createEmptyForm());
  };

  const onEditRule = (rule: TrainingRule) => {
    setForm({
      id: rule.id,
      question: rule.question,
      answer: rule.answer,
      keywords: rule.keywords.join(", "),
      priority: String(rule.priority),
      isActive: rule.isActive,
    });
    setMessage("");
    setError("");
  };

  const onDeleteRule = async (ruleId: string) => {
    const nextRules = rules.filter((rule) => rule.id !== ruleId);
    await persistRules(nextRules, "Training rule deleted.");
    if (form.id === ruleId) {
      setForm(createEmptyForm());
    }
  };

  const onToggleRule = async (ruleId: string, checked: boolean) => {
    const nextRules = rules.map((rule) => (rule.id === ruleId ? { ...rule, isActive: checked } : rule));
    await persistRules(nextRules, checked ? "Rule activated." : "Rule paused.");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Training Rules</CardTitle>
          <CardDescription>
            Add business-approved question-answer rules. The AI CFO will semantically match these first before generating a response.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="ai-rule-question">Question Pattern</Label>
              <Input
                id="ai-rule-question"
                placeholder="Example: what is my tax deadline"
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="ai-rule-answer">Preferred Answer</Label>
              <Textarea
                id="ai-rule-answer"
                rows={5}
                placeholder="Write the exact answer style your team wants the chatbot to give."
                value={form.answer}
                onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-rule-keywords">Keywords (comma separated)</Label>
              <Input
                id="ai-rule-keywords"
                placeholder="tax deadline, due date, filing"
                value={form.keywords}
                onChange={(event) => setForm((prev) => ({ ...prev, keywords: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-rule-priority">Priority (1-10)</Label>
              <Input
                id="ai-rule-priority"
                type="number"
                min={1}
                max={10}
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 lg:col-span-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Rule Status</p>
                <p className="text-xs text-gray-500">Active rules are considered by the AI CFO during matching.</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSubmitRule} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {form.id ? "Update Rule" : "Add Rule"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(createEmptyForm())}
              disabled={saving}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </div>

          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Rules</CardTitle>
          <CardDescription>Rules are checked by semantic relevance and priority.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading AI training rules...
            </div>
          ) : sortedRules.length === 0 ? (
            <p className="text-sm text-gray-600">No training rules yet. Add the first one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question Pattern</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{rule.question}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{rule.answer}</p>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                          disabled={saving}
                        />
                        <span className="text-xs text-gray-600">{rule.isActive ? "Active" : "Paused"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {rule.keywords.length ? rule.keywords.join(", ") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => onEditRule(rule)} disabled={saving}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDeleteRule(rule.id)}
                          disabled={saving}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

