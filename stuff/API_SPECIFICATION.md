# Project Beacon - API Specification

## Overview

RESTful API design for Project Beacon using OpenAPI 3.0 specification. The API follows REST principles with clear resource-based URLs, standard HTTP methods, and consistent response formats.

## Base Information

- **Base URL**: `https://api.projectbeacon.org/v1`
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **API Version**: `v1`

## Authentication

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "role": "user|volunteer|partner|admin",
  "wallet": "0x...",
  "iat": 1234567890,
  "exp": 1234568790
}
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "deviceId": "unique-device-identifier",
  "deviceType": "ios|android",
  "preferredLanguage": "en"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "uniqueIdentifier": "QR-code-string",
      "walletAddress": "0x...",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 900
    }
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "uniqueIdentifier": "QR-code-string",
  "deviceId": "unique-device-identifier"
}

Response: Same as register
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer {refresh-token}

Response:
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "expiresIn": 900
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": null
}
```

### User Management Endpoints

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "uniqueIdentifier": "QR-code-string",
    "walletAddress": "0x...",
    "profileImageUrl": "https://...",
    "preferredLanguage": "en",
    "privacySettings": {
      "dataSharing": false,
      "locationTracking": false
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "lastSeenAt": "2024-01-01T12:00:00Z"
  }
}
```

#### Update User Profile
```http
PUT /users/profile
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "profileImageUrl": "https://...",
  "preferredLanguage": "es",
  "privacySettings": {
    "dataSharing": true,
    "locationTracking": false
  }
}

Response: Updated user profile object
```

#### Get User Statistics
```http
GET /users/stats
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "totalEarned": 125.50,
    "totalSpent": 75.25,
    "activitiesCompleted": 15,
    "daysActive": 30,
    "currentStreak": 7,
    "longestStreak": 12,
    "rank": "Helper", // Gamification level
    "nextRankProgress": 0.75
  }
}
```

### Wallet Endpoints

#### Get Wallet Balance
```http
GET /wallet/balance
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "balance": 50.25,
    "lockedBalance": 2.00,
    "totalEarned": 125.50,
    "totalSpent": 75.25,
    "lastTransactionAt": "2024-01-01T12:00:00Z"
  }
}
```

#### Get Transaction History
```http
GET /wallet/transactions?page=1&limit=20&type=earn_activity&status=completed
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 5.00,
      "type": "earn_activity",
      "status": "completed",
      "description": "Community Cleanup",
      "blockchainHash": "0x...",
      "createdAt": "2024-01-01T10:00:00Z",
      "partner": {
        "id": "uuid",
        "name": "Orlando Coalition"
      }
    }
  ],
  "pagination": { ... }
}
```

#### Transfer Coins
```http
POST /wallet/transfer
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "toUserIdentifier": "QR-code-string",
  "amount": 10.00,
  "message": "Thank you for helping!"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "status": "pending",
    "blockchainHash": null,
    "estimatedConfirmationTime": 30
  }
}
```

### Activity Endpoints

#### Get Available Activities
```http
GET /activities/available?category=community&location=28.538336,-81.379234&radius=5000
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Community Cleanup",
      "description": "Help clean up downtown Orlando parks",
      "category": "community",
      "reward": 5.00,
      "maxDailyCompletions": 1,
      "requiresVerification": true,
      "verificationMethod": "photo",
      "locationRequired": true,
      "isActive": true,
      "partner": {
        "id": "uuid",
        "name": "Keep Orlando Beautiful"
      }
    }
  ]
}
```

#### Submit Activity
```http
POST /activities/submit
Authorization: Bearer {access-token}
Content-Type: multipart/form-data

activityTypeId=uuid
location[lat]=28.538336
location[lng]=-81.379234
photos[]=@cleanup-photo1.jpg
photos[]=@cleanup-photo2.jpg
notes="Cleaned up 3 bags of trash from Lake Eola Park"

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending_verification",
    "rewardAmount": 5.00,
    "submittedAt": "2024-01-01T14:00:00Z",
    "estimatedVerificationTime": "24 hours"
  }
}
```

#### Get Activity History
```http
GET /activities/history?status=verified&page=1&limit=20
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "activityType": {
        "name": "Community Cleanup",
        "category": "community"
      },
      "status": "verified",
      "rewardAmount": 5.00,
      "completedAt": "2024-01-01T14:00:00Z",
      "verifiedAt": "2024-01-01T16:00:00Z",
      "verifiedBy": {
        "name": "Jane Smith",
        "organization": "Orlando Coalition"
      }
    }
  ],
  "pagination": { ... }
}
```

#### Get Activity Details
```http
GET /activities/{activityId}
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "activityType": { ... },
    "status": "verified",
    "rewardAmount": 5.00,
    "verificationData": {
      "photos": ["https://..."],
      "location": {
        "lat": 28.538336,
        "lng": -81.379234
      }
    },
    "completedAt": "2024-01-01T14:00:00Z",
    "verifiedAt": "2024-01-01T16:00:00Z"
  }
}
```

### Check-in Endpoints

#### Daily Check-in
```http
POST /checkins
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "locationId": "uuid", // Optional partner location
  "location": {
    "lat": 28.538336,
    "lng": -81.379234
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "rewardAmount": 1.00,
    "streakCount": 7,
    "checkinDate": "2024-01-01",
    "bonusEarned": false,
    "nextBonusAt": 10
  }
}
```

#### Get Check-in History
```http
GET /checkins/history?days=30
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "checkinDate": "2024-01-01",
      "rewardAmount": 1.00,
      "streakCount": 7,
      "location": {
        "name": "Central Library",
        "address": "101 E Central Blvd, Orlando, FL"
      }
    }
  ]
}
```

### Partner and Location Endpoints

#### Get Nearby Partners
```http
GET /partners/nearby?lat=28.538336&lng=-81.379234&radius=2000&category=food
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Second Harvest Food Bank",
      "type": "nonprofit",
      "description": "Providing food assistance to those in need",
      "logoUrl": "https://...",
      "distance": 1200,
      "locations": [
        {
          "id": "uuid",
          "name": "Main Distribution Center",
          "address": "411 Mercy Dr, Orlando, FL 32808",
          "location": {
            "lat": 28.538336,
            "lng": -81.379234
          },
          "hoursOfOperation": {
            "monday": "8:00-17:00",
            "tuesday": "8:00-17:00"
          },
          "accessibilityFeatures": ["wheelchair_accessible", "parking_available"]
        }
      ]
    }
  ]
}
```

#### Get Partner Details
```http
GET /partners/{partnerId}
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Second Harvest Food Bank",
    "type": "nonprofit",
    "description": "Providing food assistance to those in need",
    "logoUrl": "https://...",
    "website": "https://...",
    "isVerified": true,
    "locations": [...],
    "services": [...],
    "acceptsCoins": true
  }
}
```

#### Get Partner Services
```http
GET /partners/{partnerId}/services
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Hot Meal",
      "description": "Nutritious hot meal including main course and sides",
      "category": "food",
      "costInCoins": 3.00,
      "costInFiat": 3.00,
      "isAvailable": true,
      "dailyLimit": 1,
      "inventoryCount": null,
      "requirements": ["photo_id"]
    }
  ]
}
```

### Service Redemption Endpoints

#### Redeem Service
```http
POST /redemptions
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "serviceId": "uuid",
  "partnerId": "uuid",
  "quantity": 1,
  "notes": "Dietary restriction: vegetarian"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "redemptionCode": "BEACON-12345",
    "status": "confirmed",
    "totalCost": 3.00,
    "service": {
      "name": "Hot Meal",
      "description": "Nutritious hot meal"
    },
    "partner": {
      "name": "Second Harvest Food Bank",
      "location": "411 Mercy Dr, Orlando, FL"
    },
    "expiresAt": "2024-01-01T20:00:00Z"
  }
}
```

#### Get Redemption History
```http
GET /redemptions/history?status=fulfilled&page=1&limit=20
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "service": {
        "name": "Hot Meal",
        "category": "food"
      },
      "partner": {
        "name": "Second Harvest Food Bank"
      },
      "totalCost": 3.00,
      "status": "fulfilled",
      "redemptionCode": "BEACON-12345",
      "redeemedAt": "2024-01-01T12:00:00Z",
      "fulfilledAt": "2024-01-01T12:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Get Redemption Details
```http
GET /redemptions/{redemptionId}
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "redemptionCode": "BEACON-12345",
    "status": "confirmed",
    "totalCost": 3.00,
    "quantity": 1,
    "service": { ... },
    "partner": { ... },
    "transaction": {
      "id": "uuid",
      "blockchainHash": "0x..."
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "expiresAt": "2024-01-01T20:00:00Z"
  }
}
```

### Search and Discovery Endpoints

#### Search All
```http
GET /search?q=food&type=services&location=28.538336,-81.379234&radius=5000
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "partners": [...],
    "services": [...],
    "activities": [...]
  },
  "meta": {
    "query": "food",
    "totalResults": 25,
    "searchTime": 0.15
  }
}
```

### Analytics and Feedback Endpoints

#### Submit App Feedback
```http
POST /feedback
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "type": "bug|suggestion|praise",
  "category": "ui|performance|feature",
  "message": "The app loads slowly on my device",
  "rating": 3,
  "metadata": {
    "deviceModel": "iPhone 12",
    "appVersion": "1.0.0"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "submitted",
    "ticketNumber": "FB-2024-001"
  }
}
```

#### Get Community Impact
```http
GET /community/impact
Authorization: Bearer {access-token}

Response:
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalTransactions": 15670,
    "totalCoinsCirculated": 45230.50,
    "servicesRedeemed": 8920,
    "activitiesCompleted": 6750,
    "partnersActive": 45,
    "impactMetrics": {
      "mealsProvided": 3200,
      "transitRides": 1500,
      "servicesAccessed": 8920
    }
  }
}
```

## Partner API Endpoints

### Partner Authentication
```http
POST /partners/auth/login
Content-Type: application/json

{
  "email": "partner@example.com",
  "password": "secure-password",
  "organizationId": "uuid"
}
```

### Redemption Processing
```http
POST /partners/redemptions/{redemptionCode}/fulfill
Authorization: Bearer {partner-token}
Content-Type: application/json

{
  "fulfilledBy": "staff-member-name",
  "notes": "Service provided successfully"
}

Response:
{
  "success": true,
  "data": {
    "redemption": { ... },
    "settlement": {
      "amount": 3.00,
      "settlementDate": "2024-01-02",
      "status": "pending"
    }
  }
}
```

### Partner Dashboard Data
```http
GET /partners/dashboard/stats?period=30d
Authorization: Bearer {partner-token}

Response:
{
  "success": true,
  "data": {
    "redemptionsCount": 156,
    "revenueInCoins": 468.00,
    "uniqueUsers": 89,
    "topServices": [...],
    "hourlyDistribution": [...],
    "userSatisfaction": 4.6
  }
}
```

## Volunteer API Endpoints

### Verify Activity
```http
POST /volunteers/activities/{activityId}/verify
Authorization: Bearer {volunteer-token}
Content-Type: application/json

{
  "status": "verified|rejected",
  "notes": "Good documentation provided",
  "rewardAdjustment": 0 // Can modify reward if needed
}

Response:
{
  "success": true,
  "data": {
    "activity": { ... },
    "user": {
      "id": "uuid",
      "identifier": "masked-identifier"
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Insufficient permissions |
| `USER_001` | User not found |
| `USER_002` | User suspended |
| `WALLET_001` | Insufficient balance |
| `WALLET_002` | Transaction failed |
| `ACTIVITY_001` | Activity not found |
| `ACTIVITY_002` | Daily limit exceeded |
| `PARTNER_001` | Partner not found |
| `PARTNER_002` | Service unavailable |
| `REDEMPTION_001` | Redemption expired |
| `REDEMPTION_002` | Already redeemed |
| `SYSTEM_001` | Internal server error |
| `SYSTEM_002` | Service temporarily unavailable |

## Rate Limiting

- **General API**: 100 requests per minute per user
- **Authentication**: 5 requests per minute per IP
- **Wallet transactions**: 10 requests per minute per user
- **Partner API**: 500 requests per minute per partner

## Webhooks

### Transaction Confirmation
```json
{
  "event": "transaction.confirmed",
  "data": {
    "transactionId": "uuid",
    "blockchainHash": "0x...",
    "confirmationCount": 6
  }
}
```

### Activity Verification
```json
{
  "event": "activity.verified",
  "data": {
    "activityId": "uuid",
    "userId": "uuid",
    "rewardAmount": 5.00,
    "verifiedBy": "volunteer-uuid"
  }
}
```