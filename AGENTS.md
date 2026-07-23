# AGENTS.md

# SIMANTIK Development Guide

## Overview

SIMANTIK is a modern Software Testing Management System inspired by TestRail.

The project consists of two independent applications:

- Web Application (Next.js)
- Automation Engine (Playwright)

Both applications are maintained in a pnpm monorepo.

The goal is to build a clean, scalable, and maintainable architecture.

---

# Core Principles

Always prioritize:

- Readability
- Maintainability
- Scalability
- Consistency

Do not optimize prematurely.

Prefer simple solutions over clever implementations.

Avoid unnecessary abstractions.

---

# Tech Stack

## Web

- Next.js 15
- App Router
- React 19
- TypeScript
- Prisma
- MySQL
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Axios

## Automation

- Playwright
- TypeScript
- Page Object Model

---

# Monorepo Structure

```
simantik/

apps/
    web/
    automation/

packages/

docs/

AGENTS.md
```

Never create additional applications unless requested.

---

# Folder Structure (Web)

```
src/

app/

components/

features/

hooks/

lib/

providers/

server/

services/

store/

types/

utils/
```

Never place business logic inside app/.

---

# Feature Based Architecture

Each feature owns its code.

Example:

```
features/

projects/

components/

hooks/

services/

schemas/

types/

constants/
```

Do not create a shared "modules" directory.

---

# Components

Reusable UI goes into

```
components/ui
```

Reusable application components go into

```
components/common
```

Layout components go into

```
components/layout
```

Feature-specific components belong inside the feature folder.

---

# Imports

Do not use import aliases.

Do not use "@/".

Always use relative imports.

Example:

```ts
import { Button } from "../../components/ui/button";
```

---

# TypeScript

Enable strict mode.

Never use:

```ts
any;
```

Prefer:

- unknown
- generics
- proper interfaces

Always define return types for exported functions.

---

# Naming Convention

Folders

kebab-case

Files

kebab-case

React Components

PascalCase

Interfaces

PascalCase

Types

PascalCase

Enums

PascalCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

---

# React

Prefer functional components.

Prefer composition over inheritance.

Keep components small.

Avoid components longer than 300 lines.

Extract reusable logic into hooks.

---

# State Management

Use Zustand only for:

- Authentication
- Theme
- User session
- UI state

Never store server data in Zustand.

---

# Server State

Always use TanStack Query.

Do not use useEffect for data fetching unless absolutely necessary.

---

# Forms

Always use

- React Hook Form
- Zod

Never validate manually inside components.

---

# API

Use Route Handlers.

Keep handlers thin.

Move business logic into services.

---

# Services

Business logic belongs inside services.

Components should not contain business rules.

---

# Database

Use Prisma only.

Avoid raw SQL.

Create reusable Prisma queries.

Never access Prisma directly from client components.

---

# Validation

Always validate:

- Request body
- Query parameters
- Forms

Use Zod.

---

# Error Handling

Throw meaningful errors.

Avoid silent failures.

Return consistent API responses.

---

# Styling

Use Tailwind CSS.

Avoid inline styles.

Reuse utility classes.

Prefer shadcn/ui components.

---

# Icons

Use Lucide React.

Do not mix icon libraries.

---

# File Size

Preferred limits:

Component

<300 lines

Hook

<200 lines

Service

<300 lines

If larger, split the file.

---

# Comments

Do not comment obvious code.

Write self-explanatory code.

Comment only complex business logic.

---

# Logging

Never leave console.log in production code.

Use proper logging utilities.

---

# Security

Never expose secrets.

Never hardcode credentials.

Always validate user input.

---

# Environment Variables

Never commit:

.env

Only commit:

.env.example

---

# Testing

Web testing will be added later.

Automation uses Playwright.

---

# Automation Engine

Automation is an independent application.

Responsibilities:

- Execute Playwright tests
- Generate reports
- Capture screenshots
- Capture videos
- Capture traces
- Send execution results to Web API

Automation must never access the database directly.

Communication is done through HTTP APIs.

---

# Playwright

Use Page Object Model.

Organize tests by feature.

Example:

```
tests/

authentication/

projects/

users/

test-cases/

test-runs/
```

---

# Page Objects

Never place assertions inside Page Objects.

Page Objects only:

- locate elements
- perform actions

Assertions belong in tests.

---

# Documentation

Whenever introducing:

- new architecture
- new module
- new workflow

Update documentation.

---

# Code Quality

Prefer explicit code.

Avoid magic values.

Extract constants.

Keep functions focused.

---

# AI Instructions

When generating code:

- Follow the existing architecture.
- Reuse existing patterns.
- Do not introduce new libraries without request.
- Do not refactor unrelated files.
- Keep changes minimal.
- Preserve naming consistency.
- Prefer composition.
- Avoid overengineering.

If uncertain, ask instead of assuming.
