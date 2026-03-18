import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AdminViewContext } from "./types";
import { API_BASE_URL } from "@/lib/api-base";

type FlatField = { path: string; value: any };

const isPlainObject = (value: any) =>
  Object.prototype.toString.call(value) === "[object Object]";

const flattenDetails = (input: any, prefix = "", acc: FlatField[] = []) => {
  if (input === null || input === undefined) {
    if (prefix) acc.push({ path: prefix, value: null });
    return acc;
  }

  if (Array.isArray(input)) {
    if (input.length === 0) {
      if (prefix) acc.push({ path: prefix, value: [] });
      return acc;
    }
    input.forEach((item, index) => {
      const nextPath = `${prefix}[${index + 1}]`;
      flattenDetails(item, nextPath, acc);
    });
    return acc;
  }

  if (isPlainObject(input)) {
    const entries = Object.entries(input);
    if (entries.length === 0) {
      if (prefix) acc.push({ path: prefix, value: {} });
      return acc;
    }
    entries.forEach(([key, value]) => {
      const nextPath = prefix ? `${prefix}.${key}` : key;
      flattenDetails(value, nextPath, acc);
    });
    return acc;
  }

  acc.push({ path: prefix || "value", value: input });
  return acc;
};

const formatDetailValue = (value: any) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatDateTime = (value: any) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
};

