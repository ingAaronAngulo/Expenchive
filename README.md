# Expenchive - Personal Expense Tracking App

A comprehensive personal finance tracking application built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

- **Multi-user authentication** - Email/Password + Google Sign-in
- **Expense tracking** - Track both debit and credit expenses with installment support
- **Credit card management** - Monitor credit card debt and balances
- **Investment tracking** - Track investments with expected return calculations
- **Account management** - Manage bank accounts and cash
- **Recurring expenses** - Auto-create recurring expenses (via Cloud Functions)
- **Visual insights** - Category breakdown and money vs debt charts
- **Auto debt reduction** - Monthly installment debt reduction (via Cloud Functions)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account and project
- Firebase CLI: `npm install -g firebase-tools`

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google
4. Create Firestore Database:
   - Go to Firestore Database > Create database
   - Start in **production mode**
   - Choose a location
5. Get your Firebase config:
   - Go to Project Settings > Your apps
   - Click "Web app" and register your app
   - Copy the config credentials

### 2. Local Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Firebase credentials
nano .env.local
```

Add your Firebase credentials to `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy Firestore Rules and Indexes

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Use existing firestore.rules and firestore.indexes.json
# - Choose your project

# Deploy security rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # AppLayout, Sidebar, Header
│   ├── auth/             # Login, Signup forms
│   ├── accounts/         # Account management components
│   ├── expenses/         # Expense management components
│   ├── credit-cards/     # Credit card components
│   ├── investments/      # Investment components
│   ├── dashboard/        # Dashboard charts and summary
│   └── common/           # Shared components
├── config/
│   └── firebase.ts       # Firebase initialization
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── services/             # Firestore CRUD services
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
└── utils/                # Utilities and helpers
```

## Implementation Status

### ✅ Completed (Phase 1-2)
- [x] Project setup with Vite, React, TypeScript
- [x] Tailwind CSS and shadcn/ui configuration
- [x] Firebase configuration
- [x] TypeScript type definitions
- [x] All Firestore services
- [x] Utility functions (calculations, formatters, etc.)
- [x] Authentication system (login, signup, Google sign-in)
- [x] Layout and routing
- [x] Firestore security rules

### 🔨 In Progress (Phase 3-10)
- [ ] Accounts feature (CRUD)
- [ ] Expenses feature (CRUD with installments)
- [ ] Credit Cards feature (CRUD with debt tracking)
- [ ] Investments feature (CRUD)
- [ ] Dashboard with charts
- [ ] Recurring expenses UI
- [ ] Cloud Functions (recurring expenses, debt reduction)
- [ ] Polish and testing

## Next Steps

### Phase 3: Implement Accounts Feature
1. Create hooks: `useAccounts.ts`
2. Build components:
   - `AccountsList.tsx`
   - `AddAccountDialog.tsx`
   - `EditAccountDialog.tsx`
3. Update `Accounts.tsx` page
4. Test CRUD operations

### Phase 4: Implement Expenses Feature
1. Create hooks: `useExpenses.ts`
2. Build components:
   - `ExpensesList.tsx`
   - `AddExpenseDialog.tsx` (complex form with installments)
   - `EditExpenseDialog.tsx`
   - `ExpenseFilters.tsx`
3. Update `Expenses.tsx` page

### Phase 5-10: Continue with remaining features

See the implementation plan for detailed phase breakdown.

## Cloud Functions (Phase 9)

Cloud Functions will handle:
1. **Daily**: Create recurring expenses when due
2. **Monthly**: Reduce installment debt automatically

To implement:

```bash
# Initialize functions
firebase init functions

# Choose TypeScript
# Install dependencies

# Implement functions in functions/src/
# Deploy
firebase deploy --only functions
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Environment Variables

Never commit `.env.local` to version control. It contains sensitive Firebase credentials.

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT
