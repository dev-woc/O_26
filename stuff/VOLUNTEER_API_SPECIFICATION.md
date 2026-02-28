# Volunteer Management API Specification

## Overview

API endpoints for the volunteer management and coin distribution system. These endpoints extend the existing Project Beacon API to support volunteer registration, authentication, task management, and admin coin distribution.

## Base Information

- **Base URL**: `https://api.projectbeacon.org/v1`
- **Authentication**: JWT Bearer tokens with role-based access
- **Content Type**: `application/json`
- **API Version**: `v1`

## Volunteer Authentication Endpoints

### Register Volunteer
```http
POST /volunteers/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.org",
  "password": "secure-password",
  "phone": "+1-555-123-4567",
  "organization": "Orlando Coalition",
  "bio": "Experienced social worker with 5 years helping homeless community",
  "skills": ["counseling", "case_management", "spanish_fluent"],
  "availability": {
    "monday": ["09:00-17:00"],
    "tuesday": ["09:00-17:00"],
    "weekend": ["10:00-14:00"]
  }
}

Response:
{
  "success": true,
  "data": {
    "volunteer": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.org",
      "organization": "Orlando Coalition",
      "role": "volunteer",
      "isActive": true,
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

### Login Volunteer
```http
POST /volunteers/login
Content-Type: application/json

{
  "email": "jane@example.org",
  "password": "secure-password"
}

Response: Same as register
```

### Get Volunteer Profile
```http
GET /volunteers/profile
Authorization: Bearer {volunteer-token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.org",
    "phone": "+1-555-123-4567",
    "organization": "Orlando Coalition",
    "role": "volunteer",
    "bio": "Experienced social worker...",
    "skills": ["counseling", "case_management"],
    "availability": {...},
    "isActive": true,
    "backgroundCheckDate": "2024-01-01",
    "trainingCompletedDate": "2024-01-01",
    "lastLoginAt": "2024-01-01T12:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Volunteer Profile
```http
PUT /volunteers/profile
Authorization: Bearer {volunteer-token}
Content-Type: application/json

{
  "bio": "Updated bio",
  "skills": ["counseling", "case_management", "mental_health"],
  "availability": {
    "monday": ["08:00-16:00"],
    "tuesday": ["08:00-16:00"]
  }
}

Response: Updated volunteer profile object
```

## Admin Authentication Endpoints

### Admin Login
```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@example.org",
  "password": "admin-password",
  "twoFactorCode": "123456" // Optional if 2FA enabled
}

Response:
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "volunteer": {
        "id": "uuid",
        "name": "Admin User",
        "email": "admin@example.org",
        "organization": "Project Beacon"
      },
      "adminLevel": "senior",
      "canDistributeCoins": true,
      "maxCoinDistributionAmount": 500.00,
      "twoFactorEnabled": true
    },
    "tokens": {
      "accessToken": "jwt-admin-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 900
    }
  }
}
```

### Get Admin Profile
```http
GET /admin/profile
Authorization: Bearer {admin-token}

Response: Admin profile with permissions and limits
```

## Volunteer Task Management Endpoints

### Get Available Tasks
```http
GET /volunteers/tasks/available?category=verification&priority=high
Authorization: Bearer {volunteer-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Verify Community Cleanup Activities",
      "description": "Review and verify submitted cleanup activities from downtown area",
      "category": "verification",
      "priority": "medium",
      "status": "open",
      "estimatedHours": 2.5,
      "rewardAmount": 15.00,
      "dueDate": "2024-01-05T17:00:00Z",
      "requiredSkills": ["activity_verification"],
      "location": {
        "lat": 28.538336,
        "lng": -81.379234
      },
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Accept Task
```http
POST /volunteers/tasks/{taskId}/accept
Authorization: Bearer {volunteer-token}

Response:
{
  "success": true,
  "data": {
    "task": {...},
    "status": "assigned",
    "acceptedAt": "2024-01-01T12:00:00Z"
  }
}
```

### Update Task Progress
```http
PUT /volunteers/tasks/{taskId}/progress
Authorization: Bearer {volunteer-token}
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Started reviewing submitted activities",
  "hoursWorked": 1.5
}

