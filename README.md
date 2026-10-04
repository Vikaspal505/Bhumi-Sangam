# Bhumi Sangam - GeoCadAI Enterprise Platform

**Live Demo:** [https://YOUR-VERCEL-URL.vercel.app](https://YOUR-VERCEL-URL.vercel.app)

> **Urban Land Administration and Cadastral Management System (SIH 2026 - PS 26013)**
> An AI-enabled geospatial integration platform designed to automatically integrate, harmonize, validate, and synchronize multi-source land-related datasets with AI-generated feature extraction outputs.

## 📸 Screenshots

*Placeholders for UI showcases*
- ![Dashboard](/docs/screenshots/dashboard.png)
- ![Dispute Center](/docs/screenshots/dispute-center.svg)
- ![Change Detection](/docs/screenshots/change-detection.svg)
- ![Citizen Registry](/docs/screenshots/citizen-registry.svg)

## 📖 Background
Under modern land governance programs (such as the NAKSHA Programme), large volumes of geospatial data are generated through drone surveys, Orthorectified Imagery (ORI), DSM/DTM datasets, Ground Truthing (GT), GNSS surveys, municipal records, utility databases, and revenue land records. Harmonization and integration of these datasets currently depend on manual GIS workflows, which are time-consuming and prone to errors.

**Bhumi Sangam** introduces an intelligent system capable of automatically integrating and synchronizing multi-source geospatial datasets to reduce manual GIS integration efforts, improve accuracy, and accelerate cadastral finalization processes.

---

## 🗺️ How it maps to the problem statement (PS 26013)

| Required Capability | Implementation Status | Core File / Module |
| :--- | :--- | :--- |
| **Spatial Matching** | ✅ Implemented | `src/pages/MapWorkspacePage.tsx` / `PipelinePage.tsx` |
| **Topology Correction** | ✅ Implemented | `src/pages/TopologyPage.tsx` |
| **Attribute Mapping** | ✅ Implemented | `src/pages/DataSourcesPage.tsx` |
| **Georeferencing** | ✅ Implemented | `src/components/map/LeafletMapView.tsx` |
| **Change Detection** | ✅ Implemented | `src/pages/ChangeDetectionPage.tsx` |
| **Conflict Resolution** | ✅ Implemented | `src/pages/ConflictCenterPage.tsx` |
| **Confidence Scoring** | ✅ Implemented | `src/pages/ConfidenceScoringPage.tsx` |

---

## 🏗️ Architecture & Roles
The application leverages role-based access control (RBAC) to ensure seamless inter-departmental spatial data exchange and interoperability of urban land information systems.

### Roles
1. **System Admin**: Complete overview of the harmonization pipeline, server logs, and data ingestion configurations.
2. **Revenue Officer**: Access to mutation trackers, dispute resolution (Conflict Center), and analytics.
3. **Field Surveyor**: Access to GNSS rover tasks, topology checking, and field ground-truthing forms.
4. **Public Viewer (Citizen Open Registry)**: Transparent, read-only access to finalized land governance data and public search.

### Demo Credentials
*If the app has seeded test logins, use the following:*
- **Admin**: `admin@bhumisangam.gov.in` (Password: `demo123`)
- **Revenue Officer**: `officer@bhumisangam.gov.in` (Password: `demo123`)
- **Field Surveyor**: `surveyor@bhumisangam.gov.in` (Password: `demo123`)
- **Citizen**: `citizen@bhumisangam.gov.in` (Password: `demo123`)

---

## 💻 Tech Stack

### Implemented (prototype)
*These technologies are actively used in the current prototype:*
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion, Lucide React
- **GIS / Mapping**: Leaflet, React-Leaflet
- **Data Visualization**: Recharts
- **Backend / APIs**: Node.js, Express
- **Cloud / Auth / DB**: Firebase Auth, Firebase Firestore
- **AI Integration**: Google GenAI SDK (`@google/genai`)

### Production roadmap
*These technologies are planned for the production deployment (Not yet implemented):*
- **Database**: PostGIS (for advanced spatial querying)
- **Backend**: FastAPI (Python-based GIS processing)
- **AI Models**: U-Net/SAM building extraction
- **Matching**: XGBoost parcel matching algorithms
- **Pipeline**: Airflow ETL

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- `npm`

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vikaspal505/Bhumi-Sangam.git
   cd Bhumi-Sangam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on the provided `.env.example` file and populate it with your Firebase and API configurations. (Ensure your Gemini API key is kept secure server-side).

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   *This starts the Express server alongside the Vite frontend utilizing `tsx`.*

5. **Build for Production**
   ```bash
   npm run build
   ```
