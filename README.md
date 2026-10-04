# Bhumi Sangam - GeoCadAI Enterprise Platform

> **Urban Land Administration and Cadastral Management System**
> An AI-enabled geospatial integration platform designed to automatically integrate, harmonize, validate, and synchronize multi-source land-related datasets with AI-generated feature extraction outputs.

## 📖 Background
Under modern land governance programs (such as the NAKSHA Programme), large volumes of geospatial data are generated through drone surveys, Orthorectified Imagery (ORI), DSM/DTM datasets, Ground Truthing (GT), GNSS surveys, municipal records, utility databases, and revenue land records. Harmonization and integration of these datasets currently depend on manual GIS workflows, which are time-consuming and prone to errors.

**Bhumi Sangam** introduces an intelligent system capable of automatically integrating and synchronizing multi-source geospatial datasets to reduce manual GIS integration efforts, improve accuracy, and accelerate cadastral finalization processes.

---

## ✨ Features

### 1. Multi-Source Dataset Integration
The platform supports the seamless ingestion and visualization of 10 disparate data streams:
- Drone imagery
- Orthorectified Imagery (ORI)
- DSM/DTM datasets
- Existing cadastral maps
- Revenue records
- Municipal GIS layers
- Utility network data
- Ground Truthing (GT) datasets
- GNSS/CORS survey data
- Building footprint datasets

### 2. Core Geospatial & AI Capabilities
- **AI/ML-based Spatial Matching Algorithms**: Automated harmonization pipelines mapping various datasets seamlessly.
- **Automated Topology Correction**: Topology and planar rules checking to resolve gaps, overlaps, and slivers.
- **Bi-Temporal Change Detection**: Change detection mechanisms tracking mutations over time using historical and current datasets.
- **Spatial Conflict Resolution Framework**: A dedicated Dispute Arbitration Center to address spatial mismatch between multi-departmental layers.
- **Confidence Scoring**: ISO 19157 quality scoring for integrated outputs, ensuring high trust in cadastral boundaries.
- **Intelligent Attribute Mapping**: Metadata matching across disparate schema standardizations.
- **Georeferencing & Coordinate Transformation**: Unified projection standards ensuring all ingested data falls into a unified geodetic datum (e.g., EPSG:4326).

---

## 🏗️ Architecture & Roles
The application leverages role-based access control (RBAC) to ensure seamless inter-departmental spatial data exchange and interoperability of urban land information systems.

- **System Admin**: Complete overview and engine controls.
- **Revenue Officer**: Access to mutation trackers, dispute resolution, and analytics.
- **Field Surveyor**: Access to GNSS rover tasks, topology checking, and field ground-truthing.
- **Public Viewer (Citizen Open Registry)**: Transparent access to finalized land governance data.

---

## 💻 Tech Stack
- **Frontend Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion (for animations), Lucide React (Icons)
- **GIS / Mapping**: Leaflet, React-Leaflet
- **Data Visualization**: Recharts
- **Backend / APIs**: Node.js, Express (via `tsx`)
- **Cloud / Auth**: Firebase Auth, Firestore
- **AI Integration**: Google GenAI SDK (`@google/genai`)

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- `npm` or `yarn` or `bun`

### Installation Steps

1. **Clone the repository** (if not already cloned)
   ```bash
   git clone <your-repo-url>
   cd BhuSetu-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on the provided `.env.example` file and populate it with your Firebase and API configurations.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   *This starts the Express server alongside the Vite frontend utilizing `tsx`.*

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## 🎯 Expected Outcomes
- **Reduced Manual Effort**: Minimizes manual GIS digitization and integration work.
- **High Accuracy**: Improves consistency of urban land records through AI validation.
- **Interoperability**: Standardized outputs (GeoJSON, KML) enable robust cross-department data exchange.
- **Standardized Governance**: Supports robust digital land governance matching NAKSHA guidelines.
