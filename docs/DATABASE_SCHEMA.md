# Database Schema

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED |
| username | VARCHAR(100) | UNIQUE, NOT NULL |
| hashed_password | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NULLABLE |
| role | VARCHAR(20) | DEFAULT 'user' |
| is_active | BOOLEAN | DEFAULT true |
| is_verified | BOOLEAN | DEFAULT false |
| sustainability_score | INTEGER | DEFAULT 0 |
| carbon_saved | FLOAT | DEFAULT 0.0 |
| green_level | INTEGER | DEFAULT 1 |
| streak_days | INTEGER | DEFAULT 0 |
| avatar_url | VARCHAR(500) | NULLABLE |
| created_at | TIMESTAMP(tz) | NOT NULL |
| updated_at | TIMESTAMP(tz) | NOT NULL |

### emission_records
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| subcategory | VARCHAR(50) | NULLABLE |
| amount | FLOAT | NOT NULL |
| unit | VARCHAR(20) | NOT NULL |
| carbon_footprint | FLOAT | NOT NULL |
| recorded_at | TIMESTAMP(tz) | NOT NULL |
| created_at | TIMESTAMP(tz) | NOT NULL |

### achievements
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| description | VARCHAR(500) | NOT NULL |
| badge_icon | VARCHAR(10) | NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| threshold_score | INTEGER | NOT NULL |
| created_at | TIMESTAMP(tz) | NOT NULL |

### user_achievements
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, NOT NULL |
| achievement_id | UUID | FK -> achievements.id, NOT NULL |
| unlocked_at | TIMESTAMP(tz) | NOT NULL |

### challenges
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| description | VARCHAR(500) | NOT NULL |
| goal_type | VARCHAR(50) | NOT NULL |
| goal_value | FLOAT | NOT NULL |
| reward_score | INTEGER | NOT NULL |
| starts_at | TIMESTAMP(tz) | NOT NULL |
| ends_at | TIMESTAMP(tz) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP(tz) | NOT NULL |

### user_challenges
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, NOT NULL |
| challenge_id | UUID | FK -> challenges.id, NOT NULL |
| progress | FLOAT | DEFAULT 0 |
| completed | BOOLEAN | DEFAULT false |
| completed_at | TIMESTAMP(tz) | NULLABLE |
| started_at | TIMESTAMP(tz) | NOT NULL |

### sustainability_goals
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| description | VARCHAR(500) | NOT NULL |
| target_carbon_reduction | FLOAT | NOT NULL |
| current_reduction | FLOAT | DEFAULT 0.0 |
| category | VARCHAR(50) | NOT NULL |
| target_date | DATE | NOT NULL |
| is_completed | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP(tz) | NOT NULL |
| updated_at | TIMESTAMP(tz) | NOT NULL |

### audit_logs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id, NULLABLE |
| action | VARCHAR(100) | NOT NULL |
| resource | VARCHAR(100) | NOT NULL |
| resource_id | UUID | NULLABLE |
| details | JSONB | NULLABLE |
| ip_address | VARCHAR(45) | NULLABLE |
| user_agent | VARCHAR(500) | NULLABLE |
| created_at | TIMESTAMP(tz) | NOT NULL |

## Relationships

```
users 1:N emission_records
users N:N achievements (through user_achievements)
users N:N challenges (through user_challenges)
users 1:N sustainability_goals
users 1:N audit_logs
```

## Indexes

- `users.email` (unique)
- `users.username` (unique)
- `emission_records.user_id`
- `emission_records.category`
- `emission_records.recorded_at`
- `user_achievements.user_id`
- `user_challenges.user_id`
- `audit_logs.user_id`
- `audit_logs.created_at`
