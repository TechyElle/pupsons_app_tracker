# Web Application Development Standards (HTML, CSS, & JS)

## 1. Repository & Source Control Lifecycle

### 1.1 Project Structure Naming
* **Convention:** Always use lowercase `kebab-case` for front-end assets, directories, and web repositories. 
* **Prohibitions:** Never use generic or sequential academic placeholders like `WebAssignment1`, `JSProgram`, or `FrontendCode`.
* **Requirement:** The directory names must explicitly mirror the core business utility or view layer components of the application.
  * *Correct:* `eye-tracking-dashboard`
  * *Incorrect:* `JS_Project_1`

### 1.2 Web-App Directory Layout Blueprint
Keep configuration files in the root, and organize source code logically within separate assets directories:
```text
eye-tracking-dashboard/
├── index.html
├── css/
│   └── main-styles.css
├── js/
│   ├── config-data.js
│   └── UI-engine.js
└── README.md
```

---

## 2. Naming Conventions & Casing

Web element layers rely heavily on specific casing methods depending on the target language context.

| Code Element | Language | Case Style | Pattern Definition | Example / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| **File Names** | HTML / CSS / JS | `kebab-case` | `lowercase-with-hyphens` | `main-styles.css`, `ui-engine.js` |
| **CSS Classes** | CSS / HTML | `kebab-case` | `lowercase-with-hyphens` | `.submit-button`, `.user-card` |
| **JS Class Names** | JavaScript | `PascalCase` | `CapitalizedCompoundWords` | `UserInterfaceEngine` |
| **JS Methods / Func**| JavaScript | `camelCase` | `lowercaseFirstWord` | `calculateCoordinates()` |
| **JS Variables** | JavaScript | `camelCase` | `lowercaseFirstWord` | `currentAge` (**Single letters like `x`, `y`, `z` are banned** unless inside short loops) |

### Quick Reference Summary
* **PascalCase:** `MouseUsingEyes`
* **camelCase:** `mouseUsingEyes`
* **kebab-case:** `mouse-using-eyes` *(Standard pattern for HTML classes, ids, and filenames)*

---

## 3. Architectural Design Rules

### 3.1 Object-Oriented Integration (OOP) in JavaScript
All primary frontend operational components must be designed within modular JavaScript ES6+ classes or explicit structural modules. Avoid wrapping loose scripts directly into global browser window space.

### 3.2 Data Separation Architecture (Web Layer)
Every functional view layer component must be strictly partitioned into exactly two file scopes:
1. **The Configuration Data Holder (`config-data.js`):** A file or class containing static definitions, configurations, initial states, or structure definitions. It must not handle logic.
2. **The Execution Engine (`ui-engine.js`):** An operational controller file that imports or consumes the data holder, attaches runtime events, handles rendering transformations, and processes application logic.

### 3.3 Strict Try-Catch Perimeter
* All asynchronous operations (`async/await`), fetch requests, DOM manipulation hooks, or mathematical conversions must reside inside structured `try-catch` blocks.
* Runtime errors are forbidden from crashing silently into the browser dev console without an explicit client-facing warning interface or a structural safe-failing logged state.

### 3.4 HTML/CSS Semantics & Line Length
* Always use Semantic HTML5 layouts (`<main>`, `<section>`, `<article>`, `<header>`). Never wrap layout groups inside recursive `<div>` nesting blocks.
* Keep line metrics organized for terminal readability:
  * **HTML / CSS Line Threshold:** Limit markup lines to **100 characters** max.
  * **JS Code Lines:** Limit functional code strings to **79 characters** max.
  * **JS Comments / Docstrings:** Limit text line wraps to **72 characters** max.

---

## 4. Documentation & Commenting Style

### 4.1 Human-Centric Style over Tutorial Text
* Write short, direct, plain-spoken inline descriptions focusing on *why* the block exists.
* Do **not** use procedural numbers or tutorial terminology (e.g., `# Step 1: Query selector`).

* **Incorrect (Tutorial Style):**
  ```javascript
  // Step 4.2: Target the DOM element matching user-profile and read the string attribute value
  const profileNode = document.getElementById("user-profile");
  ```
* **Correct (Human-Centric Style):**
  ```javascript
  // pull profile wrapper from document structure
  const profileNode = document.getElementById("user-profile");
  ```

---

## 5. Reference Blueprint Implementation

This full stack web example demonstrates clean naming decoupling, error handling, semantic design, and human-centric documentation.

### 5.1 The Document Tree Structure (`index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eye Tracking Calibration Dashboard</title>
    <link rel="stylesheet" href="css/main-styles.css">
</head>
<body>

    <main class="dashboard-wrapper">
        <header class="app-header">
            <h1>User Milestone Interface</h1>
        </header>

        <section class="profile-card">
            <p id="profile-display">Initializing configuration engine...</p>
        </section>
    </main>

    <script type="module" src="js/ui-engine.js"></script>
</body>
</html>
```

### 5.2 The Configuration Data Holder (`js/config-data.js`)
```javascript
// js/config-data.js

export class UserProfile {
    // holds clean profile structural properties and states
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
```

### 5.3 The Operational View Controller (`js/ui-engine.js`)
```javascript
// js/ui-engine.js
import { UserProfile } from "./config-data.js";

class UiEngine {
    // manages runtime event handlers and view transformations
    constructor(profile) {
        this.profile = profile;
        this.displayNode = document.getElementById("profile-display");
    }

    renderMilestones() {
        try {
            if (!this.displayNode) {
                throw new Error("Target DOM interface target missing.");
            }

            let viewOutput = `Loaded Target: \${this.profile.name}<br>`;

            // loop through the next 3 projection years
            for (let year = 1; year <= 3; year++) {
                const futureAge = this.profile.age + year;

                // check for odd remainder
                if (futureAge % 2 === 0) {
                    viewOutput += `In \${year} year(s): Age \${futureAge} (even)<br>`;
                } else {
                    viewOutput += `In \${year} year(s): Age \${futureAge} (odd)<br>`;
                }
            }

            this.displayNode.innerHTML = viewOutput;

        } catch (error) {
            console.error(`Interface rendering failure: \${error.message}`);
            if (this.displayNode) {
                this.displayNode.textContent = "Failed to compile milestones.";
            }
        }
    }
}

// self-executing lifecycle execution guard
(() => {
    try {
        // mock interface ingestion parameter data 
        const activeUser = new UserProfile("Danilo Madrigalejos", 28);
        const engine = new UiEngine(activeUser);

        // trigger system rendering pipeline
        engine.renderMilestones();

    } catch (criticalError) {
        console.error(`Fatal core engine execution failure: \${criticalError}`);
    }
})();
```
