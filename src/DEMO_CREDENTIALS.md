# Demo Credentials for ChainGuard

This document contains all demo login credentials for testing the ChainGuard system.

## All Demo Users

### 1. Administrator
- **Email:** `admin@evidenceshield.gov`
- **Password:** `admin123`
- **Badge ID:** ADMIN-001
- **Name:** System Administrator
- **Department:** IT Department
- **Permissions:** Can only manage users (create, edit, deactivate)

---

### 2. Police Officer (Detective John Smith)
- **Email:** `john.detective@police.gov`
- **Password:** `police123`
- **Badge ID:** PO-1234
- **Name:** Detective John Smith
- **Department:** Homicide Division
- **Permissions:** Upload files to IPFS, share evidence to Forensics

---

### 3. Police Officer (Officer Sarah Johnson)
- **Email:** `sarah.officer@police.gov`
- **Password:** `police123`
- **Badge ID:** PO-5678
- **Name:** Officer Sarah Johnson
- **Department:** Narcotics Unit
- **Permissions:** Upload files to IPFS, share evidence to Forensics

---

### 4. Forensics Specialist (Dr. Michael Chen)
- **Email:** `mike.forensics@lab.gov`
- **Password:** `forensics123`
- **Badge ID:** FS-9012
- **Name:** Dr. Michael Chen
- **Department:** Crime Lab
- **Permissions:** Upload files to IPFS, share evidence to Prosecutors

---

### 5. Forensics Specialist (Emily Rodriguez)
- **Email:** `emily.analyst@lab.gov`
- **Password:** `forensics123`
- **Badge ID:** FS-3456
- **Name:** Emily Rodriguez
- **Department:** Digital Forensics
- **Permissions:** Upload files to IPFS, share evidence to Prosecutors

---

### 6. Prosecutor (David Thompson)
- **Email:** `david.prosecutor@da.gov`
- **Password:** `prosecutor123`
- **Badge ID:** DA-7890
- **Name:** David Thompson
- **Department:** District Attorney
- **Permissions:** Verify and download files only

---

### 7. Prosecutor (Lisa Martinez)
- **Email:** `lisa.ada@da.gov`
- **Password:** `prosecutor123`
- **Badge ID:** ADA-2345
- **Name:** Lisa Martinez
- **Department:** Assistant DA
- **Permissions:** Verify and download files only

---

### 8. Prosecutor (Robert Williams)
- **Email:** `robert.senior@da.gov`
- **Password:** `prosecutor123`
- **Badge ID:** SC-6789
- **Name:** Robert Williams
- **Department:** Senior Counsel
- **Permissions:** Verify and download files only

---

## Quick Login Tips

- **For testing User Management:** Login as `admin@evidenceshield.gov`
- **For testing File Upload:** Login as any Police Officer or Forensics Specialist
- **For testing File Sharing:** Login as Police Officer (share to Forensics) or Forensics (share to Prosecutor)
- **For testing File Verification:** Login as any Prosecutor

---

## System Features by Role

| Feature | Admin | Police | Forensics | Prosecutor |
|---------|-------|--------|-----------|------------|
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Upload Files | ❌ | ✅ | ✅ | ❌ |
| Share Evidence | ❌ | ✅ (to Forensics) | ✅ (to Prosecutor) | ❌ |
| Verify Files | ❌ | ✅ | ✅ | ✅ |
| Download Files | ❌ | ✅ | ✅ | ✅ |
| View Audit Trail | ✅ | ✅ | ✅ | ✅ |

---

**Note:** All files are stored in the KV database as arrays of numbers. For production, enable real IPFS & Polygon integration by configuring API keys in the backend.
