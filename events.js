// Events management for REES website
class EventsManager {
    constructor() {
        this.events = [];
        this.googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxSl-xfbevrSkY2ssIj1dRuToIlw1xIwQ_ZuZ06Bg8W-lQmKPj3XsrGvTyIEW6xHoI7dCHkhYaB0ha/pub?gid=217527004&single=true&output=csv';
    }

    // Fetch events from Google Sheet
    async fetchEvents() {
        try {
            this.showLoading();
            
            // First try the original URL
            let response = await fetch(this.googleSheetUrl, {
                method: 'GET',
                mode: 'cors'
            });
            
            // If we get a redirect, follow it
            if (response.redirected) {
                response = await fetch(response.url, {
                    method: 'GET',
                    mode: 'cors'
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            this.parseCSV(csvText);
            this.sortEvents();
            this.displayEvents();
        } catch (error) {
            console.error('Error fetching events:', error);
            // Try to use a proxy service as fallback
            this.fetchEventsWithProxy();
        }
    }

    // Fallback method using a CORS proxy
    async fetchEventsWithProxy() {
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(this.googleSheetUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`Proxy fetch failed: ${response.status}`);
            }
            
            const csvText = await response.text();
            this.parseCSV(csvText);
            this.sortEvents();
            this.displayEvents();
        } catch (error) {
            console.error('Error fetching events with proxy:', error);
            this.displayError();
        }
    }

    // Parse CSV data
    parseCSV(csvText) {
        try {
            const lines = csvText.trim().split('\n');
            if (lines.length < 2) {
                console.warn('CSV has insufficient data');
                return;
            }
            
            const headers = lines[0].split(',');
            console.log('CSV Headers:', headers);
            
            this.events = [];
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue; // Skip empty lines
                
                const values = this.parseCSVLine(line);
                console.log(`Line ${i}:`, values);
                
                if (values.length >= 7) { // We need at least 7 values for a valid event
                    const event = {
                        date: values[0] || '',
                        weekday: values[1] || '',
                        title: values[2] || '',
                        location: values[3] || '',
                        startTime: values[4] || '',
                        endTime: values[5] || '',
                        startISO: values[6] || '',
                        endISO: values[7] || values[6] || '', // Fallback to start time if no end time
                        notes: values[8] || ''
                    };
                    
                    // Validate the event has required fields
                    if (event.title && event.startISO) {
                        // Only add future events
                        const eventDate = new Date(event.startISO);
                        const now = new Date();
                        
                        // Check if the date is valid
                        if (!isNaN(eventDate.getTime()) && eventDate >= now) {
                            this.events.push(event);
                        } else {
                            console.log(`Skipping past event: ${event.title} on ${event.startISO}`);
                        }
                    }
                }
            }
            
            console.log(`Parsed ${this.events.length} future events`);
        } catch (error) {
            console.error('Error parsing CSV:', error);
            this.events = [];
        }
    }

    // Parse CSV line handling quoted values
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // Sort events by date
    sortEvents() {
        this.events.sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
    }

