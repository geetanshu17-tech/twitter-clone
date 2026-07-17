# X (Twitter) Clone - Full Stack 

A modern, full-stack social media web application inspired by X (formerly Twitter). Built to demonstrate seamless media sharing, dynamic state management, secure authentication, and complex backend time/device constraints.

## ✨ Features

* **Tweet Composer & Media:** A robust composer featuring real-time character counting, image uploading via ImgBB API, and **Audio Voice Notes** (with strict 5-min/100MB limits and time-gated upload windows).
* **Advanced Authentication & Security:** Secure user sessions powered by Firebase and JWT. Includes a custom **Forgot Password** system with daily limits and an auto-generated secure password sync.
* **Smart Notifications:** Real-time browser notifications triggered by backend keyword detection (e.g., alerting users when "cricket" or "science" is mentioned).
* **Premium Subscriptions:** Integrated **Razorpay** payment gateway for 4 subscription tiers (Free, Bronze, Silver, Gold) that govern posting limits, complete with automated Nodemailer email invoices.
* **Multi-Language Support (i18n):** Supports 6 different languages, securely gated behind Email (for French) and Mobile OTP verification before users can switch preferences.
* **Login History & Device Tracking:** Captures user agent, OS, and IP address. Implements strict security rules, such as requiring OTPs for specific browsers (Chrome) and time-restricting mobile access to specific hours.

## 🛠️ Tech Stack

**Frontend:**
* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Localization:** `react-i18next`
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** Axios
* **imgbb: ** for images of profile (its api)

**Backend & Database:**
* **Runtime:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) & Mongoose
* **Auth & User Management:** [Firebase Admin SDK](https://firebase.google.com/)
* **Payments:** [Razorpay API](https://razorpay.com/)
* **Utilities:** Multer (Audio uploads), Nodemailer (Emails), ua-parser-js (Device parsing)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```

### 2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Navigate to your backend directory and install
cd backend 
npm install
```

### 3. Set up Environment Variables
Create .env.local in your frontend root, and .env in your backend root. Ensure these are added to your .gitignore.
Frontend (.env.local):

```bash
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_id
NEXT_PUBLIC_API_URL=http://localhost:5000 # Your backend URL
```

Backend (.env):

```bash
PORT=5000
MONOGDB_URL=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

### 4. Run the development servers
Open two terminal windows:

```bash
# Terminal 1: Start the Express Backend
cd backend
npm run start (or node index.js)

# Terminal 2: Start the Next.js Frontend
npm run dev
```
Open http://localhost:3000 with your browser to see the result.

## 🔒 Security Note
firebase.tsx and firebaseServiceAccount.json are strictly excluded from this repository due to privacy concerns and security best practices.

## 🌐 Live Website Demo
Frontend: https://twitter-clone-beta-eosin.vercel.app/
Backend API: [Insert your deployed backend URL here]