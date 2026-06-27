# X (Twitter) Clone

A modern, full-stack social media web application inspired by X (formerly Twitter). Built to demonstrate seamless media sharing, dynamic state management, and a highly responsive user interface.

## ✨ Features

* **Tweet Composer:** A robust composer featuring real-time character counting with visual SVG progress indicators (changing colors as the limit approaches).
* **Media Uploads:** Seamless image uploading integrated with the ImgBB API, including live image previews before posting.
* **Authentication & Database:** Secure user sessions and data management powered by Firebase.
* **Modern UI/UX:** Clean, dark-mode optimized interface built with Tailwind CSS and Lucide React icons.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Backend / Auth:** [Firebase](https://firebase.google.com/)
* **Image Hosting:** [ImgBB API](https://api.imgbb.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** Axios

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
```

### 2. Install dependencies 
```bash
npm install
# or
yarn install
```

### 3. Set up Environment Variables
Create a .env.local file in the root directory and add your API keys. Make sure your .gitignore is configured to ignore this file!

```bash
# ImgBB API Key
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here

# Firebase Config (Add your specific keys here)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
```
Open http://localhost:3000 with your browser to see the result.
