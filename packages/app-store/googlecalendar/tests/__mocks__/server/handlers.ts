import { rest } from "msw";

import { testExpiryDate } from "../../gcal.test";

export const handlers = [
  // Handles a POST request
  rest.get("https://accounts.google.com/o/oauth2/v2/auth", (req, res, ctx) => {
    return res(
      // Respond with a 200 status code
      ctx.status(200)
    );
  }),
  rest.get("https://accounts.google.com/v3/signin/identifier", (req, res, ctx) => {
    return res(
      // Respond with a 200 status code
      ctx.status(200)
    );
  }),

  rest.post(`https://oauth2.googleapis.com/token`, (req, res, ctx) => {
    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json({
        access_token: "access_token",
        refresh_token: "refresh_token",
        expiry_date: testExpiryDate,
        scope:
          "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
        token_type: "Bearer",
      })
    );
  }),
  rest.get(`/api/integrations/googlecalendar/add`, (req, res, ctx) => {
    return res(
      // Respond with a 200 status code
      ctx.status(200)
    );
  }),
  rest.post("https://www.googleapis.com/calendar/v3/calendars/primary/events", async (req, res, ctx) => {
    const eventData = await req.json();
    return res(
      ctx.status(200),
      ctx.json({
        ...eventData,
        id: 12345,
        iCalUID: 67890,
      })
    );
  }),
];
// https://accounts.google.com/v3/signin/identifier