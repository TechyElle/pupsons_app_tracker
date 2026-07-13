import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-37669f54/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== CELL GROUPS =====
app.get("/make-server-37669f54/cell-groups", async (c) => {
  try {
    const groups = await kv.getByPrefix("cellGroup:");
    return c.json({ success: true, data: groups });
  } catch (error) {
    console.log("Error fetching cell groups:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/cell-groups", async (c) => {
  try {
    const body = await c.req.json();
    const id = `cellGroup:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating cell group:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/cell-groups/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Cell group not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating cell group:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-37669f54/cell-groups/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting cell group:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== MEMBERS =====
app.get("/make-server-37669f54/members", async (c) => {
  try {
    const members = await kv.getByPrefix("member:");
    return c.json({ success: true, data: members });
  } catch (error) {
    console.log("Error fetching members:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/members", async (c) => {
  try {
    const body = await c.req.json();
    const id = `member:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating member:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/members/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Member not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating member:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-37669f54/members/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting member:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== EVENTS =====
app.get("/make-server-37669f54/events", async (c) => {
  try {
    const events = await kv.getByPrefix("event:");
    return c.json({ success: true, data: events });
  } catch (error) {
    console.log("Error fetching events:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/events", async (c) => {
  try {
    const body = await c.req.json();
    const id = `event:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating event:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Event not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating event:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-37669f54/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting event:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== EVANGELISM/WINNING =====
app.get("/make-server-37669f54/evangelism", async (c) => {
  try {
    const records = await kv.getByPrefix("evangelism:");
    return c.json({ success: true, data: records });
  } catch (error) {
    console.log("Error fetching evangelism records:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/evangelism", async (c) => {
  try {
    const body = await c.req.json();
    const id = `evangelism:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating evangelism record:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/evangelism/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Evangelism record not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating evangelism record:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-37669f54/evangelism/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting evangelism record:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== TRAINING =====
app.get("/make-server-37669f54/training", async (c) => {
  try {
    const records = await kv.getByPrefix("training:");
    return c.json({ success: true, data: records });
  } catch (error) {
    console.log("Error fetching training records:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/training", async (c) => {
  try {
    const body = await c.req.json();
    const id = `training:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating training record:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/training/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Training record not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating training record:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== FUNDRAISING =====
app.get("/make-server-37669f54/fundraising", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("fundraising:");
    return c.json({ success: true, data: campaigns });
  } catch (error) {
    console.log("Error fetching fundraising campaigns:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/fundraising", async (c) => {
  try {
    const body = await c.req.json();
    const id = `fundraising:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating fundraising campaign:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/fundraising/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Fundraising campaign not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating fundraising campaign:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== CONTENT CALENDAR =====
app.get("/make-server-37669f54/content-calendar", async (c) => {
  try {
    const items = await kv.getByPrefix("content:");
    return c.json({ success: true, data: items });
  } catch (error) {
    console.log("Error fetching content calendar:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/content-calendar", async (c) => {
  try {
    const body = await c.req.json();
    const id = `content:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating content calendar item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/content-calendar/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Content calendar item not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating content calendar item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-37669f54/content-calendar/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting content calendar item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== MEETING MINUTES =====
app.get("/make-server-37669f54/meeting-minutes", async (c) => {
  try {
    const minutes = await kv.getByPrefix("minutes:");
    return c.json({ success: true, data: minutes });
  } catch (error) {
    console.log("Error fetching meeting minutes:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-37669f54/meeting-minutes", async (c) => {
  try {
    const body = await c.req.json();
    const id = `minutes:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating meeting minutes:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-37669f54/meeting-minutes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Meeting minutes not found" }, 404);
    }
    await kv.set(id, { ...existing, ...body, updatedAt: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating meeting minutes:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-37669f54/meeting-minutes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting meeting minutes:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== ANALYTICS/KPI =====
app.get("/make-server-37669f54/analytics", async (c) => {
  try {
    const [cellGroups, members, events, evangelism, training] = await Promise.all([
      kv.getByPrefix("cellGroup:"),
      kv.getByPrefix("member:"),
      kv.getByPrefix("event:"),
      kv.getByPrefix("evangelism:"),
      kv.getByPrefix("training:")
    ]);

    // Calculate KPIs
    const activeCellGroups = cellGroups.filter(g => g.status === "Active").length;
    const totalMembers = members.length;
    const potentialLeaders = evangelism.filter(e => e.conversionDate).length;
    const trainedMembers = training.filter(t => t.certificationStatus === "Completed").length;
    
    // Calculate attendance rate from recent events
    const recentEvents = events.slice(-10);
    const avgAttendance = recentEvents.length > 0 
      ? recentEvents.reduce((sum, e) => sum + (e.attendance || 0), 0) / recentEvents.length 
      : 0;

    return c.json({
      success: true,
      data: {
        totalCellGroups: cellGroups.length,
        activeCellGroups,
        totalMembers,
        potentialLeaders,
        trainedMembers,
        avgAttendance,
        attendanceRate: totalMembers > 0 ? (avgAttendance / totalMembers * 100).toFixed(1) : 0,
        trainingCompletionRate: totalMembers > 0 ? (trainedMembers / totalMembers * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);