Response:
{
  "success": true,
  "data": {
    "task": {...},
    "updatedAt": "2024-01-01T14:00:00Z"
  }
}
```

### Complete Task
```http
POST /volunteers/tasks/{taskId}/complete
Authorization: Bearer {volunteer-token}
Content-Type: multipart/form-data

completionNotes="Verified 12 activities, all documentation adequate"
hoursWorked=2.5
photos[]=@completion-evidence.jpg
location[lat]=28.538336
location[lng]=-81.379234

Response:
{
  "success": true,
  "data": {
    "task": {...},
    "status": "completed",
    "completedAt": "2024-01-01T16:00:00Z",
    "totalHoursWorked": 2.5,
    "reward": {
      "amount": 15.00,
      "status": "pending_approval"
    }
  }
}
```

### Get My Tasks
```http
GET /volunteers/tasks/mine?status=assigned&page=1&limit=20
Authorization: Bearer {volunteer-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Verify Community Cleanup Activities",
      "status": "assigned",
      "priority": "medium",
      "dueDate": "2024-01-05T17:00:00Z",
      "progress": {
        "hoursWorked": 1.5,
        "estimatedHours": 2.5,
        "percentComplete": 60
      }
    }
  ],
  "pagination": {...}
}
```

## Admin Coin Distribution Endpoints

### Distribute Coins to User
```http
POST /admin/distribute-coins
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "recipientId": "user-uuid",
  "volunteerId": "volunteer-uuid", // Optional: if related to volunteer work
  "taskId": "task-uuid", // Optional: if for task completion
  "amount": 25.00,
  "distributionType": "volunteer_reward",
  "description": "Reward for exceptional community cleanup verification work",
  "distributionDate": "2024-01-01T15:00:00Z",
  "notes": "Volunteer exceeded expectations by processing 50% more activities than usual"
}

Response:
{
  "success": true,
  "data": {
    "distribution": {
      "id": "uuid",
      "amount": 25.00,
      "distributionType": "volunteer_reward",
      "description": "Reward for exceptional community cleanup verification work",
      "approvalStatus": "approved",
      "distributionDate": "2024-01-01T15:00:00Z",
      "recipient": {
        "id": "user-uuid",
        "uniqueIdentifier": "QR-code-string"
      },
      "volunteer": {
        "id": "volunteer-uuid",
        "name": "Jane Smith"
      }
    },
    "transaction": {
      "id": "uuid",
      "status": "pending",
      "blockchainHash": null,
      "estimatedConfirmationTime": 30
    }
  }
}
```

### Get Distribution History
```http
GET /admin/distributions?distributedBy=admin-uuid&dateFrom=2024-01-01&dateTo=2024-01-31&page=1&limit=20
Authorization: Bearer {admin-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 25.00,
      "distributionType": "volunteer_reward",
      "description": "Reward for exceptional work",
      "distributionDate": "2024-01-01T15:00:00Z",
      "approvalStatus": "approved",
      "recipient": {
        "uniqueIdentifier": "masked-qr-code"
      },
      "volunteer": {
        "name": "Jane Smith",
        "organization": "Orlando Coalition"
      },
      "transaction": {
        "status": "completed",
        "blockchainHash": "0x..."
      }
    }
  ],
  "pagination": {...},
  "summary": {
    "totalDistributed": 450.00,
    "totalTransactions": 18,
    "averageAmount": 25.00
  }
}
```

### Bulk Distribute Coins
```http
POST /admin/distribute-coins/bulk
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "distributions": [
    {
      "recipientId": "user-uuid-1",
      "amount": 10.00,
      "description": "Daily volunteer appreciation"
    },
    {
      "recipientId": "user-uuid-2",
      "amount": 15.00,
      "description": "Task completion bonus"
    }
  ],
  "distributionType": "volunteer_reward",
  "distributionDate": "2024-01-01T15:00:00Z",
  "notes": "Weekly volunteer appreciation distribution"
}

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalDistributions": 2,
      "totalAmount": 25.00,
      "successfulDistributions": 2,
      "failedDistributions": 0
    },
    "distributions": [...],
    "transactions": [...]
  }
}
```

## Admin Task Management Endpoints

### Create Task
```http
POST /admin/tasks
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "title": "Verify Weekend Activity Submissions",
  "description": "Review and verify all activity submissions from weekend outreach events",
  "category": "verification",
  "priority": "high",
  "estimatedHours": 4.0,
  "rewardAmount": 30.00,
  "dueDate": "2024-01-08T17:00:00Z",
  "requiredSkills": ["activity_verification", "weekend_availability"],
  "location": {
    "lat": 28.538336,
    "lng": -81.379234
  }
}

