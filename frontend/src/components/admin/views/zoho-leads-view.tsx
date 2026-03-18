import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { AdminViewContext } from "./types";
import { adminAPI, zohoAPI } from "@/lib/admin-api";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const resolveValue = (value?: string) => (value && String(value).trim() ? value : "-");


export function ZohoLeadsView({ ctx = {} }: { ctx?: AdminViewContext }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadDetails, setLeadDetails] = useState<any | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, qualified: 0, converted: 0 });

  const loadStoredLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await zohoAPI.getStoredLeads({
        status: statusFilter,
        search: searchQuery,
        page,
        limit,
        source: sourceFilter,
        assignedTo: assignedFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setLeads(data.leads || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      
      // Calculate stats
      const allLeads = data.leads || [];
      setStats({
        total: allLeads.length,
        new: allLeads.filter((l: any) => l.status === 'new').length,
        contacted: allLeads.filter((l: any) => l.status === 'contacted').length,
        qualified: allLeads.filter((l: any) => l.status === 'qualified').length,
        converted: allLeads.filter((l: any) => l.status === 'converted').length,
      });
    } catch (error) {
      setLeads([]);
      setError(error instanceof Error ? error.message : "Unable to load Zoho leads.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page, limit, sourceFilter, assignedFilter, dateFrom, dateTo]);

  const syncLeads = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      await zohoAPI.syncLeads();
      
      // Show success message
      setError(null);
      
      // Reload leads
      await loadStoredLeads();
      await loadSyncStatus();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sync Zoho leads.");
    } finally {
      setSyncing(false);
    }
  }, [loadStoredLeads]);

  const loadSyncStatus = useCallback(async () => {
    try {
      const data = await zohoAPI.getSyncStatus();
      setSyncStatus(data.status || null);
    } catch (error) {
      setSyncStatus(null);
    }
  }, []);

  const loadAdminUsers = useCallback(async () => {
    try {
      const data = await adminAPI.getAdminUsers();
      setAdminUsers(data.users || []);
    } catch (error) {
      setAdminUsers([]);
    }
  }, []);

  const loadLeadDetails = useCallback(async (leadId: string) => {
    if (!leadId) return;
    try {
      const data = await zohoAPI.getLeadById(leadId);
      setLeadDetails(data.lead);
    } catch (error) {
      setLeadDetails(null);
    }
  }, []);

  const openLeadDetails = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
    loadLeadDetails(leadId);
  }, [loadLeadDetails]);

  const handleStatusUpdate = useCallback(async (leadId: string, status: string) => {
    if (!leadId || !status) return;
    setUpdatingLeadId(leadId);
    try {
      await zohoAPI.updateLeadStatus(leadId, status);
      await loadStoredLeads();
      if (selectedLeadId === leadId) {
        await loadLeadDetails(leadId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update lead status.");
    } finally {
      setUpdatingLeadId(null);
    }
  }, [loadStoredLeads, loadLeadDetails, selectedLeadId]);

  const handleAssign = useCallback(async (leadId: string, assignedTo?: string | null) => {
    if (!leadId) return;
    setUpdatingLeadId(leadId);
    try {
      await zohoAPI.assignLead(leadId, assignedTo || null);
      await loadStoredLeads();
      if (selectedLeadId === leadId) {
        await loadLeadDetails(leadId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to assign lead.");
    } finally {
      setUpdatingLeadId(null);
    }
  }, [loadStoredLeads, loadLeadDetails, selectedLeadId]);

  const handleAddNote = useCallback(async () => {
    if (!selectedLeadId || !noteBody.trim()) return;
    try {
      await zohoAPI.addLeadNote(selectedLeadId, noteBody.trim());
      setNoteBody("");
      await loadLeadDetails(selectedLeadId);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to add note.");
    }
  }, [selectedLeadId, noteBody, loadLeadDetails]);

  const didInitialLoad = useRef(false);
  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    loadStoredLeads();
    loadSyncStatus();
    loadAdminUsers();
  }, [loadStoredLeads, loadSyncStatus, loadAdminUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStoredLeads();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sourceFilter, assignedFilter, dateFrom, dateTo, page, loadStoredLeads]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, sourceFilter, assignedFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Leads</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">New</div>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Contacted</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Qualified</div>
            <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Converted</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Zoho CRM Leads</CardTitle>
            <CardDescription>
              Auto-syncs every 30 minutes. Last sync: {formatDate(syncStatus?.lastSyncedAt || leads[0]?.lastSyncedAt)}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={syncLeads} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}
          {syncStatus?.lastSyncError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Last sync error: {syncStatus.lastSyncError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, email, company, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lead source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {[...new Set(leads.map((lead) => lead.leadSource).filter(Boolean))].map((source) => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assigned to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {adminUsers.map((admin) => (
                  <SelectItem key={admin._id || admin.id} value={admin._id || admin.id}>
                    {admin.name || admin.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10"
              placeholder="To"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Lead Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length ? (
                  leads.map((lead: any) => (
                    <TableRow key={lead._id}>
                      <TableCell className="font-medium">{resolveValue(lead.fullName)}</TableCell>
                      <TableCell>{resolveValue(lead.email)}</TableCell>
                      <TableCell>{resolveValue(lead.phone)}</TableCell>
                      <TableCell>{resolveValue(lead.company)}</TableCell>
                      <TableCell>{resolveValue(lead.leadSource)}</TableCell>
                      <TableCell>
                        <Select
                          value={lead.status || 'new'}
                          onValueChange={(value) => handleStatusUpdate(lead._id, value)}
                          disabled={updatingLeadId === lead._id}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.assignedTo?._id || lead.assignedTo || 'unassigned'}
                          onValueChange={(value) => handleAssign(lead._id, value === 'unassigned' ? null : value)}
                          disabled={updatingLeadId === lead._id}
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {adminUsers.map((admin) => (
                              <SelectItem key={admin._id || admin.id} value={admin._id || admin.id}>
                                {admin.name || admin.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(lead.zohoCreatedTime)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openLeadDetails(lead._id)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                      No leads found. Click "Sync Now" to fetch from Zoho CRM.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div>
              Showing page {page} of {totalPages} · {totalCount} total leads
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedLeadId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLeadId(null);
            setLeadDetails(null);
            setNoteBody("");
          }
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Review lead activity, assign owners, and add notes.</DialogDescription>
          </DialogHeader>

          {!leadDetails ? (
            <div className="text-sm text-muted-foreground">Loading lead details...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium text-gray-900">{resolveValue(leadDetails.fullName)}</p>
                  <p className="text-xs text-gray-500">{resolveValue(leadDetails.email)}</p>
                  <p className="text-xs text-gray-500">{resolveValue(leadDetails.phone)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium text-gray-900">{resolveValue(leadDetails.company)}</p>
                  <p className="text-xs text-gray-500">Source: {resolveValue(leadDetails.leadSource)}</p>
                  <p className="text-xs text-gray-500">Created: {formatDate(leadDetails.zohoCreatedTime)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="text-sm font-medium text-gray-900">
                    {leadDetails.assignedTo?.name || leadDetails.assignedTo?.email || "Unassigned"}
                  </p>
                  <p className="text-xs text-gray-500">Status: {leadDetails.status}</p>
                  {leadDetails.convertedToUser && (
                    <p className="text-xs text-gray-500">
                      Converted User: {leadDetails.convertedToUser?.email || leadDetails.convertedToUser?.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Last Synced: {formatDate(leadDetails.lastSyncedAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Update Status</h4>
                  <Select
                    value={leadDetails.status || 'new'}
                    onValueChange={(value) => handleStatusUpdate(leadDetails._id, value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">Assign Lead</h4>
                  <Select
                    value={leadDetails.assignedTo?._id || leadDetails.assignedTo || 'unassigned'}
                    onValueChange={(value) => handleAssign(leadDetails._id, value === 'unassigned' ? null : value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {adminUsers.map((admin) => (
                        <SelectItem key={admin._id || admin.id} value={admin._id || admin.id}>
                          {admin.name || admin.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Notes</h4>
                <div className="space-y-2">
                  {(leadDetails.comments || []).length ? (
                    leadDetails.comments.map((comment: any, index: number) => (
                      <div key={`comment-${index}`} className="rounded border p-3 text-sm">
                        <p className="text-gray-800">{comment.body}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {comment.author?.name || comment.author?.email || "Admin"} · {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                  />
                  <Button onClick={handleAddNote} disabled={!noteBody.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Activity Timeline</h4>
                {(leadDetails.activities || []).length ? (
                  <div className="space-y-2">
                    {leadDetails.activities.map((activity: any, index: number) => (
                      <div key={`activity-${index}`} className="rounded border p-3 text-sm">
                        <p className="text-gray-800">{activity.message || activity.type}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.actor?.name || activity.actor?.email || "System"} · {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
