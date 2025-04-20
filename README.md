# Spend Wise - Smart Financial Management Platform

Spend Wise is a modern financial management application built with the T3 Stack, designed to help users track their spending, manage bank cards, and optimize cashback rewards.

## Tech Stack

- **Frontend**: Next.js 14 with React Server Components
- **Authentication**: NextAuth.js with GitHub OAuth
- **Database**: MySQL with Prisma ORM
- **Styling**: Tailwind CSS
- **API Layer**: tRPC for type-safe API endpoints
- **Deployment**: Vercel (recommended)

## Features

### User Management
- Secure authentication with GitHub OAuth
- User profile management
- Email verification support

### Bank Card Management
- Add and manage multiple bank cards
- Track card details including:
  - Card name and last 4 digits
  - Bank name
  - Card type
  - Credit limit (for credit cards)

### Transaction Tracking
- Record and categorize transactions
- Track spending by merchant
- Support for multiple currencies
- Transaction history with date filtering

### Cashback Optimization
- Define cashback policies per card and category
- Set custom cashback percentages
- Configure maximum cashback limits
- Automatic cashback calculation for transactions

### Category Management
- Create and manage spending categories
- Associate transactions with categories
- Link categories to cashback policies

## Database Schema

The application uses a MySQL database with the following main entities:

### User
- Basic user information (name, email, profile image)
- Authentication details
- One-to-many relationship with bank cards

### BankCard
- Card details (name, last 4 digits, bank, type)
- Credit limit information
- One-to-many relationships with transactions and cashback policies

### Transaction
- Transaction details (amount, currency, date)
- Merchant information
- Category association
- Cashback earned
- Links to bank card

### CashbackPolicy
- Card-specific cashback rules
- Category-based cashback percentages
- Maximum cashback limits
- Links to both card and category

### Category
- Spending categories
- Optional descriptions
- Links to transactions and cashback policies

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your database connection in `.env`
5. Run the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The application provides a comprehensive set of API endpoints for:

- User management (`/api/user`)
- Bank card operations (`/api/card`)
- Transaction tracking (`/api/transaction`)
- Cashback policy management (`/api/cashback`)
- Category management (`/api/category`)

All endpoints are type-safe using tRPC and require authentication.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
