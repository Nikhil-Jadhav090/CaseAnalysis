# Use Case Diagram - Case Analysis System

## Actors

### 1. **User (General User/Complainant)**
- Person filing a case
- Can register, login, and manage their own cases
- Limited access to system features

### 2. **Admin**
- System administrator
- Full access to all system features
- Can manage users and all cases
- Views system analytics and activity logs

### 3. **AI System (Google Gemini)**
- Automated analysis engine
- Provides legal guidance and case analysis
- Assists in chat conversations

---

## Use Cases

### **Authentication & User Management**

#### UC-1: Register Account
- **Actor:** User, Admin
- **Description:** Create a new account with email and password
- **Precondition:** User has valid email
- **Postcondition:** Account created, user can login

#### UC-2: Login
- **Actor:** User, Admin
- **Description:** Authenticate using email and password
- **Precondition:** User has registered account
- **Postcondition:** User authenticated, JWT token issued

#### UC-3: Logout
- **Actor:** User, Admin
- **Description:** End current session
- **Precondition:** User is logged in
- **Postcondition:** Session terminated, tokens cleared

#### UC-4: Update Profile
- **Actor:** User, Admin
- **Description:** Modify personal information
- **Precondition:** User is logged in
- **Postcondition:** Profile information updated

---

### **Case Management**

#### UC-5: Create New Case
- **Actor:** User
- **Description:** File a new case through 7-step wizard
- **Steps:**
  1. Incident Details (what, when, where)
  2. Your Details (complainant information)
  3. Accused Details (opposite party)
  4. Evidence Collection (photos, videos, documents)
  5. Witness Information
  6. Police Status (FIR details)
  7. Crime Type Selection
- **Precondition:** User is logged in
- **Postcondition:** Case created with unique Case ID

#### UC-6: View Case List
- **Actor:** User, Admin
- **Description:** View all cases (own cases for User, all cases for Admin)
- **Precondition:** User is logged in
- **Postcondition:** List of cases displayed

#### UC-7: View Case Details
- **Actor:** User, Admin
- **Description:** View comprehensive case information and analysis
- **Precondition:** Case exists, user has permission
- **Postcondition:** Case details displayed with all 7 analysis sections

#### UC-8: Upload Documents
- **Actor:** User
- **Description:** Add evidence files to existing case
- **Precondition:** Case exists, user owns the case
- **Postcondition:** Document uploaded and linked to case

#### UC-9: Add Comment
- **Actor:** User, Admin
- **Description:** Add notes or updates to case
- **Precondition:** Case exists, user has permission
- **Postcondition:** Comment added to case timeline

#### UC-10: Close Case
- **Actor:** User, Admin
- **Description:** Mark case as closed/resolved
- **Precondition:** Case exists, user has permission
- **Postcondition:** Case status updated to closed

---

### **AI Analysis**

#### UC-11: Analyze Case
- **Actor:** AI System (triggered by User)
- **Description:** Generate comprehensive legal analysis using Google Gemini
- **Analysis Sections:**
  1. **Justice Pathway:** Case summary, keywords, severity
  2. **Police Action Required:** Authorities, jurisdiction, emergency contacts
  3. **FIR Filing Guide:** Viability, legal sections, timeline
  4. **Protection & Safety:** Helplines (112, 181, 1930, 1098)
  5. **Legal Guidance:** Applicable charges, next steps
  6. **Compensation:** CrPC 357A scheme details
  7. **Case Analysis Report:** Confidence scores, evidence priority
- **Precondition:** Case created with sufficient information
- **Postcondition:** AI analysis generated and stored

#### UC-12: Download PDF Report
- **Actor:** User, Admin
- **Description:** Export case analysis as formatted PDF
- **Precondition:** Case has been analyzed
- **Postcondition:** PDF downloaded with all analysis sections

---

### **Chat Assistant**

#### UC-13: Create Chat Session
- **Actor:** User
- **Description:** Start new conversation with AI assistant
- **Precondition:** User is logged in
- **Postcondition:** Chat session created

#### UC-14: Send Message to AI
- **Actor:** User
- **Description:** Ask questions and get AI-powered legal guidance
- **Precondition:** Chat session exists
- **Postcondition:** AI response generated and displayed

#### UC-15: View Chat History
- **Actor:** User
- **Description:** Review previous conversations
- **Precondition:** User has chat sessions
- **Postcondition:** Chat history displayed

---

### **Admin Functions**

#### UC-16: Manage Users
- **Actor:** Admin
- **Description:** View, edit, activate/deactivate user accounts
- **Precondition:** Admin is logged in
- **Postcondition:** User account modified

#### UC-17: View All Cases
- **Actor:** Admin
- **Description:** Access complete case database
- **Precondition:** Admin is logged in
- **Postcondition:** All cases displayed with filters

#### UC-18: Approve Case
- **Actor:** Admin
- **Description:** Review and approve submitted cases
- **Precondition:** Case exists and pending approval
- **Postcondition:** Case status updated to approved

#### UC-19: Delete Case
- **Actor:** Admin
- **Description:** Remove case from system
- **Precondition:** Admin is logged in, case exists
- **Postcondition:** Case permanently deleted

#### UC-20: View Activity Logs
- **Actor:** Admin
- **Description:** Monitor system usage and user activities
- **Precondition:** Admin is logged in
- **Postcondition:** Activity logs displayed with timestamps

#### UC-21: View Dashboard Analytics
- **Actor:** Admin
- **Description:** View system statistics and metrics
- **Metrics:**
  - Total users
  - Total cases
  - Open/Closed cases
  - Recent activity
- **Precondition:** Admin is logged in
- **Postcondition:** Dashboard with analytics displayed

---

## Use Case Relationships

### **Includes:**
- UC-5 (Create Case) **includes** UC-11 (Analyze Case)
- UC-7 (View Case Details) **includes** UC-12 (Download PDF)
- UC-14 (Send Message) **includes** AI response generation

### **Extends:**
- UC-8 (Upload Documents) **extends** UC-5 (Create Case)
- UC-9 (Add Comment) **extends** UC-7 (View Case Details)

### **Generalization:**
- Admin **inherits** all User use cases
- Admin has **additional** management use cases (UC-16 to UC-21)

---

## System Boundaries

**Inside System:**
- User authentication & authorization
- Case management (CRUD operations)
- AI analysis integration
- Chat assistant
- PDF generation
- Admin dashboard

**Outside System:**
- Google Gemini API (external AI service)
- Email services (future: notifications)
- Payment gateway (future: for premium features)
- SMS gateway (future: OTP verification)

---

## Non-Functional Requirements

1. **Security:** JWT-based authentication, role-based access control
2. **Performance:** AI analysis completes within 30 seconds
3. **Usability:** 7-step wizard for easy case creation
4. **Reliability:** 99% uptime for case submissions
5. **Scalability:** Support 10,000+ concurrent users

---

## Use Case Diagram Elements Summary

**Actors (4):**
1. User
2. Admin
3. AI System
4. System (implicit)

**Use Cases (21):**
- Authentication: 4 use cases
- Case Management: 6 use cases
- AI Analysis: 2 use cases
- Chat: 3 use cases
- Admin: 6 use cases

**Relationships:**
- Includes: 3
- Extends: 2
- Generalization: 1 (Admin inherits User)
