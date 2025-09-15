# Blaze Vision AI - API Documentation

## Base URL
Production: `https://blaze-vision-ai-gateway.humphrey-austin20.workers.dev`

## Authentication
For development, include header: `X-Dev-Mode: true`  
For production, use JWT authentication with Bearer token.

---

## Core Endpoints

### 1. Health Check
**GET** `/healthz`

Check system health and operational status.

**Response:**
```json
{
  "status": "healthy" | "degraded",
  "timestamp": "2025-08-24T22:00:00.000Z",
  "service": "blaze-vision-ai-gateway",
  "version": "1.0.0",
  "alerts": ["HIGH_LATENCY: Average response time is 2500ms"] // optional
}
```

---

### 2. System Metrics
**GET** `/metrics`

Retrieve detailed system performance metrics.

**Response:**
```json
{
  "requests_total": 1234,
  "requests_by_endpoint": {
    "/vision/telemetry": 500,
    "/vision/sessions": 100
  },
  "error_count": 5,
  "avg_response_time": 84,
  "active_sessions": 3,
  "telemetry_packets_processed": 15000,
  "database_operations": 450,
  "cache_hits": 890,
  "cache_misses": 110,
  "uptime_ms": 3600000,
  "timestamp": "2025-08-24T22:00:00.000Z"
}
```

---

## Session Management

### 3. Create Session
**POST** `/vision/sessions`

Start a new analysis session for a player.

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000", // UUID required
  "player_id": "STL_Nolan_Arenado",
  "sport": "baseball" | "softball" | "football" | "basketball",
  "consent_token": "optional_token",
  "target_fps": 60,
  "enable_face": true,
  "enable_pose": true,
  "enable_rpg": false
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Session started successfully"
}
```

---

### 4. Process Telemetry
**POST** `/vision/telemetry`

Send real-time telemetry packets for processing.

**Request Body:**
```json
[
  {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "t": 1724535600000, // timestamp in milliseconds
    "face": {
      "blink": 0 | 1,
      "eye_ar": 0.28, // eye aspect ratio
      "gaze": [0.1, -0.05, 0.95], // [x, y, z] normalized
      "head_euler": [2.1, -1.4, 0.3], // [pitch, yaw, roll] in radians
      "au_intensities": {
        "au4": 0.15,      // Brow lowering
        "au5_7": 0.08,    // Lid tightening
        "au9_10": 0.12,   // Upper lip raiser
        "au14": 0.05,     // Dimpler
        "au17_23_24": 0.22 // Jaw tension
      },
      "qc": {
        "detection_confidence": 0.94,
        "tracking_stability": 0.88,
        "motion_blur": 0.15,
        "illumination": 0.75,
        "occlusion_ratio": 0.02
      }
    },
    "pose": {
      "kp": [[100, 200, 0.9, 0.85]], // [x, y, visibility, confidence]
      "angles": {
        "arm_slot": 85.2,
        "shoulder_separation": 42.1,
        "stride_length": 0.68,
        "release_height": 6.2,
        "balance_score": 0.82,
        "consistency_score": 0.76
      },
      "qc": {
        "detection_confidence": 0.92,
        "tracking_stability": 0.85,
        "motion_blur": 0.12,
        "illumination": 0.78,
        "occlusion_ratio": 0.03
      }
    },
    "device": {
      "fps": 60,
      "resolution": [1920, 1080],
      "has_webgpu": true,
      "has_webgl": true,
      "camera_count": 2
    }
  }
]
```

**Response:**
```json
{
  "success": true,
  "processed": 1,
  "scores": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "t": 1724535600000,
      "grit": 65,  // Grit Index (0-100)
      "risk": 0.3, // Breakdown risk (0-1)
      "components": {
        "micro_score": 55,
        "bio_score": 75,
        "pressure_weight": 0.6,
        "clutch_factor": 0.7,
        "consistency_trend": 0.05,
        "fatigue_indicator": 0.1
      },
      "explain": [
        "Elevated jaw tension detected",
        "Strong biomechanical consistency"
      ],
      "pressure_context": "low" | "medium" | "high" | "critical",
      "stress_level": "low" | "medium" | "high"
    }
  ],
  "processing_time_ms": 45,
  "gateway_latency_ms": 120
}
```

---

### 5. Get Session Scores
**GET** `/vision/session/:sessionId/scores`

Retrieve Grit Index scores for a session.

**Response:**
```json
{
  "success": true,
  "scores": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "t": 1724535600000,
      "grit": 65,
      "risk": 0.3,
      "components": {...},
      "pressure_context": "medium",
      "stress_level": "medium"
    }
  ],
  "source": "cache" | "database",
  "timestamp": 1724535700000
}
```

---

### 6. Get Session Status
**GET** `/vision/session/:sessionId/status`

Check session status and statistics.

**Response:**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "player_id": "STL_Nolan_Arenado",
  "status": "active" | "completed" | "terminated",
  "start_time": 1724535000000,
  "frames_processed": 1200,
  "avg_latency_ms": 45,
  "error_count": 0
}
```

