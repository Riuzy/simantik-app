# SIMANTIK UML Documentation

This directory contains PlantUML diagrams for the SIMANTIK Software Testing Management System, generated directly from the source code implementation.

## Diagrams

| Diagram | File | Description |
|---------|------|-------------|
| **Use Case** | `usecase.puml` | System actors and implemented use cases |
| **Activity** | `activity.puml` | End-to-end workflow from login to logout |
| **Sequence** | `sequence.puml` | Detailed API call sequences for major flows |
| **Class** | `class.puml` | Domain models, services, and relationships |

## Synchronization Rules Applied

Following the strict synchronization requirements:

1. **Use Case → Activity**: Every use case in `usecase.puml` has a corresponding flow in `activity.puml`
2. **Activity → Sequence**: Every activity step has corresponding API calls in `sequence.puml`
3. **Class → Source Code**: Classes in `class.puml` match actual Prisma models and TypeScript service classes
4. **No Invented Features**: Only implemented features are included

## Rendering

To render these diagrams, use PlantUML:

```bash
# Install PlantUML (requires Java)
# Then render each diagram:
plantuml -tsvg usecase.puml
plantuml -tsvg activity.puml
plantuml -tsvg sequence.puml
plantuml -tsvg class.puml
```

Or use the VS Code PlantUML extension for live preview.

## Diagram Details

### Use Case Diagram (`usecase.puml`)
- **Actor**: Tester (single role in current implementation)
- **54 Use Cases** grouped into 9 packages
- Only implemented features included (no Manager role as it doesn't exist in source)

### Activity Diagram (`activity.puml`)
- **Single flow** from Login → Dashboard → Project → Test Cases → Steps → Automation → Execution → Reports → Settings → Logout
- Decision nodes for branching (e.g., AI configured?, Create new?, Failed?)
- Directly derived from Use Cases

### Sequence Diagram (`sequence.puml`)
- **Participants**: Tester, Frontend, API Gateway, Controllers, Services, Repositories, Database, External AI, Playwright
- **12 Major Flows**: Login, Refresh Token, Dashboard, Project CRUD, Test Case CRUD, Test Steps, AI Script Generation, Run Test, Reports, AI Integration
- Exact method names from source code (e.g., `login()`, `generateScript()`, `loadRunConfig()`)
- External systems: AI Providers (Gemini/OpenRouter), Playwright

### Class Diagram (`class.puml`)
- **Domain Models**: 8 Prisma models (User, Project, TestCase, TestStep, Execution, ExecutionLog, AutomationScript, AISetting, Setting)
- **8 Enums** with exact values from Prisma schema
- **Backend Services**: 8 service classes with actual method signatures
- **Automation Engines**: Interface + 2 implementations (TemplateGenerator, AIGenerator) + AuthEngine + PlaywrightScriptService
- **Frontend Hooks**: 8 key hooks with actual return types
- Relationships: Inheritance (Generator), Composition, Aggregation, Associations

## Source Code References

All diagrams derived from:
- `prisma/schema.prisma` - Database models
- `src/server/modules/*/services/*.ts` - Service implementations
- `src/server/modules/*/controllers/*.ts` - Controllers
- `src/server/modules/*/repositories/*.ts` - Repositories
- `src/server/routes/index.ts` - API routes
- `src/features/*/hooks/*.ts` - Frontend hooks
- `src/app/(app)/*/page.tsx` - Page components
- `src/components/layout/sidebar.tsx` - Navigation

## Validation

See `uml-validation-report.md` for synchronization validation results.