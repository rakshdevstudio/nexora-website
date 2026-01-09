import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const AdminDashboard = ({ apiBaseUrl }) => {
    const [adminData, setAdminData] = useState({
        contacts: [],
        inquiries: [],
        stats: null
    });
    // --- Admin: status update state
    const [updatingStatus, setUpdatingStatus] = useState(false);
    // --- Enterprise drill-down: selected contact state
    const [selectedContact, setSelectedContact] = useState(null);
    // --- Admin: internal notes state
    const [internalNotes, setInternalNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    // --- Admin: notes saved visual state
    const [notesSaved, setNotesSaved] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    // --- Admin filters and search ---
    const [contactFilter, setContactFilter] = useState("new");
    const [contactSearch, setContactSearch] = useState("");

    // Router for redirect
    // We need to import useNavigate but it wasn't in original imports. 
    // Since we can't easily add imports with replace_file_content unless we replace the top too,
    // let's use window.location or handle it via a multi-replace if strictly needed,
    // OR we can assume App.js protects the route?
    // The plan said "Redirect to login if missing". 
    // Let's add the logic to check token on load.

    // --- Admin filtered contacts ---
    const filteredContacts = adminData.contacts
        .filter((c) => (contactFilter === "all" ? true : (c.status || "new") === contactFilter))
        .filter((c) =>
            `${c.name} ${c.email}`.toLowerCase().includes(contactSearch.toLowerCase())
        );

    useEffect(() => {
        const token = sessionStorage.getItem('admin_token');
        if (!token) {
            window.location.href = '/admin'; // Simple redirect if not authenticated
            return;
        }
        loadAdminData(token);
    }, []);

    const loadAdminData = async (token) => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            const [contacts, inquiries, stats] = await Promise.all([
                axios.get(`${apiBaseUrl}/admin/contacts`, config),
                axios.get(`${apiBaseUrl}/admin/service-inquiries`, config),
                axios.get(`${apiBaseUrl}/admin/stats`, config)
            ]);

            setAdminData({
                contacts: contacts.data,
                inquiries: inquiries.data,
                stats: stats.data
            });
        } catch (error) {
            console.error("Admin load error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Session expired or invalid token.");
                sessionStorage.removeItem('admin_token');
                window.location.href = '/admin';
            }
        }
    };

    const updateContactStatus = async (contactId, nextStatus) => {
        if (!contactId) return;

        const token = sessionStorage.getItem('admin_token');
        if (!token) return;

        try {
            setUpdatingStatus(true);
            await axios.post(
                `${apiBaseUrl}/admin/contacts/${contactId}/status`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAdminData((prev) => ({
                ...prev,
                contacts: prev.contacts.map((c) =>
                    c.id === contactId ? { ...c, status: nextStatus } : c
                ),
            }));

            // Update selected contact as well if it matches
            if (selectedContact && selectedContact.id === contactId) {
                setSelectedContact((prev) => ({ ...prev, status: nextStatus }));
            }
        } catch (error) {
            console.error("Status update failed:", error);
            alert("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Removed handleAdminSubmit as it's no longer needed

    const saveNotes = async () => {
        if (!selectedContact?.id) return;

        const token = sessionStorage.getItem('admin_token');
        if (!token) return;

        try {
            setSavingNotes(true);

            await axios.post(
                `${apiBaseUrl}/admin/contacts/${selectedContact.id}/notes`,
                { notes: internalNotes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedContact((prev) =>
                prev ? { ...prev, notes: internalNotes } : prev
            );
            setAdminData((prev) => ({
                ...prev,
                contacts: prev.contacts.map((c) =>
                    c.id === selectedContact.id ? { ...c, notes: internalNotes } : c
                )
            }));
            setNotesSaved(true);
            setLastSavedAt(new Date());
            setTimeout(() => {
                setNotesSaved(false);
            }, 2000);
        } catch (e) {
            alert("Failed to save notes");
        } finally {
            setSavingNotes(false);
        }
    };

    // Sync internal notes when selection changes
    useEffect(() => {
        if (selectedContact) {
            setInternalNotes(selectedContact.notes || "");
        }
    }, [selectedContact]);

    return (
        <div className="admin-container">
            {/* LEFT COLUMN */}
            <div className="admin-dashboard">
                <div className="admin-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Nexora Admin</h1>
                    <button
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => {
                            sessionStorage.removeItem('admin_token');
                            window.location.href = '/admin';
                        }}
                    >
                        Logout
                    </button>
                </div>

                <div className="admin-stats">
                    <div>Total Contacts: <strong>{adminData.stats?.contacts ?? 0}</strong></div>
                    <div>Service Inquiries: <strong>{adminData.stats?.service_inquiries ?? 0}</strong></div>
                    <div>Subscribers: <strong>{adminData.stats?.newsletter ?? 0}</strong></div>
                </div>

                <h2>Contacts</h2>

                <div className="admin-status-tabs">
                    {["new", "contacted", "qualified", "archived"].map((status) => (
                        <div
                            key={status}
                            className={`admin-status-tab ${contactFilter === status ? "active" : ""}`}
                            onClick={() => setContactFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                    ))}
                </div>

                <div className="admin-search">
                    <input
                        type="search"
                        placeholder="Search by name or email…"
                        aria-label="Search contacts"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                    />
                </div>

                {adminData.contacts.length === 0 && (
                    <div className="admin-empty">
                        No contacts yet. New submissions will appear here.
                    </div>
                )}

                <div className="admin-table">
                    {filteredContacts.map((c) => (
                        <div
                            key={c.id}
                            className={`admin-row ${selectedContact?.id === c.id ? 'active' : ''}`}
                            onClick={() =>
                                setSelectedContact((prev) =>
                                    prev && prev.id === c.id ? null : c
                                )
                            }
                        >
                            <div className="admin-row-main">
                                <strong>{c.name}</strong>
                                <span className="admin-contact-email">{c.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div
                className={`admin-detail-panel ${selectedContact ? '' : 'is-collapsed'
                    }`}
            >
                {selectedContact && (
                    <>
                        <div className="admin-detail-header">
                            <div>
                                <h2>{selectedContact.name}</h2>
                                <p className="admin-detail-email">{selectedContact.email}</p>
                            </div>

                            <div className="admin-status-control">
                                <label htmlFor="status-select">Status</label>
                                <select
                                    id="status-select"
                                    value={selectedContact.status || "new"}
                                    disabled={updatingStatus}
                                    onChange={(e) =>
                                        updateContactStatus(selectedContact.id, e.target.value)
                                    }
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="admin-detail-grid">
                            <div>
                                <label>Industry</label>
                                <div>{selectedContact.industry || "—"}</div>
                            </div>

                            <div>
                                <label>Business Type</label>
                                <div>{selectedContact.business_type || "—"}</div>
                            </div>

                            <div>
                                <label>City</label>
                                <div>{selectedContact.city || "—"}</div>
                            </div>

                            <div>
                                <label>Phone</label>
                                <div>{selectedContact.phone && selectedContact.phone !== "undefined"
                                    ? selectedContact.phone
                                    : "—"}</div>
                            </div>
                        </div>

                        <div className="admin-detail-message">
                            <label>Message</label>
                            <p>{selectedContact.message || "No message provided."}</p>
                        </div>
                        <div className="admin-internal-notes">
                            <label>Internal Notes</label>

                            <textarea
                                placeholder="Add private notes for internal tracking…"
                                value={internalNotes}
                                onChange={(e) => {
                                    setInternalNotes(e.target.value);
                                    setNotesSaved(false);
                                }}
                            />
                            {notesSaved && (
                                <div className="notes-confirmation">
                                    Notes saved successfully.
                                </div>
                            )}

                            <div className="notes-actions">
                                {notesSaved && lastSavedAt && (
                                    <span className="notes-saved-indicator">
                                        Saved ✓ <em>{lastSavedAt.toLocaleTimeString()}</em>
                                    </span>
                                )}
                                <button
                                    className={`notes-save-btn ${notesSaved ? 'saved' : ''}`}
                                    onClick={saveNotes}
                                    disabled={savingNotes}
                                >
                                    {savingNotes ? "Saving…" : notesSaved ? "Saved" : "Save Notes"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