Response:
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "title": "Verify Weekend Activity Submissions",
      "status": "open",
      "createdBy": {
        "id": "admin-uuid",
        "name": "Admin User"
      },
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
}
```

### Assign Task to Volunteer
```http
POST /admin/tasks/{taskId}/assign
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "volunteerId": "volunteer-uuid",
  "notes": "Assigning to Jane due to her expertise in activity verification"
}

Response:
{
  "success": true,
  "data": {
    "task": {...},
    "assignedTo": {
      "id": "volunteer-uuid",
      "name": "Jane Smith"
    },
    "assignedAt": "2024-01-01T12:00:00Z"
  }
}
```

### Approve Task Completion
```http
POST /admin/tasks/{taskId}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "approved": true,
  "rewardAdjustment": 5.00, // Optional: adjust reward amount
  "notes": "Excellent work, exceeded expectations by processing additional submissions"
}

Response:
{
  "success": true,
  "data": {
    "task": {...},
    "status": "completed",
    "reward": {
      "amount": 35.00,
      "status": "approved",
      "adjustmentReason": "Performance bonus"
    },
    "approvedAt": "2024-01-01T18:00:00Z"
  }
}
```

## Volunteer Activity Tracking Endpoints

### Log Activity
```http
POST /volunteers/activities
Authorization: Bearer {volunteer-token}
Content-Type: multipart/form-data

activityType="verification"
taskId=task-uuid
userHelpedId=user-uuid
hoursLogged=2.5
description="Verified 8 community cleanup submissions, all met requirements"
location[lat]=28.538336
location[lng]=-81.379234
photos[]=@activity-evidence.jpg
impactMetrics={"activitiesVerified": 8, "totalRewardApproved": 40.00}

Response:
{
  "success": true,
  "data": {
    "activity": {
      "id": "uuid",
      "activityType": "verification",
      "hoursLogged": 2.5,
      "description": "Verified 8 community cleanup submissions",
      "status": "completed",
      "impactMetrics": {
        "activitiesVerified": 8,
        "totalRewardApproved": 40.00
      },
      "createdAt": "2024-01-01T16:00:00Z"
    }
  }
}
```

### Get Activity History
```http
GET /volunteers/activities/history?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
Authorization: Bearer {volunteer-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "activityType": "verification",
      "hoursLogged": 2.5,
      "description": "Verified 8 community cleanup submissions",
      "status": "verified",
      "task": {
        "title": "Verify Community Cleanup Activities"
      },
      "verifiedBy": {
        "name": "Admin User"
      },
      "verifiedAt": "2024-01-01T18:00:00Z",
      "createdAt": "2024-01-01T16:00:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "totalHours": 45.5,
    "totalActivities": 18,
    "averageHoursPerActivity": 2.5
  }
}
```

## Reporting and Analytics Endpoints

### Volunteer Dashboard Stats
```http
GET /volunteers/dashboard/stats?period=30d
Authorization: Bearer {volunteer-token}

