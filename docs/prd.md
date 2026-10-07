# Requirements Document

## 1. Application Overview
- Application Name: Better Than Yesterday
- Application Description: A habit tracking and personal improvement web application that helps users build consistent routines, track daily progress, and stay accountable through habit logs, analytics, and an integrated push-notification reminder system. The loading screen features the visual asset extracted from /workspace/app-exdz519bsz5t/tasks/track.pdf.

## 2. Users and Core Scenarios
- Target Users:
  - Individuals seeking to establish daily habits, track routine completions, review progress statistics, and receive scheduled reminder alerts across desktop, tablet, and mobile browsers.
- Core Scenarios:
  - User launches the application and views the loading screen featuring the image extracted from /workspace/app-exdz519bsz5t/tasks/track.pdf before entering the main dashboard.
  - User creates, updates, and checks off daily habits, viewing completion streaks and progress analytics.
  - User is prompted with a friendly notification permission request explaining the purpose of reminders and grants permission.
  - User creates a reminder for a habit or task by specifying a title, scheduled date, time, and optional description.
  - At the scheduled date and time, the system triggers a web push notification with the reminder title and message.
  - User interacts with reminders to edit details, postpone (+5m, +15m, +1h, tomorrow), or delete them.
  - User navigates to Notification Settings to toggle reminder alerts, check current browser permission status, and view step-by-step guidance if permissions were previously denied.

## 3. Page Structure and Functional Description

### 3.1 Information Architecture
```text
Better Than Yesterday
├── Loading Screen (Track PDF Asset Display)
├── Main Dashboard
│   ├── Habit List & Quick Check-in
│   ├── Daily Progress & Streak Summary
│   └── Active Reminders List
├── Habit Management Modal / View
│   ├── Create / Edit Habit Form
│   └── Frequency & Target Settings
├── Reminder Management
│   ├── Permission Request Modal / Banner
│   ├── Reminder Creation / Edit Form (Title, Date, Time, Description)
│   └── Quick Postpone Action Panel (+5m, +15m, +1h, Tomorrow)
├── Analytics & History View
│   ├── Completion Trends
│   └── History Logs
└── Settings View
    ├── General Preferences
    └── Notification Settings (Permission Status, Toggle Switch, Guidance for Denied Permissions)
```

### 3.2 Page Descriptions and Functional Details

#### 3.2.1 Loading Screen
- Asset Display: Displays the visual graphic extracted from `/workspace/app-exdz519bsz5t/tasks/track.pdf` during initial app load and transitions smoothly into the main application view upon data initialization.

#### 3.2.2 Main Dashboard
- Habit Overview: Displays active habits with visual status indicators (pending, completed), current streak counts, and one-tap completion controls.
- Daily Progress Summary: Shows overall completion percentage for the current day.
- Upcoming Reminders Widget: Lists scheduled reminders for the day with direct actions to edit, postpone, or mark done.

#### 3.2.3 Habit Management
- Create / Edit Habit: Form to input habit name, category, target frequency (daily, weekly), and color tag.
- Delete / Archive Habit: Removes or archives habits from the active tracking view.

#### 3.2.4 Reminder System & Notification Flow
- Permission Request Handling:
  - Displays a clear, friendly in-app prompt explaining why notifications are helpful before triggering the native browser permission request.
  - Implements non-intrusive logic: if a user dismisses or declines the request, the app does not repeatedly prompt on subsequent page reloads.
- Reminder Creation & Editing:
  - Captures reminder title, scheduled date, scheduled time, and optional descriptive notes.
  - Supports linking reminders to specific habits or creating standalone task reminders.
  - Persists all reminders reliably to ensure data survives page refreshes and browser restarts.
- Notification Dispatch & Execution:
  - Utilizes Web Notifications to trigger alerts reliably at the exact scheduled date and time.
  - Dispatches notifications displaying the reminder title, short message, and actionable options.
- Quick Postpone Actions:
  - Allows users to postpone active reminders with preset intervals: +5 minutes, +15 minutes, +1 hour, or Tomorrow (same time next day).
  - Updates the scheduled dispatch time upon postpone selection.
- Reminder Deletion: Allows users to remove reminders when no longer needed.

#### 3.2.5 Settings & Notification Configuration
- Notification Toggle: Master switch to enable or disable push notification reminders across the application.
- Permission Status Indicator: Displays current browser notification permission state (Granted, Default, Denied).
- Permission Recovery Guidance: Displays explicit browser/device instruction steps to help users manually re-enable notifications if permission was previously blocked or denied in browser settings.

#### 3.2.6 Analytics & History View
- Habit Performance: Graphs habit consistency, completion rate, and historical streak records over weekly and monthly views.

## 4. Business Rules and Core Logic
1. Asset Fidelity: The loading screen must use the image asset extracted from `/workspace/app-exdz519bsz5t/tasks/track.pdf`.
2. Non-Intrusive Permission Strategy: The notification permission prompt is shown only when the user explicitly triggers reminder creation or opts in from settings, and must not re-prompt automatically if previously declined.
3. Scheduling & Dispatch: Reminders must be scheduled based on the user's local timezone and trigger Web Notifications when the scheduled timestamp is reached.
4. Postpone Calculation Rules:
   - +5m: Current time + 5 minutes.
   - +15m: Current time + 15 minutes.
   - +1h: Current time + 1 hour.
   - Tomorrow: Next calendar day at the same scheduled hour and minute.
5. Persistent Storage: Habit data, reminder entities, and notification preference configurations must persist across sessions and page reloads.
6. Responsive Adaptation: The layout and UI components must function consistently across mobile, tablet, and desktop viewports.

## 5. Exceptions and Edge Cases
| Exception Scenario | System Behavior |
| --- | --- |
| User denies browser notification permission | In-app reminders remain accessible in dashboard; Notification Settings displays denied status with actionable instructions to unblock in browser settings. |
| Browser does not support Web Notifications | Disables notification toggle with a message indicating device/browser incompatibility while retaining in-app reminder logs. |
| Reminder scheduled in the past | Form validation prevents submission and prompts the user to select a future date and time. |
| App opened while a scheduled notification time has passed | Displays missed reminder alert upon next app open and allows immediate completion or postponement. |
| Empty reminder title submitted | Disables submission and displays an inline validation message. |

## 6. Acceptance Criteria
1. The loading screen displays the image asset extracted from `/workspace/app-exdz519bsz5t/tasks/track.pdf` during application initialization.
2. Users can create, edit, mark complete, and delete habits with streak and progress updates reflected across the dashboard.
3. The application provides a friendly permission prompt explaining notification benefits before invoking the native browser permission dialog.
4. Users can create reminders with title, date, time, and optional description, and receive scheduled notifications at the exact specified time.
5. Users can postpone reminders by +5m, +15m, +1h, and Tomorrow, and delete existing reminders.
6. Notification Settings accurately reflects browser permission status, provides a master notification toggle, and displays guidance when permissions are denied.
7. Reminders and user configurations persist across page reloads and browser sessions.
8. The interface adapts responsively across mobile, tablet, and desktop screens without functional or layout disruption.

## 7. Out of Scope for MVP
1. Native app store releases (iOS App Store / Google Play binary distribution).
2. Location-based geofence reminder triggers.
3. Sound recording attachments for reminder notes.
4. Multi-user shared habit accountability groups.