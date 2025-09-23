# Development Configuration for Campus Admin App

## Backend Configuration
- **Host**: 127.0.0.1
- **Port**: 5050
- **URL**: http://127.0.0.1:5050
- **Docs**: http://127.0.0.1:5050/docs

## Frontend Configuration  
- **Host**: 127.0.0.1
- **Port**: 8080
- **URL**: http://127.0.0.1:8080

## API Endpoints

### Authentication
- `POST /users/register` - Create new user account
- `POST /users/login` - User login (requires API key)
- `POST /users/reset-password` - Reset user password

### Student Chat
- `POST /students/chat/{thread_id}` - Send message to AI agent

### Analytics
- `GET /analytics/analytics/total-students` - Get total student count
- `GET /analytics/analytics/students-by-department` - Get students grouped by department
- `GET /analytics/analytics/students/recent?limit=5` - Get recent students
- `GET /analytics/analytics/students/active_last_7_days` - Get active students

## Environment Variables Required

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_CONNECTION_STRING=your_mongodb_connection
```

### Frontend
No environment variables needed for development.

## Running the Application

### Backend
```bash
cd backend
python main.py
```

### Frontend
```bash
cd frontend
npm run dev
```

## Features Implemented

### Frontend
✅ **API Service Layer**: Complete API client with error handling
✅ **React Query Integration**: Caching, background updates, optimistic updates
✅ **Authentication**: Login, register, password reset with protected routes
✅ **Real-time Dashboard**: Live data from backend APIs
✅ **AI Chat Interface**: Connected to backend student agent
✅ **Theme System**: Multiple themes with persistent storage
✅ **Responsive Design**: Mobile-friendly interface

### Backend Integration
✅ **CORS Configuration**: Properly configured for frontend communication
✅ **Port Configuration**: Updated to run on port 5050
✅ **Student Management**: AI agent with database operations
✅ **Analytics Endpoints**: Real-time campus statistics
✅ **User Authentication**: JWT tokens with secure password handling

## Testing the Integration

1. **Start Backend**: `cd backend && python main.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Register/Login**: Visit http://127.0.0.1:8080/auth
4. **View Dashboard**: Check real-time analytics
5. **Test Chat**: Interact with AI agent for student management
6. **API Docs**: Visit http://127.0.0.1:5050/docs for API testing