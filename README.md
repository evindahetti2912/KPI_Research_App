# Knowledge Share: Enhanced IT/Software Project Success through Automated KPI Allocation

## Research Overview

This project presents a comprehensive software system designed to optimize IT project management through automated KPI (Key Performance Indicator) allocation and employee skill matching. The system addresses several critical challenges in software project management:

1. **Resource allocation inefficiency**: Matching the right developers to projects based on their skills and experience
2. **KPI management complexity**: Generating appropriate performance metrics for different project types and roles
3. **Skills development gaps**: Identifying and addressing skill gaps for career growth

## System Architecture

The application follows a modern web architecture with:

- **Frontend**: React-based UI with component-based architecture
- **Backend**: Flask API with modular organization
- **Database**: MongoDB for document storage
- **AI Integration**: OpenAI API for CV parsing, KPI generation, and skill matching

The project architecture is structured as follows:

```
/project_root
├── /frontend            # React-based UI
├── /backend             # Flask API & core logic
├── /models              # ML models for skill matching & KPI generation
├── /data                # Sample data, schemas, and database scripts
└── /docs                # Documentation
```

## Core Functionalities

### 1. CV Processing & Employee Management

The system extracts and structures employee data from CVs:
- Extracts text from CV documents (PDF/images)
- Uses OpenAI to structure CV data
- Validates and stores structured employee information
- Supports PDF processing in addition to images

The employee data model stores comprehensive information including:
- Contact information
- Technical skills with proficiency levels
- Work experience with responsibilities and technologies
- Education and certifications
- Career progression tracking

### 2. Developer Matching System

The developer matching functionality includes:
- Enhanced fuzzy matching for skill compatibility
- Advanced scoring algorithm considering:
  - Technical skill match
  - Experience relevance
  - Project type familiarity
  - Role-specific requirements
- Interactive UI for reviewing and selecting candidates

The system uses sophisticated matching algorithms from `modules/employee_matching/` to rank candidates based on:
- Skill similarity calculations
- Experience analysis
- Project type matching
- Overall compatibility scoring

### 3. Dynamic KPI Generation

The KPI generation system provides:
- Extended KPI categories
- Formulas for calculating KPI targets based on:
  - Project type
  - Team composition
  - Timeline constraints
  - Developer experience levels
- Automated chart generation
- Real-time KPI adjustment based on project progress

The KPI categories include:
- Productivity & Agile Performance
- Code Quality & Efficiency
- Collaboration & Communication
- Adaptability & Continuous Improvement

### 4. Skill Development & Career Progression

The skill development functionality offers:
- Job role hierarchy definition
- Automated skill gap detection
- Integration with learning platforms
- Personalized training path generation
- Progress tracking toward skill acquisition

The system includes a role hierarchy model that defines career progression paths with required skills for each level, from junior developers to architects.

## Technical Implementation Details

### Backend Structure

The backend is organized into modules:

