# API Reference: Portfolio Data Functions

This document details all available functions for managing portfolio data with Supabase.

## Installation & Setup

```typescript
import {
  loadData,
  saveData,
  subscribeToChanges,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  updateCertification,
  deleteCertification,
  type PortfolioData,
  type Project,
  type Certification,
} from "@/lib/portfolio-data";
```

## Data Types

### PortfolioData
Complete portfolio data structure
```typescript
type PortfolioData = {
  about: string;                          // Profile bio
  resumeUrl: string;                      // Resume URL
  profiles: {
    github: string;
    linkedin: string;
    leetcode: string;
    codechef: string;
    email: string;
  };
  stats: {
    leetcode: number;                     // LeetCode problems solved
    codechef: number;                     // CodeChef rating
    github: number;                       // GitHub repositories
    projects: number;                     // Total projects
    certs: number;                        // Total certifications
  };
  projects: Project[];
  certifications: Certification[];
  adminPassword: string;
};
```

### Project
Portfolio project data
```typescript
type Project = {
  id: string;                    // Unique identifier
  title: string;                 // Project name
  description: string;           // Project description
  image: string;                 // Image URL
  tech: string[];                // Technologies used
  github: string;                // GitHub repository URL
  demo: string;                  // Live demo URL
  category: string;              // Project category
};
```

### Certification
Certification/credential data
```typescript
type Certification = {
  id: string;                    // Unique identifier
  name: string;                  // Certification name
  issuer: string;                // Issuing organization
  date: string;                  // Issue date
  image: string;                 // Certificate image URL
  url: string;                   // Certificate verification URL
};
```

## Functions

### Data Loading

#### `loadData(): Promise<PortfolioData>`
Loads complete portfolio data from Supabase (or localStorage fallback).

**Returns**: Promise resolving to PortfolioData object

**Example**:
```typescript
const data = await loadData();
console.log(data.projects); // Array of projects
console.log(data.about);    // About section text
```

**Error Handling**:
```typescript
try {
  const data = await loadData();
} catch (error) {
  console.error("Failed to load data:", error);
  // Falls back to localStorage automatically
}
```

---

### Profile Management

#### `saveData(data: PortfolioData): Promise<void>`
Updates profile information (about, resume, social links, stats, password).

**Parameters**:
- `data`: Updated PortfolioData object

**Returns**: Promise that resolves when saved

**Example**:
```typescript
const updatedData = {
  ...currentData,
  about: "New bio...",
  profiles: {
    ...currentData.profiles,
    email: "newemail@example.com",
  },
  adminPassword: "newpassword123",
};

await saveData(updatedData);
console.log("Profile updated!");
```

---

### Project Management

#### `addProject(project: Omit<Project, 'id'>): Promise<Project | null>`
Creates a new project.

**Parameters**:
- `project`: Project data (id is auto-generated)

**Returns**: Promise resolving to created Project or null on error

**Example**:
```typescript
const newProject = await addProject({
  title: "E-commerce Platform",
  description: "Full-stack e-commerce solution",
  image: "https://example.com/image.jpg",
  tech: ["React", "Node.js", "PostgreSQL"],
  github: "https://github.com/username/ecommerce",
  demo: "https://ecommerce-demo.com",
  category: "Web Development",
});

if (newProject) {
  console.log("Project created:", newProject.id);
} else {
  console.error("Failed to create project");
}
```

---

#### `updateProject(id: string, project: Partial<Project>): Promise<boolean>`
Updates an existing project.

**Parameters**:
- `id`: Project ID
- `project`: Partial project data (only fields to update)

**Returns**: Promise resolving to boolean (success/failure)

**Example**:
```typescript
const success = await updateProject("p1", {
  title: "Updated Title",
  description: "New description",
});

if (success) {
  console.log("Project updated!");
} else {
  console.error("Update failed");
}
```

---

#### `deleteProject(id: string): Promise<boolean>`
Deletes a project.

**Parameters**:
- `id`: Project ID to delete

**Returns**: Promise resolving to boolean (success/failure)

**Example**:
```typescript
const deleted = await deleteProject("p1");
if (deleted) {
  console.log("Project deleted");
}
```

---

### Certification Management

