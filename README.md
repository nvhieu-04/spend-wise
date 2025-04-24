# Spend Wise - Smart Financial Management Platform

Spend Wise is a modern financial management application built with the T3 Stack, designed to help users track their spending, manage bank cards, and optimize cashback rewards.

## Tech Stack

- **Frontend**: Next.js 14 with React Server Components
- **Authentication**: NextAuth.js with GitHub OAuth
- **Database**: MongoDB
- **Styling**: Tailwind CSS

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
