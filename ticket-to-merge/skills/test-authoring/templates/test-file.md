# Test file template

Adapt this. Replace the entry point, the ids and the expectations with the ones from the approved test list and the briefing's interface. The placeholders in angle brackets are not real values; the real ones come from the briefing.

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { unlinkSync } from 'fs';
import app from '../../src/server.js';
import { initDb, closeDb } from '../../src/db/index.js';

const DB_PATH = '/tmp/test-<feature>.db';

beforeEach(async () => {
  await initDb(DB_PATH);
});

afterEach(() => {
  closeDb();
  try {
    unlinkSync(DB_PATH);
  } catch {
    // ignore
  }
});

describe('<ID> <ticket title>', () => {
  it('[TC-01] <the scenario, in plain words>', async () => {
    const res = await request(app).get('<entry point from the briefing>').query({ <input from the briefing> });
    expect(res.status).toBe(200);
    expect(res.text).toContain('<what the briefing says is returned>');
  });

  it('[TC-02] <an error scenario>', async () => {
    const res = await request(app).get('<entry point from the briefing>').query({ <invalid input> });
    expect(res.status).toBe(<error status from the briefing>);
  });
});
```

Notes:

- The assertions follow the briefing's success and error shapes. If the shape is HTML, check the text. If it is JSON, check the fields.
- Use a different `DB_PATH` per file so files do not clash when Vitest runs them in parallel.
- Each `it` covers one row of the list.