    // Format time for display
    formatTime(time24h) {
        if (!time24h) return '';
        
        const [hours, minutes] = time24h.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Create event card HTML
    createEventCard(event) {
        const startTime = this.formatTime(event.startTime);
        const endTime = this.formatTime(event.endTime);
        const formattedDate = this.formatDate(event.startISO);
        
        return `
            <div class="event-card">
                <div class="event-header">
                    <h3>${event.title}</h3>
                </div>
                <div class="event-content">
                    <div class="event-topic">${event.title}</div>
                    <div class="event-details">
                        <div class="event-detail">
                            <i class="fas fa-calendar"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-clock"></i>
                            <span>${startTime} - ${endTime}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        ${event.notes ? `<div class="event-detail">
                            <i class="fas fa-info-circle"></i>
                            <span>${event.notes}</span>
                        </div>` : ''}
                    </div>
                    <div class="event-type">${event.weekday} Event</div>
                    <div class="calendar-buttons">
                        <a href="${this.generateGoogleCalendarLink(event)}" class="calendar-btn google" target="_blank">
                            <i class="fab fa-google"></i>
                            Add to Google Calendar
                        </a>
                        <a href="${this.generateOutlookCalendarLink(event)}" class="calendar-btn outlook" target="_blank">
                            <i class="fas fa-calendar-plus"></i>
                            Add to Outlook
                        </a>
                        <a href="${this.generateAppleCalendarLink(event)}" class="calendar-btn apple" target="_blank">
                            <i class="fab fa-apple"></i>
                            Add to Apple Calendar
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate Google Calendar link
    generateGoogleCalendarLink(event) {
        const startDate = new Date(event.startISO);
        const endDate = new Date(event.endISO);
        
        const startStr = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const endStr = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            dates: `${startStr}/${endStr}`,
            details: `REES Event: ${event.title}\n\nLocation: ${event.location}\n\n${event.notes}`,
            location: event.location
        });
        
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    // Generate Outlook Calendar link
    generateOutlookCalendarLink(event) {
        const startDate = new Date(event.startISO);
        const endDate = new Date(event.endISO);
        
        const params = new URLSearchParams({
            path: '/calendar/action/compose',
            rru: 'addevent',
            subject: event.title,
            startdt: startDate.toISOString(),
            enddt: endDate.toISOString(),
            body: `REES Event: ${event.title}\n\nLocation: ${event.location}\n\n${event.notes}`,
            location: event.location
        });
        
        return `https://outlook.live.com/calendar/0/${params.toString()}`;
    }

    // Generate Apple Calendar link
    generateAppleCalendarLink(event) {
        const startDate = new Date(event.startISO);
        const endDate = new Date(event.endISO);
        
        const startStr = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const endStr = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        
        return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0D%0AVERSION:2.0%0D%0ABEGIN:VEVENT%0D%0ADTSTART:${startStr}%0D%0ADTEND:${endStr}%0D%0ASUMMARY:${encodeURIComponent(event.title)}%0D%0ADESCRIPTION:${encodeURIComponent(`REES Event: ${event.title}\n\nLocation: ${event.location}\n\n${event.notes}`)}%0D%0ALOCATION:${encodeURIComponent(event.location)}%0D%0AEND:VEVENT%0D%0AEND:VCALENDAR`;
    }

    // Display events on the page
    displayEvents() {
        const eventsGrid = document.querySelector('.events-grid');
        const upcomingEventsSection = document.querySelector('.meeting-card');
        
        if (eventsGrid) {
            // Events page
            if (this.events.length === 0) {
                eventsGrid.innerHTML = `
                    <div class="event-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 2rem;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">No upcoming events</h3>
                        <p style="color: var(--gray); font-size: 1.1rem; line-height: 1.6;">We are currently planning our upcoming events. Stay tuned for exciting opportunities to learn, network, and grow in real estate and entrepreneurship!</p>
                        <p class="calendar-note">When events are announced, you'll be able to add them to your calendar with one click!</p>
                    </div>
                `;
            } else {
                eventsGrid.innerHTML = this.events.map(event => this.createEventCard(event)).join('');
            }
        }
        
        if (upcomingEventsSection) {
            // Home page
            if (this.events.length === 0) {
                upcomingEventsSection.innerHTML = `
                    <p style="text-align: center; font-size: 1.1rem; line-height: 1.6; color: var(--gray);">
                        We are currently planning our upcoming events. Stay tuned for exciting opportunities to learn, network, and grow in real estate and entrepreneurship!
                    </p>
                `;
            } else {
                const nextEvent = this.events[0];
                upcomingEventsSection.innerHTML = `
                    <div style="text-align: center;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">Next Event</h3>
                        <div style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 1rem;">
                            <h4 style="color: var(--black); margin-bottom: 0.5rem;">${nextEvent.title}</h4>
                            <p style="color: var(--gray); margin-bottom: 0.5rem;">
                                <i class="fas fa-calendar" style="margin-right: 0.5rem; color: var(--primary);"></i>
                                ${this.formatDate(nextEvent.startISO)}
                            </p>
                            <p style="color: var(--gray); margin-bottom: 0.5rem;">
                                <i class="fas fa-clock" style="margin-right: 0.5rem; color: var(--primary);"></i>
                                ${this.formatTime(nextEvent.startTime)} - ${this.formatTime(nextEvent.endTime)}
                            </p>
                            <p style="color: var(--gray); margin-bottom: 1rem;">
                                <i class="fas fa-map-marker-alt" style="margin-right: 0.5rem; color: var(--primary);"></i>
                                ${nextEvent.location}
                            </p>
                            <a href="events.html" class="cta-button" style="display: inline-block; text-decoration: none;">View All Events</a>
                        </div>
                        <p style="color: var(--gray); font-size: 0.9rem;">
                            <a href="events.html" style="color: var(--primary); text-decoration: none;">View all ${this.events.length} upcoming events →</a>
                        </p>
                    </div>
                `;
            }
        }
    }

    // Show loading state
    showLoading() {
        const eventsGrid = document.querySelector('.events-grid');
        const upcomingEventsSection = document.querySelector('.meeting-card');
        
        const loadingMessage = `
            <div class="event-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 2rem;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <h3 style="color: var(--primary); margin: 1rem 0;">Loading events...</h3>
                <p style="color: var(--gray); font-size: 1.1rem; line-height: 1.6;">Please wait while we fetch the latest events from our calendar.</p>
            </div>
        `;
        
        if (eventsGrid) {
            eventsGrid.innerHTML = loadingMessage;
        }
        
        if (upcomingEventsSection) {
            upcomingEventsSection.innerHTML = `
                <div style="text-align: center;">
                    <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p style="color: var(--gray); font-size: 1.1rem; line-height: 1.6; margin-top: 1rem;">
                        Loading upcoming events...
                    </p>
                </div>
            `;
        }
    }

    // Display error message
    displayError() {
        const eventsGrid = document.querySelector('.events-grid');
        const upcomingEventsSection = document.querySelector('.meeting-card');
        
        const errorMessage = `
            <div class="event-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 2rem;">
                <h3 style="color: #dc3545; margin-bottom: 1rem;">Unable to load events</h3>
                <p style="color: var(--gray); font-size: 1.1rem; line-height: 1.6;">We're experiencing technical difficulties loading our events. Please check back later or contact us for the latest information.</p>
            </div>
        `;
        
        if (eventsGrid) {
            eventsGrid.innerHTML = errorMessage;
        }
        
        if (upcomingEventsSection) {
            upcomingEventsSection.innerHTML = `
                <p style="text-align: center; font-size: 1.1rem; line-height: 1.6; color: var(--gray);">
                    We're experiencing technical difficulties loading our events. Please check back later or contact us for the latest information.
                </p>
            `;
        }
    }

    // Initialize events
    init() {
        console.log('EventsManager initializing...');
        this.fetchEvents();
        
        // Refresh events every 30 minutes
        setInterval(() => {
            console.log('Refreshing events...');
            this.fetchEvents();
        }, 30 * 60 * 1000);
    }
}

// Initialize events when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const eventsManager = new EventsManager();
    eventsManager.init();
});