```
/backend
├── app.py               # Main Flask application
├── config.py            # Configuration settings
├── requirements.txt     # Project dependencies
├── /modules
│   ├── /cv_processing   # CV parsing and structuring
│   │   ├── __init__.py
│   │   ├── cv_extractor.py      # Enhanced from main.py
│   │   ├── cv_parser.py         # Uses OpenAI to structure CV data
│   │   └── cv_validator.py      # Validates parsed CV structure
│   │
│   ├── /employee_matching       # Developer selection system
│   │   ├── __init__.py
│   │   ├── skill_matcher.py     # Enhanced from BestEmployee.py
│   │   ├── experience_analyzer.py
│   │   ├── fuzzy_matching.py    # Improved fuzzy matching
│   │   └── candidate_ranker.py  # Calculates final ranking scores
│   │
│   ├── /kpi_generation          # Dynamic KPI allocation
│   │   ├── __init__.py
│   │   ├── kpi_generator.py     # Enhanced from KPIGen.py
│   │   ├── project_analyzer.py  # Analyzes project requirements
│   │   ├── chart_generator.py   # Creates Gantt/burndown charts
│   │   └── kpi_adjuster.py      # Adapts KPIs during project lifecycle
│   │
│   └── /skill_recommendation    # Career growth recommendations
│       ├── __init__.py
│       ├── skill_gap_analyzer.py
│       ├── role_hierarchy.py
│       ├── training_recommender.py
│       └── progress_tracker.py
│
├── /api
│   ├── __init__.py
│   ├── routes.py           # Route definitions
│   ├── /endpoints
│   │   ├── cv_routes.py    # CV upload & processing endpoints
│   │   ├── employee_routes.py
│   │   ├── project_routes.py
│   │   ├── kpi_routes.py
│   │   └── recommendation_routes.py
│   └── /schemas
│       ├── cv_schema.py
│       ├── employee_schema.py
│       ├── project_schema.py
│       └── kpi_schema.py
│
├── /services
│   ├── openai_service.py   # Wrapper for OpenAI API calls
│   ├── mongodb_service.py  # Enhanced database operations
│   ├── chart_service.py    # Visualization generation service
│   └── pdf_service.py      # PDF handling for CV uploads
│
└── /utils
    ├── nlp_utils.py        # NLP helpers for text processing
    ├── data_utils.py       # Data manipulation utilities
    ├── error_handlers.py   # Custom exception handlers
    └── validators.py       # Input validation utilities
```

### Frontend Structure

The frontend is structured as follows:

```
/frontend
├── package.json
├── public/
├── /src
    ├── index.js
    ├── App.js
    ├── /assets
    │   ├── /images
    │   └── /styles
    │
    ├── /components
    │   ├── /common         # Reusable UI components
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── UploadField.jsx
    │   │   └── ...
    │   │
    │   ├── /cv-management  # CV upload and processing
    │   │   ├── CVUploader.jsx
    │   │   ├── CVPreview.jsx
    │   │   └── ParsedDataViewer.jsx
    │   │
    │   ├── /talent-pool    # Employee management
    │   │   ├── EmployeeList.jsx
    │   │   ├── EmployeeDetail.jsx
    │   │   ├── SkillVisualizer.jsx
    │   │   └── CareerPathView.jsx
    │   │
    │   ├── /project-management
    │   │   ├── ProjectCreator.jsx
    │   │   ├── ProjectList.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   ├── DeveloperMatcher.jsx  # For talent selection
    │   │   └── TeamComposition.jsx
    │   │
    │   ├── /kpi-management
    │   │   ├── KPIGenerator.jsx
    │   │   ├── KPIDashboard.jsx
    │   │   ├── GanttChartView.jsx
    │   │   └── BurndownChartView.jsx
    │   │
    │   └── /skill-development
    │       ├── SkillGapAnalyzer.jsx
    │       ├── RecommendationList.jsx
    │       ├── TrainingResourceList.jsx
    │       └── DevelopmentTracker.jsx
    │
    ├── /pages              # Page components for routing
    │   ├── Dashboard.jsx
    │   ├── CVUploadPage.jsx
    │   ├── TalentPoolPage.jsx
    │   ├── ProjectsPage.jsx
    │   ├── KPIManagementPage.jsx
    │   └── SkillDevelopmentPage.jsx
    │
    ├── /services           # API interaction services
    │   ├── api.js          # Base API configuration
    │   ├── cvService.js
    │   ├── employeeService.js
    │   ├── projectService.js
    │   ├── kpiService.js
    │   └── recommendationService.js
    │
    └── /utils              # Frontend utilities
        ├── formatters.js   # Data formatting helpers
        ├── validators.js   # Input validation
        ├── chartHelpers.js # Visualization helpers
        └── authHelpers.js  # Authentication utilities
```

### Key Data Models

