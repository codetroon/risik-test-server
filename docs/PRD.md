# **1. Project Overview**

The Political Analysis CRM is a secure, government-grade web application built for political intelligence and constituency management across two defined states. The platform enforces a strict four-tier role-based access control model, state-level data isolation, and government-grade security, including two-factor authentication for administrators, encrypted data at rest, full audit logging, and brute-force login protection.

***Important!!** No AI services, no third-party cloud platforms, and no off-premise data transmission will be used at any point in this system without the permission of client.*

*In this project, the application system won’t create any analysis or study report by itself instead, it will just project the data given by the users and give accessibility to the users to manage, study, analyze, and compare this information. Only the scenario board will generate an analysis report based on the scoring system and algorithm provided by the client.*

# **2. System Overview**

| **Platform**                | Full stack web application.                                                                                |
|-----------------------------|------------------------------------------------------------------------------------------------------------|
| **Users**                   | Government political analysts, field officers, researchers and system administrator.                       |
| **States Covered**          | Initially the MVP will lauch for two state.                                                                |
| **Deployment**              | Initially on any cloud hosting for pilot testing. After that government-controlled on-premise server only. |
| **Data Confidentiality**    | High – political data, candidate information, electoral analysis.                                          |
| **AI/Third-Party Services** | None – all processing is fully self-contained.                                                             |

# **3. Scope of Work & Feature Breakdown**

## 3.1. Super Admin

### 3.1.1. Dashboard

- View total states, documents, party distribution, candidates, and active users

- View state performance and GIS political map with filtering system

- View candidate performance and campaign risk alerts and scores with the state-based filter.

- View recent activities and recent document uploads.- Delete lecture or course.

### 3.1.2. States

- View state overview map

- Total constituencies, research documents, active candidates, campaign health, political distribution map

- District performance graph with top candidates’ performance list

- Data of top-performing districts and highest risk are, recent documents, and recent activities

### 3.1.3. Analytic

- Seats data—total, strong, competitive, risk momentum

- Party distribution analysis and political performance trend graph

- Constituency risk analysis and top-performing constituency

- State comparison and candidate performance list

- key findings and report card lists

### 3.1.4. GIS political map

- View political GIS map overview with filtering system

- Political strength analysis and hotspot

- Export report

- Strategic district watchlist and candidate overview with GIS insights

- Constituency details overview with graphs and geographic breakdown

- Create alert, export a report, and compare district features.

- Display candidates' profiles with analytics

- Candidate comparison feature with select option

- Show related research documents

- Add another district, comparison and generate report system

- Full interactive GIS map with export feature

- Search and filter filter system for GIS map

### 3.1.5. Candidates’ overview

- Candidates’ overview details

- Import candidates’ (CSV, XLSX)

- Add, edit or delete a new candidate

- Update candidate status

### 3.1.6. Documents

- Upload document and document overview

- Store documents and view the document library with filters

- State-based field assessment pages view with download PDF feature

- Field assessment overview with approve-reject feature

### 3.1.7. Scenario simulator

- Create scenario, scenario overview and run simulation system

- State, party and year-based filter, reset scenario builder

- Year-based baseline scenario overview with duplicate, export and edit feature

- Run a simulation of youth engagement strategy data.

- Save scenario, compare and run again feature

- Compare the scenarios.

### 3.1.8. Users

- Users overview, display, add, edit, delete users.

- Manage user directory

### 3.1.9. Roles & Permissions

- Roles and permission overview with role changes request

- Permission matrix management, Role activity audit view

- Manage role requests

### 3.1.10. System settings

- System health overview with filters (general, security, notifications)

- Site settings and notification management

- View and edit super admin profile

## 3.2. Admin

### 3.2.1. Dashboard

- View statistical overview

### 3.2.2. States

- View state overview map

- Total constituencies, research documents, active candidates, campaign health, political -distribution map

- District performance graph with top candidates’ performance list

- Data of top-performing districts and highest risk are, recent documents, and recent activities

### 3.2.3. Analytics

