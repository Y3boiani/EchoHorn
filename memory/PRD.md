# Echohorn - Book a Trial Flow PRD

## Original Problem Statement
Front-end only job using Next.js with Tailwind to create a "Book a Trial" button flow:
- Button leads to a user type selection page (Consumer vs Truck Driver/Fleet Owner)
- Consumer selection opens a new tab with registration form and returning customer login
- Fleet owner selection opens a separate new tab with multi-step registration
- Both pages have contrasting themes (light vs dark) with theme toggle functionality

## User Personas
1. **Consumer** - Looking to book delivery services, needs simple registration
2. **Truck Driver/Fleet Owner** - Professional operators wanting to register their fleet and vehicles

## Core Requirements (Static)
- ✅ User type selection page at /get-started
- ✅ Consumer portal with light theme (amber/yellow aesthetic)
- ✅ Fleet portal with dark theme (dark with orange accents)
- ✅ Both portals open in new tabs (target="_blank")
- ✅ Theme toggle (dark/light mode) on both portals
- ✅ Consumer form: Name, Email, Phone, Address, Preferred Trial Date
- ✅ Fleet multi-step form: Driver Info → Company Details → Vehicle Details
- ✅ Login tabs for returning users on both portals

## What's Been Implemented (Jan 2026)

### Pages Created
1. `/get-started` - User type selection with animated cards
2. `/consumer` - Consumer registration portal (light theme default)
3. `/fleet-portal` - Fleet owner registration portal (dark theme default)

### Components Created
- `UserTypeSelection.tsx` - Selection page with Consumer/Fleet Owner cards
- `ConsumerPortal.tsx` - Consumer registration with tabs and theme toggle
- `FleetPortal.tsx` - Multi-step fleet registration with theme toggle

### Features Implemented
- Header "Book A Trial" button → /get-started page
- Cards open respective portals in new tabs
- Consumer form validation
- Fleet 3-step registration flow with validation
- Dark/light mode toggles on both portals
- Framer Motion animations throughout
- Responsive design

### Tech Stack
- Next.js 16 with App Router
- Tailwind CSS 4
- Framer Motion for animations
- React Icons (FA6)
- Google Fonts (Orbitron, Poppins, Inter, Rajdhani)

## Prioritized Backlog
### P0 (Critical) - DONE
- All core features implemented

### P1 (Important)
- Backend integration for form submissions
- Email verification for registrations
- User authentication system

### P2 (Nice to have)
- Password recovery flow
- Social login options
- Profile management dashboard

## Next Tasks
1. Connect forms to real backend APIs
2. Implement authentication flow
3. Add email verification
4. Create user dashboards after login
