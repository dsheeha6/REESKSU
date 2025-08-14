# REES Events System

This document explains how the automatic events system works for the REES website.

## Overview

The REES website now automatically displays upcoming events from a Google Sheet. Events are fetched in real-time and displayed on both the home page and events page, sorted chronologically.

## How It Works

### 1. Google Sheet Integration
- Events are stored in a Google Sheet with the following columns:
  - `date`: Event date (YYYY-MM-DD format)
  - `weekday`: Day of the week
  - `title`: Event title/description
  - `location`: Event location
  - `start_time_24h`: Start time in 24-hour format (HH:MM)
  - `end_time_24h`: End time in 24-hour format (HH:MM)
  - `start_iso`: ISO timestamp for start time
  - `end_iso`: ISO timestamp for end time
  - `notes`: Additional event information (optional)

### 2. Automatic Updates
- Events are fetched automatically when the page loads
- Events refresh every 30 minutes
- Only future events are displayed (past events are automatically filtered out)
- Events are sorted chronologically by start time

### 3. Display Features
- **Home Page**: Shows the next upcoming event with a link to view all events
- **Events Page**: Shows all upcoming events in a grid layout
- **Calendar Integration**: Each event has buttons to add to Google Calendar, Outlook, or Apple Calendar

## File Structure

- `events.js` - Main events management system
- `events.html` - Events page (updated to use automatic events)
- `index.html` - Home page (updated to show next event)
- `styles.css` - Styling for events (includes loading animation)

## Google Sheet Setup

### 1. Make the Sheet Public
1. Open your Google Sheet
2. Click "Share" in the top right
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Copy the sharing link

### 2. Get the CSV Export URL
1. In the sharing link, replace `/edit` with `/pub`
2. Add `?output=csv` to the end
3. The final URL should look like:
   ```
   https://docs.google.com/spreadsheets/d/e/[SHEET_ID]/pub?output=csv
   ```

### 3. Update the Website
1. Open `events.js`
2. Update the `googleSheetUrl` variable with your new URL
3. Save the file

## Adding New Events

To add a new event:

1. **Add to Google Sheet**: Simply add a new row to your Google Sheet
2. **Automatic Update**: The website will automatically fetch and display the new event within 30 minutes
3. **Manual Refresh**: Users can refresh the page to see new events immediately

## Event Format Requirements

### Required Fields
- `title`: Event name/description
- `start_iso`: Start time in ISO format (YYYY-MM-DD HH:MM:SS)

### Optional Fields
- `location`: Where the event takes place
- `start_time_24h` & `end_time_24h`: For time display
- `notes`: Additional information
- `weekday`: Day of the week (auto-generated)

### Date/Time Format
- **Date**: YYYY-MM-DD (e.g., 2025-09-02)
- **Time**: HH:MM in 24-hour format (e.g., 18:00 for 6:00 PM)
- **ISO Timestamp**: YYYY-MM-DD HH:MM:SS (e.g., 2025-09-02 18:00:00)

## Troubleshooting

### Events Not Loading
1. Check the browser console for error messages
2. Verify the Google Sheet URL is correct and accessible
3. Ensure the sheet is published and publicly accessible
4. Check that the CSV format matches the expected structure

### CORS Issues
- The system includes a fallback proxy service for CORS issues
- If problems persist, check the Google Sheet sharing settings

### Testing
- Use `test-events.html` to debug the events system
- Check the console for detailed logging information

## Maintenance

### Regular Tasks
- Monitor the Google Sheet for data accuracy
- Ensure all events have proper dates and times
- Remove past events (optional - they're automatically filtered)

### Updates
- The system automatically handles most updates
- No manual website updates needed for new events
- Calendar integration works automatically

## Security Notes

- The Google Sheet is publicly accessible (read-only)
- No sensitive information should be stored in the events sheet
- The system only reads data, never writes back to the sheet

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the Google Sheet is accessible
3. Test with the `test-events.html` page
4. Ensure all required fields are present in the sheet

---

**Last Updated**: August 2025
**Version**: 1.0