Response:
{
  "success": true,
  "data": {
    "hoursWorked": 45.5,
    "tasksCompleted": 18,
    "activitiesVerified": 156,
    "coinsEarned": 345.00,
    "rank": "Senior Volunteer",
    "badges": ["Activity Expert", "Community Champion"],
    "impactMetrics": {
      "usersHelped": 89,
      "totalRewardsApproved": 1250.00
    },
    "weeklyProgress": [
      { "week": "2024-W01", "hours": 12.5, "tasks": 5 },
      { "week": "2024-W02", "hours": 15.0, "tasks": 6 }
    ]
  }
}
```

### Admin Dashboard Stats
```http
GET /admin/dashboard/stats?period=30d
Authorization: Bearer {admin-token}

Response:
{
  "success": true,
  "data": {
    "totalVolunteers": 45,
    "activeVolunteers": 32,
    "totalTasksCreated": 156,
    "completedTasks": 142,
    "totalCoinsDistributed": 5670.00,
    "averageTaskCompletionTime": "2.3 days",
    "topVolunteers": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "hoursWorked": 65.5,
        "tasksCompleted": 28
      }
    ],
    "distributionsByType": {
      "volunteer_reward": 3450.00,
      "task_completion": 1820.00,
      "bonus": 400.00
    }
  }
}
```

### System Impact Report
```http
GET /admin/reports/impact?startDate=2024-01-01&endDate=2024-01-31&format=json
Authorization: Bearer {admin-token}

Response:
{
  "success": true,
  "data": {
    "reportPeriod": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "volunteerMetrics": {
      "totalVolunteers": 45,
      "newVolunteers": 8,
      "totalHoursContributed": 1250.5,
      "averageHoursPerVolunteer": 27.8
    },
    "taskMetrics": {
      "tasksCreated": 156,
      "tasksCompleted": 142,
      "completionRate": 91.0,
      "averageCompletionTime": "2.3 days"
    },
    "coinDistribution": {
      "totalDistributed": 5670.00,
      "totalDistributions": 234,
      "averageDistribution": 24.23,
      "distributionsByType": {
        "volunteer_reward": 3450.00,
        "task_completion": 1820.00,
        "bonus": 400.00
      }
    },
    "userImpact": {
      "usersHelped": 892,
      "activitiesVerified": 1567,
      "totalRewardsApproved": 8950.00
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VOLUNTEER_001` | Volunteer not found |
| `VOLUNTEER_002` | Invalid volunteer credentials |
| `VOLUNTEER_003` | Volunteer account suspended |
| `VOLUNTEER_004` | Email already registered |
| `ADMIN_001` | Admin not found |
| `ADMIN_002` | Insufficient admin permissions |
| `ADMIN_003` | Two-factor authentication required |
| `ADMIN_004` | Coin distribution limit exceeded |
| `TASK_001` | Task not found |
| `TASK_002` | Task already assigned |
| `TASK_003` | Task completion deadline exceeded |
| `TASK_004` | Insufficient skills for task |
| `DISTRIBUTION_001` | Invalid distribution amount |
| `DISTRIBUTION_002` | Recipient not found |
| `DISTRIBUTION_003` | Daily distribution limit exceeded |
| `DISTRIBUTION_004` | Insufficient admin balance |

## Rate Limiting

- **Volunteer API**: 60 requests per minute per volunteer
- **Admin API**: 200 requests per minute per admin
- **Coin Distribution**: 10 distributions per minute per admin
- **Bulk Operations**: 5 requests per minute per admin

## Webhooks

### Task Assignment Notification
```json
{
  "event": "task.assigned",
  "data": {
    "taskId": "uuid",
    "volunteerId": "uuid",
    "assignedBy": "admin-uuid",
    "dueDate": "2024-01-05T17:00:00Z"
  }
}
```

### Coin Distribution Completed
```json
{
  "event": "distribution.completed",
  "data": {
    "distributionId": "uuid",
    "amount": 25.00,
    "recipientId": "uuid",
    "distributedBy": "admin-uuid",
    "transactionHash": "0x..."
  }
}
```

### Volunteer Achievement Unlocked
```json
{
  "event": "volunteer.achievement",
  "data": {
    "volunteerId": "uuid",
    "achievement": "Activity Expert",
    "description": "Verified 100+ activities",
    "unlockedAt": "2024-01-01T18:00:00Z"
  }
}
```