#### Employee/CV Model
The employee data model stores:
```javascript
{
  "_id": ObjectId,
  "name": String,
  "contactInformation": {
    "email": String,
    "phone": String,
    "address": String,
    "linkedin": String
  },
  "skills": [
    {
      "name": String,
      "category": String,  // "Programming", "Framework", "Soft Skill", etc.
      "proficiencyLevel": Number,  // 1-5 scale
      "yearsOfExperience": Number,
      "lastUsed": Date
    }
  ],
  "experience": [
    {
      "role": String,
      "company": String,
      "duration": String,
      "startDate": Date,
      "endDate": Date,
      "responsibilities": [String],
      "technologies": [String],
      "achievements": [String],
      "projectTypes": [String]  // Types of projects worked on
    }
  ],
  "education": [
    {
      "degree": String,
      "institution": String,
      "duration": String,
      "startDate": Date,
      "endDate": Date,
      "details": String,
      "relevantCourses": [String]
    }
  ],
  "certifications": [
    {
      "name": String,
      "issuer": String,
      "dateObtained": Date,
      "expiryDate": Date,
      "skills": [String]  // Skills related to this certification
    }
  ],
  "currentRole": {
    "title": String,
    "level": Number,
    "department": String
  },
  "careerProgression": {
    "currentRoleSkillCoverage": Number,  // Percentage
    "nextRoleTitle": String,
    "nextRoleSkillGap": [String],
    "recommendedTraining": [
      {
        "skillToImprove": String,
        "suggestedResources": [
          {
            "type": String,  // "Course", "Certification", "Book", etc.
            "name": String,
            "provider": String,
            "url": String
          }
        ]
      }
    ]
  },
  "metadata": {
    "cvSource": String,  // Filename of original CV
    "lastUpdated": Date,
    "confidenceScore": Number  // Confidence of CV parsing
  }
}
```

#### Project Model
The project model includes:
```javascript
{
  "_id": ObjectId,
  "name": String,
  "type": String,  // "Web Development", "Mobile App", etc.
  "description": String,
  "technologies": [String],
  "timeline": {
    "startDate": Date,
    "endDate": Date,
    "totalDays": Number,
    "currentDay": Number  // For tracking progress
  },
  "team": {
    "size": Number,
    "requiredRoles": [
      {
        "title": String,
        "count": Number,
        "requiredSkills": [String],
        "preferredSkills": [String],
        "assignedEmployees": [ObjectId]  // References to employee IDs
      }
    ]
  },
  "sprints": [
    {
      "number": Number,
      "startDate": Date,
      "endDate": Date,
      "tasks": [String],
      "status": String  // "Planned", "In Progress", "Completed"
    }
  ],
  "kpis": {
    // KPI data structure with categories
    // Each KPI has value, target, and status
  }
}
```

#### Job Role Hierarchy Model
This model defines career progression paths:
```javascript
{
  "_id": ObjectId,
  "title": String,
  "level": Number,  // Hierarchical level (1, 2, 3...)
  "department": String,
  "requiredSkills": {
    "technical": [
      {
        "name": String,
        "minimumProficiency": Number,  // 1-5
        "weight": Number  // Importance weight for role
      }
    ],
    "soft": [
      {
        "name": String,
        "minimumProficiency": Number,
        "weight": Number
      }
    ]
  },
  "minimumExperience": {
    "years": Number,
    "specificDomains": [String]
  },
  "responsibilities": [String],
  "careerPath": {
    "previousRole": String,  // Role title at previous level
    "nextRole": String       // Role title at next level
  },
  "metadata": {
    "createdAt": Date,
    "updatedAt": Date
  }
}
```

## Module Explanations

### 1. Skill Recommendation Module

The skill recommendation module contains several key components:

1. **Role Hierarchy**: Defines different role levels (Software Engineer → Senior → Lead → Architect) with required skills for each role.

For example, a Software Engineer role requires:
```
"required_skills": {
    "technical": [
        {"name": "Programming Fundamentals", "min_proficiency": 3},
        {"name": "Data Structures", "min_proficiency": 3},
        {"name": "Algorithms", "min_proficiency": 2},
        {"name": "Version Control", "min_proficiency": 3},
        {"name": "Testing", "min_proficiency": 2}
    ],
    "soft": [
        {"name": "Communication", "min_proficiency": 2},
        {"name": "Problem-solving", "min_proficiency": 3},
        {"name": "Teamwork", "min_proficiency": 2}
    ]
}
```

