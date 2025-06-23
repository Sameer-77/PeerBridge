# PeerBridge
PeerBridge - AI-powered peer learning platform matching students with ideal mentors. Features: real-time chat with markdown, doubt tracking, gamified rewards, priority tagging, progress analytics, and image uploads. Built with React, Node.js, MongoDB, and Gemini AI.




# PeerBridge - AI-Powered Peer Learning Platform

## Overview
PeerBridge is a modern peer-to-peer learning platform that connects students ("Juniors") with mentors ("Seniors") using AI-powered matching. The platform facilitates knowledge sharing through doubt posting, real-time communication, and gamified learning experiences.

## Key Features
- **AI-Powered Matching**: Gemini AI analyzes doubts and matches them with suitable mentors
- **Real-time Chat**: Built-in messaging with markdown support
- **Gamification**: Earn points, badges, and recognition for contributions
- **Rich Doubt Posts**: Support for text, code snippets, and image uploads
- **Progress Tracking**: Detailed analytics on learning progress
- **Knowledge Base**: Searchable repository of resolved doubts

## Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Real-time**: Socket.io
- **AI**: Gemini API for doubt analysis
- **Authentication**: JWT
- **UI Components**: Lucide React icons

## Pages & Functionality
1. **Home**: Landing page with features overview
2. **Dashboard**: Central hub for doubts and stats
3. **Doubt Posting**: Form with rich editing capabilities
4. **Doubt Details**: Thread view with responses and voting
5. **Messages**: Real-time chat interface
6. **Profile**: User information and achievements

## Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm start`

## System Design
- Role-based access control (Junior/Senior)
- Optimistic UI updates for responsive interactions
- Dark/light mode support
- Mobile-responsive design
- Form validation and error handling

## Future Enhancements
- Video call integration for live tutoring
- AI-generated doubt summaries
- Skill-based matching algorithms
- Cross-platform mobile app

PeerBridge aims to transform traditional learning by creating an engaging, AI-enhanced community where knowledge flows freely between peers.