---

### 7. End Session
**DELETE** `/vision/session/:sessionId`

Terminate an active session.

**Response:**
```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

---

## Game Context

### 8. Update Game Situation
**POST** `/vision/session/:sessionId/situation`

Update baseball game context for leverage calculation.

**Request Body:**
```json
{
  "inning": 7,
  "outs": 2,
  "bases": "101", // binary: first[1], second[0], third[1]
  "score_diff": -1
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Events & Coaching

### 9. Log Event
**POST** `/vision/event`

Record pitch outcomes or other events.

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "pitch" | "swing" | "outcome",
  "outcome": "strike" | "ball" | "hit" | "out",
  "meta": {
    "pitch_type": "fastball",
    "velocity": 94.5,
    "location": "inside_corner"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 10. Send Coaching Cue
**POST** `/vision/cue`

Log coaching interventions.

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "reset" | "drill" | "mechanical" | "mental",
  "message": "Focus on maintaining consistent release point",
  "meta": {
    "trigger_grit": 45,
    "trigger_risk": 0.7
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Analytics

### 11. Player Session Summary
**GET** `/vision/analytics/player/:playerId/summary`

Get player's recent session summaries.

**Query Parameters:**
- `sport` (optional): Filter by sport

**Response:**
```json
{
  "success": true,
  "summary": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "player_id": "STL_Nolan_Arenado",
      "sport": "baseball",
      "start_time": 1724535000000,
      "end_time": 1724538600000,
      "duration_seconds": 3600,
      "total_scores": 450,
      "avg_grit": 68.5,
      "peak_grit": 89,
      "lowest_grit": 42,
      "avg_risk": 0.35,
      "critical_moments": 12,
      "total_events": 25
    }
  ]
}
```

---

### 12. Player Performance Trends
**GET** `/vision/analytics/player/:playerId/trends`

Get player's performance trends over time.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)

**Response:**
```json
{
  "success": true,
  "trends": [
    {
      "player_id": "STL_Nolan_Arenado",
      "sport": "baseball",
      "session_date": "2025-08-24",
      "sessions_count": 3,
      "daily_avg_grit": 71.2,
      "daily_avg_risk": 0.28,
      "daily_consistency": 0.82,
      "daily_fatigue": 0.15
    }
  ]
}
```

---

### 13. System Analytics Stats
**GET** `/vision/analytics/system/stats`

Get overall system usage statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "sessions_today": 42,
    "total_scores": 125000,
    "avg_latency_ms": 47
  }
}
```

---

## WebSocket Streaming

### 14. Real-time Score Stream
**WebSocket** `/vision/session/:sessionId/stream`

Connect for real-time score updates.

**Connection:**
```javascript
const ws = new WebSocket('wss://blaze-vision-ai-gateway.humphrey-austin20.workers.dev/vision/session/550e8400-e29b-41d4-a716-446655440000/stream');

ws.onmessage = (event) => {
  const scoreUpdate = JSON.parse(event.data);
  console.log('New Grit Score:', scoreUpdate.grit);
};
```

**Message Format:**
```json
{
  "type": "score_update",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "t": 1724535600000,
    "grit": 72,
    "risk": 0.25,
    "pressure_context": "high"
  }
}
```

---

## Error Responses

All endpoints may return these error formats:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "validation": "uuid",
      "code": "invalid_string",
      "message": "Invalid uuid",
      "path": ["session_id"]
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization header"
}
```

### 404 Not Found
```json
{
  "error": "Session not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database operation failed"
}
```

---

## Rate Limits

- **Requests per minute**: 1000 (per IP)
- **Telemetry packets per second**: 100 (per session)
- **WebSocket connections**: 10 (per session)
- **Database queries per minute**: 100 (per player)

---

## SDK Integration

### JavaScript/TypeScript
```typescript
import { VisionAIService } from '@blaze/vision-ai-sdk';

const vision = new VisionAIService({
  gatewayUrl: 'https://blaze-vision-ai-gateway.humphrey-austin20.workers.dev',
  apiKey: 'your-api-key' // for production
});

// Start session
const session = await vision.createSession({
  session_id: crypto.randomUUID(),
  player_id: 'STL_Nolan_Arenado',
  sport: 'baseball'
});

// Send telemetry
const scores = await vision.sendTelemetry([
  { /* telemetry packet */ }
]);

console.log('Grit Index:', scores[0].grit);
```

---

## Performance Guarantees

- **Telemetry Processing**: <150ms p95 latency
- **Session Creation**: <100ms response time
- **Score Retrieval**: <50ms from cache
- **Analytics Queries**: <500ms for 30-day trends
- **WebSocket Latency**: <100ms for score updates

---

## Compliance & Security

- **BIPA/CUBI Compliant**: Biometric data handling
- **FERPA Compliant**: Student data protection
- **JWT Authentication**: RS256 signed tokens
- **CORS Protection**: Configured allowed origins
- **Rate Limiting**: DDoS protection
- **Data Retention**: Configurable TTLs
- **Encryption**: TLS 1.3 in transit