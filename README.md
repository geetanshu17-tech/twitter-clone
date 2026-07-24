# X (Twitter) Clone - Full Stack 🚀

A modern, full-stack social media web application inspired by X (formerly Twitter). Built to demonstrate rich content formats, multi-tier subscription models, dynamic localization, real-time browser notifications, and strict backend device and time-based security constraints.

---

## 📋 Table of Contents
- [✨ Core Features & Requirements](#-core-features--requirements)
- [⏰ Evaluator Time Window Matrix](#-evaluator-time-window-matrix)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [🌐 Live Demo](#-live-demo)

---

## ✨ Core Features & Requirements

### 1. 🔔 Browser Push Notifications (Keyword Detection)
* **Keyword Detection Engine:** The backend monitors tweet content for specific keywords (`"cricket"` or `"science"`).
* **Native Web Notification API:** Triggers native browser/OS popup notifications displaying the full tweet text in real time.
* **User Control:** Users can toggle browser notifications on or off directly from their Profile settings page at any time.

### 2. 🎙️ Secure Audio Tweets
* **Voice Recording & Uploads:** Allows users to record or attach voice notes directly to their tweets.
* **Strict Media Limits:** Enforces a maximum duration limit of **5 minutes** and a file size cap of **100 MB**.
* **Email OTP Verification:** Requires a 6-digit email OTP verification step prior to publishing any audio tweet.
* **Time Restricted:** Audio tweet uploads are strictly gated between **2:00 PM and 7:00 PM IST**.

### 3. 🔑 Account Recovery (Forgot Password)
* **Dual Lookup Support:** Users can initiate password recovery using either their registered **email address** or **phone number**.
* **Daily Rate Limiting:** Enforces a strict limit of **1 reset attempt per calendar day**, displaying the error *"You can use this option only one time per day"* on additional attempts.
* **Letters-Only Password Generator:** Automatically generates temporary passwords consisting strictly of **uppercase and lowercase letters** (`a-z`, `A-Z`), explicitly excluding numbers and special characters.

### 4. 💳 Tiered Subscriptions & Payment Engine
* **Razorpay Payment Gateway:** Integrated payment processing for plan upgrades.
* **Tiered Posting Limits:**
  * **Free Plan:** 1 tweet total.
  * **Bronze Plan (₹100/mo):** Up to 3 tweets.
  * **Silver Plan (₹300/mo):** Up to 5 tweets.
  * **Gold Plan (₹1000/mo):** Unlimited tweeting.
* **Automated Invoices:** Generates and emails an HTML invoice containing plan details immediately following successful payment.
* **Time Restricted:** Subscription checkout is active only between **10:00 AM and 11:00 AM IST**.

### 5. 🌐 Localization (i18n) & Dual OTP Verification
* **Supported Languages:** English, Spanish, Hindi, Portuguese, Chinese, and French.
* **French Security (Email OTP):** Switching language to French requires **Email OTP** verification.
* **Other Languages Security (SMS OTP):** Switching to any other non-English language requires **Mobile SMS OTP (Twilio)** verification.

### 6. 🛡️ Login History & Environment Security Rules
* **Session Metadata Tracking:** Captures and displays browser, operating system, device category (desktop/laptop/mobile), and IP address in the user's Profile security tab.
* **Browser Authentication Rules:**
  * **Google Chrome:** Mandates 6-digit Email OTP verification during authentication.
  * **Microsoft Edge:** Bypasses OTP verification for password-only login.
* **Mobile Time Lockout:** Access from mobile device browsers is restricted to **10:00 AM – 1:00 PM IST**.

---

## ⏰ Evaluator Time Window Matrix

To assist evaluators in testing time-restricted features, refer to the schedule below (all times in **IST / UTC+5:30**):

| Feature | Allowed Time Window (IST) | Outside Window Behavior |
| :--- | :--- | :--- |
| **Mobile Access** | `10:00 AM – 1:00 PM IST` | Blocked with `403 Forbidden` response |
| **Razorpay Payments** | `10:00 AM – 11:00 AM IST` | Checkout initiation blocked with restriction alert |
| **Audio Tweet Uploads** | `2:00 PM – 7:00 PM IST` | Upload rejected prior to OTP dispatch |

---

## 🛠️ Tech Stack

**Frontend:**
* **Framework:** [Next.js](https://nextjs.org/) (React 18 / App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
* **Localization:** `i18next` & `react-i18next`
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** Axios

**Backend & Database:**
* **Runtime:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) & Mongoose ODM
* **Authentication:** Firebase Admin SDK & Custom JWT
* **Payments:** [Razorpay API](https://razorpay.com/)
* **Media Storage:** Cloudinary (Audio) & ImgBB (Images)
* **Communications:** Nodemailer / Google Apps Script (Email OTPs & Invoices) & Twilio API (SMS OTPs)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/geetanshu17-tech/twitter-clone.git](https://github.com/geetanshu17-tech/twitter-clone.git)
cd twitter-clone
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
NEXT_PUBLIC_API_URL=[https://twitter-clone-24tp.onrender.com](https://twitter-clone-24tp.onrender.com)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_id
```

Backend (.env):

```bash
PORT=5000
MONOGDB_URL=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_SCRIPT_URL=your_google_apps_script_web_app_url
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
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
Frontend Application: https://twitter-clone-beta-eosin.vercel.app/

Backend API Endpoint: https://twitter-clone-24tp.onrender.com
