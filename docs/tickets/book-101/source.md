ACCEPTANCE CRITERIA
• A query matches title or author: partial, case-insensitive
• An empty query returns all books
• Input is trimmed; over [100] characters returns a validation error
• SQL is parameterised: no string-built queries
• Vitest covers each criterion; npm run test:run passes
Interface: [endpoint and response shape]