#### `addCertification(cert: Omit<Certification, 'id'>): Promise<Certification | null>`
Creates a new certification.

**Parameters**:
- `cert`: Certification data (id is auto-generated)

**Returns**: Promise resolving to created Certification or null on error

**Example**:
```typescript
const cert = await addCertification({
  name: "AWS Solutions Architect",
  issuer: "Amazon Web Services",
  date: "2024",
  image: "https://example.com/aws-cert.jpg",
  url: "https://aws.amazon.com/verify",
});

if (cert) {
  console.log("Certification added:", cert.id);
}
```

---

#### `updateCertification(id: string, cert: Partial<Certification>): Promise<boolean>`
Updates an existing certification.

**Parameters**:
- `id`: Certification ID
- `cert`: Partial certification data

**Returns**: Promise resolving to boolean (success/failure)

**Example**:
```typescript
await updateCertification("c1", {
  date: "2025",
  url: "https://new-url.com/verify",
});
```

---

#### `deleteCertification(id: string): Promise<boolean>`
Deletes a certification.

**Parameters**:
- `id`: Certification ID to delete

**Returns**: Promise resolving to boolean (success/failure)

**Example**:
```typescript
await deleteCertification("c1");
```

---

### Real-Time Subscriptions

#### `subscribeToChanges(callback: (data: PortfolioData) => void): () => void`
Subscribes to real-time changes in portfolio data.

**Parameters**:
- `callback`: Function called whenever data changes with new PortfolioData

**Returns**: Unsubscribe function to stop listening

**Example**:
```typescript
// Subscribe to changes
const unsubscribe = subscribeToChanges((newData) => {
  console.log("Data changed!", newData);
  // Update UI, state, etc.
});

// Later: stop listening
unsubscribe();
```

**React Hook Example**:
```typescript
useEffect(() => {
  const unsubscribe = subscribeToChanges((newData) => {
    setData(newData);
  });

  return unsubscribe; // Cleanup subscription
}, []);
```

---

## Complete Admin Panel Example

```typescript
import React, { useState } from "react";
import {
  loadData,
  addProject,
  updateProject,
  deleteProject,
  subscribeToChanges,
  type PortfolioData,
} from "@/lib/portfolio-data";

export function AdminExample() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData().then(setData).finally(() => setLoading(false));
  }, []);

  // Subscribe to changes
  useEffect(() => {
    return subscribeToChanges(setData);
  }, []);

  const handleAddProject = async (projectData) => {
    const newProject = await addProject(projectData);
    if (newProject) {
      alert("Project added!");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error loading data</div>;

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={() => handleAddProject({
        title: "My Project",
        description: "...",
        // ... other fields
      })}>
        Add Project
      </button>
      <div>
        {data.projects.map(p => (
          <div key={p.id}>{p.title}</div>
        ))}
      </div>
    </div>
  );
}
```

---

## Error Handling

All functions handle errors gracefully:

```typescript
try {
  await addProject({ /* data */ });
} catch (error) {
  console.error("Operation failed:", error);
  // Falls back to localStorage if Supabase unavailable
}
```

---

## LocalStorage Fallback

If Supabase is not configured (no `.env` variables):
- All operations work with localStorage
- Perfect for development/testing
- Changes only persist on the same device
- No real-time sync

When configured with Supabase:
- All data persists in database
- Real-time sync across devices
- Automatic error handling with fallback

---

## Performance Tips

1. **Batch operations**: Group multiple changes together
2. **Debounce subscriptions**: Don't update UI on every single change
3. **Pagination**: For large project lists, load in chunks
4. **Caching**: Cache `loadData()` results when appropriate

---

## Security Considerations

- `loadData()` is public (anyone can read)
- `addProject()`, `updateProject()`, etc. require admin password
- Supabase RLS policies enforce server-side security
- Never expose sensitive data in project descriptions

---

## Troubleshooting

### Functions return null/fail silently
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Check Supabase project status

### Real-time not working
- Verify `subscribeToChanges()` is called
- Check WebSocket connection in DevTools Network tab
- Ensure real-time is enabled on Supabase tables

### localStorage used instead of Supabase
- This is intentional fallback behavior
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Check console for configuration warnings

---

For complete setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