export function OnboardingView({ ctx }: { ctx: AdminViewContext }) {
  const {
    onboardingSubmissions,
    onboardingLoading,
    loadOnboardingSubmissions,
    createFormationFromOnboarding,
  } = ctx;
  const [creatingIds, setCreatingIds] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");

  useEffect(() => {
    loadOnboardingSubmissions?.();
  }, [loadOnboardingSubmissions]);

  const detailRows = useMemo(() => {
    if (!selectedSubmission?.formData) return [];
    return flattenDetails(selectedSubmission.formData);
  }, [selectedSubmission]);

  const formData = selectedSubmission?.formData || {};
  const stakeholders = Array.isArray(formData.stakeholders) ? formData.stakeholders : [];
  const existingCompany = formData.existingCompany || {};
  const complianceServices = formData.complianceServices || {};
  const addOns = formData.addOns || {};
  const bookkeeping = formData.bookkeeping || {};
  const uploadedDocs = Array.isArray(formData.uploadedDocuments) ? formData.uploadedDocuments : [];

  const renderField = (label: string, value: any) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-gray-900 break-words">{formatDetailValue(value)}</p>
    </div>
  );

  useEffect(() => {
    const userId = selectedSubmission?.user?._id || selectedSubmission?.user?.id;
    if (!userId) {
      setUserDocuments([]);
      setDocumentsError("");
      return;
    }

    let isMounted = true;
    const loadDocuments = async () => {
      setDocumentsLoading(true);
      setDocumentsError("");
      try {
        const response = await fetch(`${API_BASE_URL}/documents/admin/user/${userId}`, {
          credentials: "include",
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to load documents.");
        }
        if (isMounted) {
          setUserDocuments(data.documents || []);
        }
      } catch (error) {
        if (isMounted) {
          setUserDocuments([]);
          setDocumentsError(error instanceof Error ? error.message : "Unable to load documents.");
        }
      } finally {
        if (isMounted) setDocumentsLoading(false);
      }
    };

    loadDocuments();
    return () => {
      isMounted = false;
    };
  }, [selectedSubmission]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Submissions</CardTitle>
        <CardDescription>Review onboarding forms and create formations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {onboardingLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-sm text-muted-foreground">
                  Loading onboarding submissions...
                </TableCell>
              </TableRow>
            )}
            {!onboardingLoading && (!onboardingSubmissions || onboardingSubmissions.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-sm text-muted-foreground">
                  No onboarding submissions yet.
                </TableCell>
              </TableRow>
            )}
            {(onboardingSubmissions || []).map((submission: any) => {
              const companyName =
                submission.formData?.existingCompany?.name ||
                submission.formData?.nameChoice1 ||
                submission.formData?.nameChoice2 ||
                submission.formData?.nameChoice3 ||
                "New Company";
              const country = submission.planCountry || submission.destination || submission.formData?.existingCompany?.country || "USA";
              const entity = submission.entityType || submission.planEntityType || submission.formData?.existingCompany?.entityType || "LLC";
              const submissionId = String(submission._id || submission.id);
              const isProcessing = submission.status === "processing" || creatingIds.has(submissionId);
              const canCreate = !submission.formation && submission.status !== "completed" && !isProcessing;
              return (
                <TableRow key={submissionId}>
                  <TableCell className="font-medium">{companyName}</TableCell>
                  <TableCell>{submission.user?.name || "Unknown user"}</TableCell>
                  <TableCell>{submission.plan || "-"}</TableCell>
                  <TableCell>{country}</TableCell>
                  <TableCell>{entity}</TableCell>
                  <TableCell>{submission.status || "submitted"}</TableCell>
                  <TableCell>{submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        disabled={!canCreate}
                        onClick={async () => {
                          if (!canCreate) return;
                          setCreatingIds((prev) => new Set(prev).add(submissionId));
                          try {
                            await createFormationFromOnboarding?.(submissionId);
                          } finally {
                            setCreatingIds((prev) => {
                              const next = new Set(prev);
                              next.delete(submissionId);
                              return next;
                            });
                          }
                        }}
                      >
                        {submission.formation
                          ? "Formation Created"
                          : isProcessing
                            ? "Creating..."
                            : "Create Formation"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => { if (!open) setSelectedSubmission(null); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Onboarding Details</DialogTitle>
            <DialogDescription>
              Full onboarding information submitted by the client.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSubmission.user?.name || "Unknown user"}
                  </p>
                  <p className="text-xs text-gray-500">{selectedSubmission.user?.email || "-"}</p>
                  <p className="text-xs text-gray-500">{selectedSubmission.user?.phone || "-"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="text-sm font-medium text-gray-900">{selectedSubmission.plan || "-"}</p>
                  <p className="text-xs text-gray-500">Entity: {selectedSubmission.planEntityType || selectedSubmission.entityType || "-"}</p>
                  <p className="text-xs text-gray-500">Country: {selectedSubmission.planCountry || selectedSubmission.destination || "-"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : "-"}
                  </p>
                  <p className="text-xs text-gray-500">Status: {selectedSubmission.status || "submitted"}</p>
                  <p className="text-xs text-gray-500">
                    Company:{" "}
                    {selectedSubmission.formData?.existingCompany?.name ||
                      selectedSubmission.formData?.nameChoice1 ||
                      selectedSubmission.formData?.nameChoice2 ||
                      selectedSubmission.formData?.nameChoice3 ||
                      "New Company"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Company & Plan</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {renderField("Plan", selectedSubmission.plan)}
                    {renderField("Plan Country", selectedSubmission.planCountry || selectedSubmission.destination || existingCompany.country)}
                    {renderField("Plan State / Region", selectedSubmission.planState || formData.state || formData.freeZone)}
                    {renderField("Entity Type", selectedSubmission.planEntityType || selectedSubmission.entityType || existingCompany.entityType)}
                    {renderField("Company Name Choice 1", formData.nameChoice1)}
                    {renderField("Company Name Choice 2", formData.nameChoice2)}
                    {renderField("Company Name Choice 3", formData.nameChoice3)}
                    {renderField("Website", formData.website)}
                    {renderField("Industry", formData.industry || existingCompany.industry)}
                    {renderField("Purpose", formData.purpose)}
                  </div>
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Existing Company</h4>
                  {existingCompany?.name ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {renderField("Company Name", existingCompany.name)}
                      {renderField("Country", existingCompany.country)}
                      {renderField("Entity Type", existingCompany.entityType)}
                      {renderField("Tax ID", existingCompany.taxId)}
                      {renderField("Incorporation Date", existingCompany.incorporationDate)}
                      {renderField("Industry", existingCompany.industry)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No existing company details provided.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Stakeholders</h4>
                {stakeholders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No stakeholders listed.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Nationality</TableHead>
                          <TableHead>Ownership</TableHead>
                          <TableHead>Documents</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stakeholders.map((stakeholder: any, index: number) => {
                          const docs = stakeholder?.documents || {};
                          const docCount = Object.values(docs).filter(Boolean).length;
                          return (
                            <TableRow key={`stakeholder-${index}`}>
                              <TableCell className="font-medium">{stakeholder?.name || `Stakeholder ${index + 1}`}</TableCell>
                              <TableCell>{stakeholder?.role || "-"}</TableCell>
                              <TableCell>{stakeholder?.email || "-"}</TableCell>
                              <TableCell>{stakeholder?.nationality || "-"}</TableCell>
                              <TableCell>{stakeholder?.ownership || "-"}</TableCell>
                              <TableCell>{docCount ? `${docCount} file(s)` : "-"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Compliance Services</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {renderField("Bookkeeping", complianceServices.bookkeeping)}
                    {renderField("Corporate Tax", complianceServices.corporateTax)}
                    {renderField("Sales Tax", complianceServices.salesTax)}
                    {renderField("Payroll", complianceServices.payroll)}
                    {renderField("Annual Filing", complianceServices.annualFiling)}
                  </div>
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Add-ons</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {renderField("Bank Account", addOns.bankAccount)}
                    {renderField("BOI Reporting", addOns.boiReporting)}
                    {renderField("Expedited", addOns.expedited)}
                    {renderField("Tax Consultation", addOns.taxConsultation)}
                    {renderField("Annual Compliance", addOns.annualCompliance)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Bookkeeping</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderField("Software", bookkeeping.software)}
                  {renderField("Monthly Transactions", bookkeeping.monthlyTransactions)}
                  {renderField("Average Transaction Value", bookkeeping.avgTransactionValue)}
                  {renderField("Bank Accounts", bookkeeping.bankAccounts)}
                  {renderField("Fiscal Year End", bookkeeping.fiscalYearEnd)}
                  {renderField("Has Prior Tax Returns", bookkeeping.hasPriorTaxReturns)}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Uploaded Documents</h4>
                {documentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading documents...</p>
                ) : documentsError ? (
                  <p className="text-sm text-red-600">{documentsError}</p>
                ) : uploadedDocs.length === 0 && userDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                ) : (
                  <div className="space-y-3">
                    {uploadedDocs.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Onboarding Uploads</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {uploadedDocs.map((doc: any, index: number) => {
                            const match = userDocuments.find((item) => String(item.id) === String(doc.documentId));
                            const downloadUrl = match?.downloadUrl || `${API_BASE_URL}/documents/${doc.documentId}/download`;
                            return (
                              <div key={`upload-${index}`} className="rounded-lg border p-3">
                                <p className="text-sm font-medium text-gray-900">{doc.fileName || match?.name || "Document"}</p>
                                <p className="text-xs text-gray-500">Type: {doc.documentType || match?.documentType || "-"}</p>
                                <p className="text-xs text-gray-500">Category: {doc.category || match?.folder || "-"}</p>
                                <a
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                >
                                  View / Download
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {userDocuments.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">All User Documents</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {userDocuments.map((doc: any) => (
                            <div key={doc.id} className="rounded-lg border p-3">
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">Type: {doc.documentType || "-"}</p>
                              <p className="text-xs text-gray-500">Folder: {doc.folder || "-"}</p>
                              <p className="text-xs text-gray-400">Uploaded: {formatDateTime(doc.uploadedAt)}</p>
                              <a
                                href={doc.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                              >
                                View / Download
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">All Submitted Fields</h4>
                {detailRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No form details available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailRows.map((row) => (
                      <div key={row.path} className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">{row.path}</p>
                        <p className="text-sm text-gray-900 break-words">{formatDetailValue(row.value)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