2. **Training Recommender**: Provides learning resources based on identified skill gaps

For instance, for "Programming Fundamentals" it might recommend:
```
[
    {
        "type": "Course",
        "name": "Introduction to Programming",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/programming-fundamentals",
        "description": "Learn the basics of programming, including variables, loops, and functions."
    },
    {
        "type": "Book",
        "name": "Clean Code",
        "provider": "Robert C. Martin",
        "url": "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882",
        "description": "A handbook of good programming practices."
    }
]
```

3. **Skill Gap Analyzer**: Compares employee skills with role requirements to identify skill gaps and calculate readiness for career progression

4. **Progress Tracker**: Manages personalized development plans with milestones and progress tracking

### 2. Employee Matching Module

The employee matching module contains:

1. **Candidate Ranker**: Ranks candidates based on:
   - Skill match score
   - Experience relevance 
   - Years of experience
   - Project type match score

2. **Skill Matcher**: Calculates skill compatibility between candidate skills and project requirements

3. **Experience Analyzer**: Evaluates relevant work experience

4. **Fuzzy Matching**: Provides flexible text matching to handle variations in skill names and descriptions

### 3. KPI Generation Module

The KPI module analyzes project details to generate appropriate performance metrics.

It generates KPIs grouped into categories:
```
"kpis": {
  "productivity": {
    "velocity": { "value": "X story points per sprint", "target": "Y story points per sprint", "status": "Status" },
    "sprint_burndown_rate": { "value": "X story points per day", "target": "Y story points per day", "status": "Status" },
    ... other productivity KPIs
  },
  "code_quality": {
    "defect_density": { "value": "X defects per 1,000 LOC", "target": "Y defects per 1,000 LOC", "status": "Status" },
    ... other code quality KPIs
  },
  ... other categories
}
```

The system also generates visual elements:
- Gantt charts for project timeline visualization
- Burndown charts for sprint progress tracking
- KPI dashboards for performance monitoring

## API Integration

The system uses REST API endpoints for various functionalities:

### CV Processing and Employee Management
- Upload, parse, and validate CV documents
- Retrieve and manage employee information

### Project Management
- Create, update, and manage projects
- Match employees to project roles based on skills

### KPI Management
- Generate and adjust KPIs for projects
- Track KPI progress and generate visualizations

### Skill Development
- Analyze skill gaps for career progression
- Generate training recommendations
- Track skill development progress

## User Interface Flow

The application provides several main workflows:

1. **CV Upload & Employee Management**:
   - Upload employee CVs
   - View parsed CV data and skills
   - Manage employee profiles

2. **Project Management**:
   - Create and configure projects
   - Match best employees to project roles
   - View and manage project team composition

3. **KPI Management**:
   - Generate appropriate KPIs for projects
   - View KPI dashboards and visualizations
   - Adjust KPIs based on project progress

4. **Skill Development**:
   - Analyze employee skill gaps
   - Generate personalized training recommendations
   - Track skill development progress

## Key Technologies Used

- **Frontend**: React, Context API for state management
- **Backend**: Flask, MongoDB
- **AI Integration**: OpenAI API for natural language processing
- **Visualization**: Chart libraries for KPI dashboards and project timelines
- **Matching Algorithms**: Fuzzy matching, TF-IDF implementation for skill matching

## Conclusion

This software system provides a comprehensive solution for IT project management by integrating CV processing, employee-project matching, KPI generation, and skill development tracking. It uses AI and matching algorithms to optimize resource allocation, set appropriate performance metrics, and support employee career growth.

The modular architecture allows for easy extension and maintenance, while the React frontend provides a user-friendly interface for project managers and team leads to efficiently manage their IT projects and teams.
