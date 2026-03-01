# MITS LMS Platform

A production-ready Learning Management System built for the Madras Institute of Tourism Studies (MITS).

## Architecture

*   **Frontend:** React 19, Vite, Tailwind CSS v4, React Router
*   **Backend:** Supabase (PostgreSQL, Authentication, Storage)
*   **Mobile App Wrapper:** Capacitor (for Android APK generation)
*   **UI/Icons:** Lucide React

## Project Structure

*   `src/components/admin`: Admin-specific layouts and sidebars.
*   `src/components/student`: Mobile-first layouts for the student interface.
*   `src/components/ui`: Shared reusable UI components (Buttons, Inputs).
*   `src/contexts`: React Context (AuthContext for Supabase authentication state).
*   `src/pages/admin`: Admin panel views (Dashboard, Batches, Subjects, etc.).
*   `src/pages/student`: Student mobile-first views (Dashboard, Profile, Unit Content).
*   `src/pages/auth`: Login and Registration forms.
*   `src/lib`: Supabase client and utility functions.

## Initial Setup & Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```

3.  **Supabase Database Setup:**
    Open the file `supabase_setup.md` in the root folder. Copy the SQL script inside and execute it in your Supabase project's SQL Editor. This will create all the necessary tables, relationships, and Row Level Security (RLS) policies.

4.  **Supabase Storage Setup:**
    *   Go to **Storage** in your Supabase dashboard.
    *   Create a new public bucket named `mits-materials`.

5.  **Create an Admin User:**
    *   Register a new user via the app `/register`.
    *   Go to your Supabase **SQL Editor** and run:
        ```sql
        UPDATE public.students SET role = 'admin', approved = true, batch_id = null WHERE email = 'your_admin_email@example.com';
        ```

6.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## Deployment (Web Admin Panel)

The React web app is optimized to be deployed to **Vercel**, **Netlify**, or **Render**.

**Vercel Deployment:**
1. Push your code to a GitHub repository.
2. Go to Vercel and import the repository.
3. In the Environment Variables section, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy**. Vercel will automatically detect Vite and run `npm run build`.

---

## Android Mobile App Build (Capacitor)

We use Capacitor to wrap the web app into a native Android application for students.

**Prerequisites:**
*   Android Studio installed.
*   Java SDK (Command Line Tools).

**Build Steps:**

1.  **Build the Production Web Assets:**
    ```bash
    npm run build
    ```
    This generates the `/dist` folder containing optimized HTML/JS/CSS.

2.  **Sync Assets to Android Project:**
    ```bash
    npx cap sync android
    ```

3.  **Open in Android Studio:**
    ```bash
    npx cap open android
    ```
    
4.  **Generate APK:**
    *   In Android Studio, wait for Gradle sync to complete.
    *   Go to **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**.
    *   Once complete, locate the APK to distribute to students.

> **Note:** Whenever you make changes to the React code, you must run `npm run build` followed by `npx cap sync android` to update the native app bundle.

## Security Overview
*   **Row Level Security (RLS):** All database tables are protected.
    *   Admins have root access (`is_admin()` function).
    *   Students can only READ content associated with their assigned `batch_id`, and ONLY if they are `approved=true`.
*   **Route Protection:** Standard React Router guards redirect unauthorized users (`/admin` restricts to admins; `/student` restricts to students).