- Seats data—total, strong, competitive, risk momentum

- Party distribution analysis and political performance trend graph

- Constituency risk analysis and top-performing constituency

- State comparison and candidate performance list

### 3.2.4. GIS political map

- View political GIS map overview with filtering system

- Political strength analysis and hotspot

- Strategic district watchlist and candidate overview with GIS insights

- Constituency details overview with graphs and geographic breakdown

- Create alert, export a report, and compare district features.

- Display candidates' profiles with analytics

- Candidate comparison feature with select option

- Show related research documents

- Add another district, comparison and generate report system

- Full interactive GIS map

- Export feature for GIS report

- Search and filter filter system for GIS map

### 3.2.5. Candidates’ overview

- Candidates’ overview details

- Import candidates’ (CSV, XLSX)

- Add, edit or delete a new candidate

- Candidate profile

- Update candidate status

### 3.2.6. Documents

- Upload document and document overview

- Store documents and view the document library with filters

- State-based field assessment pages view with download PDF feature

- Field assessment overview with approve-reject feature

### 3.2.7. Scenario simulator

- Create scenario, scenario overview and run simulation system

- State, party and year-based filter; reset scenario builder

- Year-based baseline scenario overview with duplicate, export and edit feature

- Run a simulation of youth engagement strategy data.

- Save scenario, compare and run again feature

- Compare the scenarios.

### 3.2.8. Users

- Users overview, display, add, edit, and delete users.

- Manage user directory

## 3.3. Officer

### **3.3.1. Dashboard**

- Can view total uploaded, pending, approved and rejected report

- Can view field activity map and recent activity track

- Can view recent documents and area coverage graphs

### **3.3.2. Candidates**

- Detailed candidates overview and compare

- Can check and update candidates’ GIS political map and overall information

### **3.3.3. Documents**

- Can upload documents and check overall document information

- Download, view and update the uploaded documents

- Manage the document library with filter system

- Extract full document, download and share field assessment report

### **3.3.4. Profile**

- Can view and update profile information

## 3.4. Researcher

### **3.4.1. Dashboard**

- Overview and statistics of data and possible export option

### **3.4.2. States**

- View state overview map

- Total constituencies, research documents, active candidates, campaign health, political distribution map

- District performance graph with top candidates’ performance list

- Data of top-performing districts and highest risk are, recent documents, and recent activities

### **3.4.3. Analytics**

- Seats data—total, strong, competitive, risk momentum

- Party distribution analysis and political performance trend graph

- Constituency risk analysis and top-performing constituency

- State comparison and candidate performance list

### **3.4.4. GIS political map**

- View political GIS map overview with filtering system

- Political strength analysis and hotspot

- Strategic district watchlist and candidate overview with GIS insights

- Constituency details overview with graphs and geographic breakdown

- Display candidates' profiles with analytics

- Candidate comparison feature with select option

- Show related research documents

- District comparison and generate report

- Full interactive GIS map with export feature

- Search and filter filter system for GIS map

### **3.4.5. Candidates’ overview**

- Candidates’ overview details

- Import candidates’ (CSV, XLSX)

- Add, edit or delete a new candidate and update candidate status

- Candidate profile

### **3.4.6. Documents**

- Upload document and document overview

- Store documents and view the document library with filters

- State-based field assessment pages view with download feature

- Field assessment overview with approve-reject feature

### **3.3.4. Profile**

- Can view and update profile information

## 3.5. Non-functional requirement

### 3.5.1. Security

- All sessions expire automatically after a configurable period of inactivity.

- Passwords are securely hashed and password reset is handled exclusively through a time-limited emailed link.

- Hybrid access control (Role based + Attribute based) is enforced at both the interface and API level for every module

- Every administrative action—user changes, role changes, candidate edits, document approvals—is written to an audit log

- Login attempts are rate-limited to prevent brute-force attacks

### 3.5.2. Compatibility

- Full support for the latest versions of Chrome, Firefox, Edge, and Safari

- Desktop-first responsive design, fully usable on tablet-sized screens
