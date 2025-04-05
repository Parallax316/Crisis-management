# Crisis Management System

A modern web application for event organizers to manage and respond to crisis situations effectively.

## Overview

The Crisis Management System is a Next.js-based web application designed to help event organizers handle crisis situations efficiently. It provides real-time monitoring, AI-powered risk assessment, and automated alert systems to ensure quick response and effective crisis management.

## Features

- **Event Management**
  - Create and track crisis events
  - Real-time status updates
  - Detailed event information storage

- **AI-Powered Risk Assessment**
  - Automated risk level evaluation
  - Recommended actions generation
  - Impact assessment

- **Real-time Alerts**
  - WebSocket-based alert system
  - Severity-based notifications
  - Automatic alert generation for high-risk situations

- **Dashboard**
  - Real-time event monitoring
  - Risk level visualization
  - Quick access to active crises

- **Modern UI/UX**
  - Dark/Light mode support
  - Responsive design
  - Intuitive navigation

## Tech Stack

- **Frontend**
  - Next.js 15
  - React 19
  - Tailwind CSS
  - Radix UI Components
  - Chart.js for analytics

- **Backend**
  - Next.js API Routes
  - MongoDB Atlas
  - WebSocket for real-time updates

- **AI Integration**
  - OpenRouter API
  - GPT-4 for risk assessment

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- OpenRouter API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crisis-management.git
   cd crisis-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENROUTER_API_KEY=your_openrouter_api_key
   APP_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
crisis-management/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── event/            # Event management
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                  # Utility functions
├── models/              # MongoDB models
└── public/              # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database service
- OpenRouter for AI capabilities
- All contributors and supporters 