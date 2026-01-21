# Admin Dashboard Quick Start Guide

## 🚀 Quick Access

**Access URL:** `/admin`
**Authorized Users:** 
- `albhyrytwamrwhybusiness@gmail.com`
- `oryno80@gmail.com`

## 📝 Basic Operations

### 1️⃣ View Dashboard Overview
When you first log in, you'll see:
- **Key Metrics Cards** - Total feedback count and status breakdown
- **30-Day Trend Chart** - Feedback submission volume over time
- **Status Distribution** - Visual breakdown of all feedback statuses

### 2️⃣ Find Feedback Items

**Using Search:**
- Type in search box to find by title, description, or user name
- Search updates in real-time

**Using Filters:**
- **Status Filter** - Show only: Pending, In Review, Planned, In Progress, or Completed
- **Category Filter** - Show only: Bug, Feature, Improvement, or General
- **Date Filter** - Show only: Today, Last 7 Days, or Last Month

**Pagination:**
- 10 items shown per page
- Use Previous/Next buttons to navigate

### 3️⃣ View Feedback Details

1. Click **"View Details"** button on any feedback item
2. A modal will open showing:
   - Original feedback title and description
   - Submitter information
   - Vote and comment counts
   - Current status
   - All admin responses (if any)

### 4️⃣ Update Feedback Status

1. Open feedback details (see step 3)
2. In **"Status & Admin Actions"** section:
   - Select new status from dropdown
   - Add admin notes if needed
   - Click **"Save Status & Notes"**
3. Status updates immediately
4. Action is logged in audit trail

**Available Statuses:**
- 🟡 **Pending** - New, awaiting review
- 🔵 **In Review** - Currently being evaluated
- 🟢 **Planned** - Scheduled for implementation
- 🟣 **In Progress** - Currently being worked on
- 🔷 **Completed** - Done and deployed

### 5️⃣ Send Admin Response

1. Open feedback details
2. Scroll to **"Admin Responses"** section
3. Type your response in the text area
4. Click **"Send Response"**
5. Response is automatically attributed to "Do Stuff Team"

**Note:** Responses are public and visible to users on feedback board

### 6️⃣ Sign Out

Click **"Sign Out"** button in top-right corner
- Session ends immediately
- You'll be redirected to home page

## ⏱️ Session Management

- **Timeout:** 30 minutes of inactivity
- **Warning:** Alert appears at 5 minutes before timeout
- **Activity:** Tracked by mouse movement, keyboard, and clicks
- **Keep Alive:** Any activity resets the timer

## 🔒 Security Features

✅ Email-based authorization (only 2 admin emails)
✅ All access attempts logged
✅ Rate limiting on operations
✅ Session timeouts for inactive sessions
✅ All admin actions audited
✅ Row-level security on database

## 📊 Dashboard Sections

### Overview Panel
- Quick view of all metrics
- Visual charts for trending and status distribution
- Updates automatically

### Feedback Management Table
- List of all feedback submissions
- Sortable columns
- Advanced filtering options
- Responsive design

### Feedback Detail Modal
- Full feedback information
- Reply history
- Status update controls
- Admin notes field
- Response composition interface

## 🎯 Common Tasks

**Task: Change feedback from "Pending" to "In Progress"**
1. Search for the feedback
2. Click "View Details"
3. Select "In Progress" from Status dropdown
4. Click "Save Status & Notes"

**Task: Respond to user feedback**
1. Open feedback details
2. Scroll to "Admin Responses"
3. Type your response
4. Click "Send Response"

**Task: Filter by bug reports**
1. Use Category filter → "Bug"
2. Can combine with Status filter
3. Results update in real-time

**Task: Find feedback from past week**
1. Use Date filter → "Last 7 Days"
2. Can combine with other filters
3. Click Previous/Next for pagination

## ⚡ Tips & Tricks

- **Quick Search:** Type in search box for instant results
- **Multiple Filters:** Combine filters for precise results
- **Bulk View:** Open multiple details modals in different browser tabs
- **Refresh Metrics:** Metrics update automatically, no manual refresh needed
- **Keyboard Nav:** Tab through controls for keyboard accessibility

## ❌ Troubleshooting

**"Access Denied" message?**
- Verify you're using correct email address
- Check email hasn't changed
- Clear browser cache

**Can't find feedback?**
- Try different search term
- Check status filter isn't hiding it
- Clear filters and search

**Response didn't send?**
- Check your internet connection
- Verify you typed message in text area
- Check browser console for errors

**Session timed out?**
- Inactivity for 30+ minutes triggers timeout
- Move mouse or type to stay active
- Log back in when prompted

## 📱 Mobile Access

Dashboard is fully responsive on mobile:
- Tap menu icon (☰) to toggle sidebar
- All filters and controls accessible
- Swipe to navigate feedback list
- Tap "View Details" to open modals

## 🔔 What Gets Logged?

Every admin action is tracked:
- Login attempts (success/failure)
- Status updates
- Admin responses sent
- Session duration
- IP address and browser info

Check logs in database table `admin_access_logs` and `admin_audit_log`

---

**Need help?** Check the main documentation at: `/md/admin/ADMIN-DASHBOARD-IMPLEMENTATION.md`

**Last Updated:** January 21, 2026
