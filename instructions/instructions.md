For the Product Concept which we are discussing in this chat. Give me instructions.md file which I can provide to AI Agent Builder. I am giving details of this instructions.md file. Please give me a single ready to download instructions.md file, do not give any other content.

General:

# Step 1: Define the Project First

Before writing any code, you must:

1. Create a file called project_specs.md

2. Clearly define:

- What the user can send as input

- What workflows exist

- What tools are being used (Telegram, Airtable, Modal, etc.)

- What outputs are expected

- Where data is stored

- Where the system will be deployed

- What “done” looks like

3. Show the file

4. Wait for approval

No code should be written before this file is approved.

## . Universal Coding Standards

* Strict TypeScript: All code must be written in TypeScript. Avoid using the any type. Define strict interfaces/types for all API responses, props, and state.

* Modularity: Keep components small and modular. Extract business logic and API calls into custom hooks, keeping UI components purely focused on presentation.

* Environment Security: Never hardcode API keys or secrets. Always use a .env file for local development and provide a .env.example file.

* Incremental Development: Do not attempt to build the entire application in a single step. Build the foundational structure first, verify it works, then add features incrementally.

* Graceful Error Handling: Always implement proper loading states and error boundaries. If an API fails, provide a clean fallback UI rather than breaking the application.

* Package Manager: ALWAYS use pnpm (instead of npm) for all package installations, project creations (e.g., pnpm create vite), and script executions (`pnpm run dev`) to save disk space. Never use npm.

# Section: Deployment Standards (GitHub Pages)

To ensure consistency across projects, follow these standard steps for deploying Vite-based applications to GitHub Pages.

## 1. Environment Configuration

* Base Path: In vite.config.ts, you MUST set the base property to match the GitHub repository name. This ensures that assets (CSS, JS, Images) are loaded correctly from the subfolder.

```ts

export default defineConfig({

base: ‘/YOUR-REPOSITORY-NAME/’,

// ... rest of config

})

```

## 2. Deployment Tooling

* Package: Install gh-pages as a development dependency using pnpm.

```bash

pnpm add -D gh-pages

```

* Scripts: Add the following deployment scripts to package.json:

```json

“scripts”: {

“predeploy”: “pnpm run build”,

“deploy”: “gh-pages -d dist”

}

```

## 3. Launch Workflow

Follow this 3-step sequence for every deployment but before moving to GitHub get my confirmation first:

1. Source Sync: Commit and push all source code changes to the main branch.

2. Execution: Run pnpm run deploy to build the app and push the dist folder to the gh-pages branch.

3. Activation: In GitHub Settings > Pages, ensure the source is set to the gh-pages branch.

## 4. Troubleshooting Checklist

* Clean Build: If the build fails, check for unused imports or variables. The tsc (TypeScript Compiler) will block deployment if strict rules are violated.

* Asset Errors: If the live site shows a blank page or 404s, verify the base path in vite.config.ts matches the repository name exactly (including trailing slashes).

##Living Documentation (`explainer.md`)

##before moving any code change to Github please ask first for the confirmation because I want to test locally first. Do not move any code change to production without confirmation. Please remember to ask for the confirmation every time there is a change and you want to move it to Github.

Continue to update Prompts.md file as well if there are major new changes shared during the development and new feature addition in the app.