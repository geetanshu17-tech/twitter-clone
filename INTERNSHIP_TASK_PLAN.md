# ElevanceSkills Internship Task Planner

## Internship Information

* Intern: Geetanshu
* Project: Twitter / X Clone
* Internship Duration: 27 June 2026 – 28 July 2026
* Tech Stack:

  * Next.js
  * React
  * TypeScript
  * Tailwind CSS
  * Firebase Authentication
  * MongoDB
  * Axios
  * Node.js Backend

---

# Current Project Status

## Completed Features

* User Registration
* User Login
* Google Authentication
* Email Authentication
* Tweet Creation
* Image Upload in Tweets
* User Profile Page
* Profile Update
* Profile Picture Update
* User Posts Display
* Basic Like System
* Basic Repost System
* Premium UI Cards (Frontend Only)

## Known Issues

* Like persistence issue after refresh - done
* Repost persistence issue after refresh - done
* Need complete testing before final deployment

---

# Internship Tasks

---

## Task 1 – Browser Notifications

### Requirements

* Use Browser Notification API
* Trigger notification when tweet contains:

  * cricket
  * science
* Notification should display full tweet content
* User can enable/disable notifications
* Respect user preference at all times

### Implementation Plan

Frontend:

* Notification permission request
* Notification toggle in Profile/Settings
* Keyword detection

Backend:

* Store notification preference in database

Database Fields:

notificationEnabled: true/false

### Status

* [ ] Not Started
* [ ] In Progress
* [ ] Completed

---

## Task 2 – Audio Tweets

### Requirements

* User can upload audio tweets
* OTP verification before upload
* Maximum duration: 5 minutes
* Maximum size: 100 MB
* Upload allowed only between:

  * 2:00 PM IST
  * 7:00 PM IST
* Reject uploads outside limits

### Implementation Plan

Frontend:

* Audio upload UI
* Audio player component
* Duration validation
* File size validation

Backend:

* OTP verification
* Time validation
* Audio storage handling

Database Fields:

audioUrl
audioDuration
audioUploadedAt

### Status

* [ ] Not Started
* [ ] In Progress
* [ ] Completed

---

## Task 3 – Forgot Password

### Requirements

* Dedicated Forgot Password page
* Reset using:

  * Email
  * Phone Number
* Only one reset request per day
* Show warning message if limit exceeded
* Password generator:

  * Uppercase letters
  * Lowercase letters
  * No numbers
  * No special characters

### Implementation Plan

Frontend:

* Forgot Password page
* Password generator UI

Backend:

* Reset request validation
* Daily limit checking

Database Fields:

lastPasswordResetRequest

### Status

* [ ] Not Started
* [ ] In Progress
* [ ] Completed

---

## Task 4 – Subscription Plans

### Requirements

Free Plan:

* 1 Tweet

Bronze Plan:

* ₹100/month
* 3 Tweets

Silver Plan:

* ₹300/month
* 5 Tweets

Gold Plan:

* ₹1000/month
* Unlimited Tweets

Additional Requirements:

* Razorpay or Stripe integration
* Invoice email after payment
* Plan details email
* Payments allowed only:

  * 10:00 AM IST
  * 11:00 AM IST

### Implementation Plan

Frontend:

* Subscription page
* Plan cards
* Upgrade buttons

Backend:

* Payment verification
* Email generation
* Plan validation

Database Fields:

planType
subscriptionStartDate
subscriptionEndDate
paymentHistory

### Status

* [ ] Not Started
* [ ] In Progress
* [ ] Completed

---

## Task 5 – Multi-Language Support

### Requirements

Supported Languages:

* English
* Hindi
* Spanish
* Portuguese
* Chinese
* French

Verification Rules:

French:

* Email OTP

Other Languages:

* Mobile OTP

### Implementation Plan

Frontend:

* Language selector
* Translation setup

Backend:

* OTP verification system

Database Fields:

selectedLanguage

### Status

* [ ] Not Started
* [ ] In Progress
* [ ] Completed

---

## Task 6 – Login History & Security

### Requirements

Store:

* Browser Type
* Operating System
* Device Category
* IP Address
* Login Time

Show login history on profile page

Authentication Rules:

Chrome:

* Email OTP required

Microsoft Browser:

* No OTP required

Mobile Devices:

* Login only allowed between:

  * 10:00 AM IST
  * 1:00 PM IST

### Implementation Plan

Frontend:

* Login history page
* History table

Backend:

* Device detection
* Browser detection
* OTP validation
* Time restriction validation

Database Fields:

browser
operatingSystem
deviceType
ipAddress
loginTime

### Status

* [ ] Not Started
* [ ] In Progress
* [ ] Completed

---

# Development Order

## Phase 1

* Fix Like Persistence Bug
* Fix Repost Persistence Bug
* Project Testing

## Phase 2

* Task 1 – Notifications
* Task 3 – Forgot Password

## Phase 3

* Task 6 – Login History

## Phase 4

* Task 5 – Multi-Language

## Phase 5

* Task 2 – Audio Tweets

## Phase 6

* Task 4 – Subscription System

## Final Phase

* Full Testing
* Mobile Responsiveness Check
* Deployment
* Internship Report
* Final Submission

---

# Submission Checklist

* [ ] All 6 Tasks Completed
* [ ] Existing Bugs Fixed
* [ ] Fully Responsive
* [ ] GitHub Repository Updated
* [ ] Project Deployed
* [ ] Live URL Working
* [ ] Internship Report Completed
* [ ] Final Testing Completed
* [ ] Ready For One-Time Submission

---

# Notes

Do not create separate projects.

All internship tasks must be integrated into the existing Twitter/X Clone application.

Final Submission Deadline:
28 July 2026
