# Room Management System - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Roles](#user-roles)
3. [Booking Rooms](#booking-rooms)
4. [Managing Bookings](#managing-bookings)
5. [Dashboard Overview](#dashboard-overview)
6. [Room Management](#room-management)
7. [User Management](#user-management)
8. [Visitor Management](#visitor-management)
9. [Statistics & Analytics](#statistics--analytics)
10. [Troubleshooting](#troubleshooting)
11. [Frequently Asked Questions](#frequently-asked-questions)

---

## Getting Started

### System Access
1. **Login**: Visit the system URL and enter your credentials
2. **Registration**: New users can register with employee ID and personal information
3. **Approval**: New accounts require admin approval before full access

### First Time Setup
1. Complete your profile information
2. Verify your department assignment
3. Review system permissions based on your role

---

## User Roles

### Employee
**Default role for all users**
- ✅ Create and manage own bookings
- ✅ View room availability
- ✅ View own booking history
- ✅ Update own profile
- ❌ Cannot manage other users' bookings
- ❌ Cannot access admin features

### Admin
**System administration**
- ✅ All Employee permissions
- ✅ Manage all users
- ✅ Manage all rooms
- ✅ View system-wide analytics
- ✅ Resolve conflicts
- ✅ Delete users and rooms
- ✅ System configuration
- ✅ Full audit access

---

## Booking Rooms

### Creating a Booking

#### Step 1: Access Booking System
1. Navigate to **"Réservations"** in the sidebar
2. Choose between **Grid View** or **List View**

#### Step 2: Select Date and Room
1. Use the **date picker** to select your desired date
2. Filter by **department** if needed
3. View available rooms in the grid or list

#### Step 3: Create Booking
1. Click on an **available time slot** in the grid
2. Or click **"New Booking"** button in list view
3. Fill in the booking form:

**Required Information:**
- **Meeting Title**: Descriptive name for your meeting
- **Room**: Select from available rooms
- **Date & Time**: Start and end times
- **Purpose**: Brief description of meeting purpose
- **Expected Attendees**: Number of people attending

**Optional Information:**
- **Agenda**: Detailed meeting agenda
- **Internal Attendees**: Names of internal participants
- **External Attendees**: Names of external participants
- **Required Amenities**: Equipment needed (projector, whiteboard, etc.)

#### Step 4: Submit Booking
1. Review all information
2. Click **"Create Booking"**
3. Booking is **automatically approved** and confirmed

### Booking Status

Your bookings will have one of these statuses:

| Status | Description | What You Can Do |
|--------|-------------|-----------------|
| **Approved** | ✅ Confirmed and ready | View, edit, or cancel |
| **Ongoing** | 🔄 Currently in progress | View only |
| **Completed** | ✅ Finished | View only |
| **Cancelled** | ❌ Cancelled by you | View only |

---

## Managing Bookings

### Viewing Your Bookings

#### Grid View
- **Visual Timeline**: See all rooms and their availability
- **Color Coding**: Different colors for different booking statuses
- **Time Slots**: 30-minute intervals from 8:00 AM to 6:00 PM
- **Hover Details**: Hover over bookings for quick information

#### List View
- **Detailed Cards**: Each room shows all its bookings
- **Chronological Order**: Bookings sorted by time
- **Quick Actions**: Easy access to edit or cancel options

### Editing a Booking

1. **Find Your Booking**: Use grid or list view
2. **Click to Edit**: Click on the booking or use edit button
3. **Make Changes**: Update any field except room (requires new booking)
4. **Save Changes**: Click "Update Booking"
5. **Auto-Approval**: Changes are automatically approved

### Moving a Booking

If you need to change room or time:

1. **Select Booking**: Find the booking you want to move
2. **Click Move**: Use the "Move Booking" option
3. **Choose New Details**: Select new room and/or time
4. **Confirm Move**: System will check for conflicts
5. **Auto-Approval**: Move is automatically approved if no conflicts

### Cancelling a Booking

1. **Find Your Booking**: Use grid or list view
2. **Click Cancel**: Use the cancel button
3. **Confirm Cancellation**: Confirm you want to cancel
4. **Immediate Effect**: Booking is cancelled immediately

---

## Dashboard Overview

### Main Dashboard
Access via **"Tableau de bord"** in the sidebar

#### Statistics Cards
- **Total Rooms**: Number of available rooms
- **Total Bookings**: All bookings in the system
- **Active Bookings**: Currently ongoing meetings
- **Availability Rate**: Percentage of rooms available

#### Room Status Overview
- **Visual Map**: See all rooms and their current status
- **Color Indicators**: 
  - 🟢 Available
  - 🔴 Busy
  - 🟡 Maintenance
- **Quick Actions**: Click rooms for quick booking

#### Today's Bookings
- **Upcoming Meetings**: Your meetings for today
- **Room Assignments**: Which room each meeting is in
- **Time Information**: Start and end times
- **Quick Access**: Click to view or edit

### User Dashboard (Non-Admin)
Simplified view showing:
- Your upcoming bookings
- Available rooms
- Quick booking options
- Recent activity

---

## Room Management

### Viewing Rooms

#### Room List
- **All Rooms**: Complete list of all available rooms
- **Department Filter**: Filter by your department
- **Capacity Filter**: Filter by room capacity
- **Status Filter**: Filter by availability

#### Room Details
- **Capacity**: Maximum number of people
- **Amenities**: Available equipment and features
- **Location**: Floor and building information
- **Department**: Which department manages the room
- **Maintenance Status**: Whether room is under maintenance

### Room Features

#### Amenities Available
- **Projector**: For presentations
- **Whiteboard**: For brainstorming
- **Video Conference**: For remote meetings
- **Phone System**: For conference calls
- **Air Conditioning**: Climate control
- **WiFi**: Internet access

#### Capacity Guidelines
- **Small Rooms (2-4 people)**: Phone booths, small meeting rooms
- **Medium Rooms (5-10 people)**: Team meeting rooms
- **Large Rooms (10+ people)**: Conference rooms, training rooms

---

## User Management

### Profile Management

#### Updating Your Profile
1. Click **"Profil"** in the sidebar
2. Edit your information:
   - Personal details (name, title, phone)
   - Contact information
   - Department assignment
3. Click **"Save Changes"**

#### Password Management
1. Go to **"Profil"** section
2. Click **"Change Password"**
3. Enter current and new password
4. Confirm new password
5. Click **"Update Password"**

### User Approval (Admin Only)

#### Approving New Users
1. Go to **"Gestion des utilisateurs"**
2. View **pending users**
3. Review user information
4. Click **"Approve"** or **"Reject"**
5. Add rejection reason if rejecting

#### Managing User Roles
1. Select user from user list
2. Click **"Edit User"**
3. Change role as needed
4. Save changes

---

## Visitor Management

### Overview
The Visitor Management system allows administrators to track external visitors, record their visits, and manage their access to meeting rooms and facilities. This feature is essential for security, compliance, and resource planning.

### Access Requirements
- **Admin Role Required**: Only users with ADMIN role can access visitor management features
- **Authentication**: Must be logged in with valid credentials
- **Permissions**: Full access to visitor data and visit records

### Managing Visitors

#### Recording a New Visitor Visit
1. **Navigate to Visitors**: Click on "Visitors" in the admin sidebar
2. **Add New Visit**: Click the "Add Visitor" button
3. **Fill Visitor Information**:
   - **First Name**: Visitor's first name (required)
   - **Last Name**: Visitor's last name (required)
   - **Email**: Contact email (optional)
   - **Phone**: Contact phone number (optional)
   - **Purpose**: Reason for visit (optional)
   - **Booking**: Link to existing meeting booking (optional)
4. **Submit**: Click "Create Visit" to record the visitor and their visit

#### Adding Visit for Existing Visitor
1. **Find Visitor**: Use the search or filter options to locate the visitor
2. **View Details**: Click on the visitor's name to open their details
3. **Add New Visit**: Click "Add Visit" button in the visitor details modal
4. **Fill Visit Information**:
   - **Purpose**: Reason for this visit
   - **Booking**: Link to meeting booking if applicable
5. **Submit**: Click "Create Visit" to record the new visit

#### Processing Visitor Checkout
1. **Find Active Visit**: Look for visits without a checkout time
2. **Checkout Visitor**: Click the "Départ" (Departure) button
3. **Automatic Recording**: System automatically records the checkout time
4. **Visit Complete**: Visit is now marked as completed with full duration

### Viewing and Filtering Visits

#### Visit List Features
- **Pagination**: Navigate through large lists of visits
- **Real-time Updates**: Data refreshes automatically
- **Responsive Design**: Works on all device sizes

#### Filtering Options
- **Date Range**: Filter visits by specific date ranges
- **Visitor Name**: Search by visitor's name
- **Room**: Filter by meeting room
- **Department**: Filter by department
- **Status**: Show active or completed visits
- **Purpose**: Filter by visit purpose

#### Visit Information Display
Each visit shows:
- **Visitor Name**: Full name of the visitor
- **Date**: Visit date
- **Arrival Time**: Check-in time
- **Purpose**: Reason for visit
- **Room**: Associated meeting room
- **Department**: Associated department
- **Departure**: Checkout time or departure button

### Visitor Details and History

#### Viewing Visitor Profile
1. **Click Visitor Name**: Click on any visitor's name in the visits list
2. **View Details**: See complete visitor information and visit history
3. **Edit Information**: Update visitor contact details if needed
4. **Add New Visit**: Record additional visits for the same visitor

#### Visitor Information Includes
- **Personal Details**: Name, email, phone
- **Visit History**: All past and current visits
- **Visit Statistics**: Total visits, average duration
- **Recent Activity**: Latest visits and purposes

---

## Statistics & Analytics

### Overview
The Statistics & Analytics system provides comprehensive insights into visitor patterns, room utilization, and organizational access trends. This feature helps administrators make data-driven decisions about resource allocation and security planning.

### Access Requirements
- **Admin Role Required**: Only users with ADMIN role can access statistics
- **Authentication**: Must be logged in with valid credentials
- **Real-time Data**: Statistics reflect current system state

### Statistics Dashboard

#### Key Performance Indicators (KPIs)
The dashboard displays four main summary cards:

**Total Visitors:**
- Cumulative count of all visitors
- Shows growth over time
- Helps track organizational access trends

**Average Visit Duration:**
- Mean time spent per visit
- Calculated from check-in to check-out times
- Excludes active visits (no checkout time)

**Average Daily Visitors:**
- Mean visitors per day for selected period
- Helps with capacity planning
- Useful for staffing decisions

**Peak Hour:**
- Hour with highest visitor count
- Identified from hourly distribution data
- Guides resource allocation

#### Time Range Selection
Choose from multiple time range options:

**Predefined Ranges:**
- **Day**: Last 7 days of data
- **Month**: Last 6 months of data  
- **Year**: Last 5 years of data

**Custom Range:**
- **Start Date**: Select any start date
- **End Date**: Select any end date
- **Flexible Periods**: Any date range within system limits

### Visual Analytics

#### Visitors Over Time
- **Line Chart**: Shows visitor trends over selected time period
- **Daily View**: Day-by-day visitor counts
- **Monthly View**: Month-by-month aggregation
- **Yearly View**: Year-by-year trends
- **Interactive**: Hover for detailed information

#### Peak Hours Analysis
- **Bar Chart**: 24-hour breakdown of visitor arrivals
- **Hourly Data**: Number of visitors per hour
- **Peak Identification**: Clearly shows busiest times
- **Resource Planning**: Helps optimize staff scheduling

#### Department Distribution
- **Pie Chart**: Visitor distribution across departments
- **Percentage Breakdown**: Relative department popularity
- **Color-coded**: Easy visual identification
- **Top Departments**: Ranked by visitor count

#### Purpose Analysis
- **Bar Chart**: Visit purposes and frequencies
- **Purpose Categories**: Grouped by visit reason
- **Trend Analysis**: Most common visit types
- **Business Insights**: Understanding visitor needs

#### Room Utilization
- **Room Statistics**: Visitor counts per room
- **Usage Percentages**: Room popularity ranking
- **Capacity Planning**: Room efficiency metrics
- **Resource Optimization**: Identify underutilized spaces

### Data Export

#### CSV Export Features
Export comprehensive statistics data:

**Export Contents:**
- **Summary Statistics**: All KPI data
- **Room Statistics**: Room-wise visitor counts
- **Department Statistics**: Department distribution
- **Purpose Statistics**: Visit purpose analysis
- **Time-based Data**: Trends over time

**Export Process:**
1. **Click Export Button**: Located in the top-right of statistics page
2. **Automatic Download**: File downloads immediately
3. **Timestamped Filename**: Includes date and time
4. **UTF-8 Encoding**: Proper character encoding for international data

**Export Format:**
```csv
Résumé
Total visiteurs,150
Durée moyenne,45.5 min
Visiteurs moyens par jour,12.3
Heure de pointe,14:00
Département le plus visité,Engineering
Salle la plus visitée,Conference Room A

Salles,Visiteurs,Pourcentage
Conference Room A,45,30%
Meeting Room B,30,20%
Reception Area,25,17%
```

### Using Statistics for Decision Making

#### Resource Planning
- **Staff Scheduling**: Use peak hours data for optimal staffing
- **Room Allocation**: Identify most/least used rooms
- **Capacity Management**: Plan for busy periods

#### Security Insights
- **Access Patterns**: Understand visitor flow
- **Department Security**: Monitor department access
- **Time-based Security**: Identify high-traffic periods

#### Business Intelligence
- **Visitor Trends**: Track growth over time
- **Purpose Analysis**: Understand visitor needs
- **Department Popularity**: Identify key business areas

#### Performance Monitoring
- **Visit Duration**: Monitor average visit length
- **Efficiency Metrics**: Room utilization rates
- **Growth Tracking**: Visitor count trends

### Best Practices

#### Regular Monitoring
- **Daily Checks**: Review daily statistics for anomalies
- **Weekly Analysis**: Analyze weekly trends and patterns
- **Monthly Reports**: Generate monthly summary reports

#### Data Interpretation
- **Context Matters**: Consider business events and seasons
- **Trend Analysis**: Look for patterns over time
- **Comparative Analysis**: Compare different time periods

#### Action Items
- **Resource Adjustment**: Modify staffing based on peak hours
- **Room Optimization**: Reallocate resources based on usage
- **Process Improvement**: Identify areas for efficiency gains

---

## Troubleshooting

### Common Issues

#### "Room Already Booked" Error
**Problem**: Cannot book a room at desired time
**Solution**: 
1. Check room availability in grid view
2. Try a different time slot
3. Try a different room
4. Contact room administrator if issue persists

#### "Booking Not Showing" Issue
**Problem**: Created booking doesn't appear
**Solution**:
1. Refresh the page
2. Check date filter settings
3. Verify booking was created successfully
4. Contact support if problem continues

#### "Cannot Edit Booking" Error
**Problem**: Cannot modify existing booking
**Solution**:
1. Ensure you're the booking organizer
2. Check if booking is in "Ongoing" status
3. Try refreshing the page
4. Contact admin if issue persists

#### "Login Issues"
**Problem**: Cannot log in to system
**Solution**:
1. Verify email and password
2. Check if account is approved
3. Clear browser cache and cookies
4. Contact IT support

### Error Messages

| Error Message | What It Means | How to Fix |
|---------------|---------------|------------|
| "Room is already booked" | Time slot is taken | Choose different time or room |
| "Invalid date range" | End time before start time | Correct the time selection |
| "Room capacity exceeded" | Too many attendees | Reduce attendee count or choose larger room |
| "Access denied" | Insufficient permissions | Contact admin for access |
| "User not approved" | Account pending approval | Wait for admin approval |

---

## Frequently Asked Questions

### General Questions

**Q: How far in advance can I book a room?**
A: You can book rooms up to 3 months in advance.

**Q: Can I book a room for multiple days?**
A: Currently, you need to create separate bookings for each day.

**Q: What happens if I'm late to my meeting?**
A: Your booking remains active for the full duration. You can join anytime during your scheduled slot.

**Q: Can I book a room outside business hours?**
A: The system allows booking from 8:00 AM to 6:00 PM. Contact admin for after-hours access.

### Booking Questions

**Q: Can I change my booking after creating it?**
A: Yes, you can edit most details. Room changes require creating a new booking.

**Q: What if I need to cancel at the last minute?**
A: You can cancel anytime before the meeting starts. Use the cancel button in your booking.

**Q: Can I book the same room for recurring meetings?**
A: Currently, you need to create separate bookings for each occurrence.

**Q: What if the room I need is under maintenance?**
A: Maintenance rooms are marked in the system. Choose an alternative room or contact admin.

### Technical Questions

**Q: The system is slow, what should I do?**
A: Try refreshing the page, clearing browser cache, or contact IT support.

**Q: Can I access the system from my phone?**
A: Yes, the system is mobile-responsive and works on smartphones and tablets.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions recommended).

**Q: Do I need to install any software?**
A: No, the system runs in your web browser. No additional software required.

### Permission Questions

**Q: Why can't I see all rooms?**
A: You may only see rooms in your department. Contact admin for access to other rooms.

**Q: Can I book rooms for other people?**
A: You can only book rooms for yourself. Contact admin for group bookings.

**Q: Why can't I edit someone else's booking?**
A: You can only edit your own bookings. Contact the organizer or admin for changes.

---

## Getting Help

### Support Channels
- **IT Support**: it-support@company.com
- **System Admin**: admin@company.com
- **Emergency**: Call IT helpdesk at extension 1234

### Documentation
- **Technical Documentation**: Available in system repository
- **API Documentation**: For developers and integrations
- **Video Tutorials**: Coming soon

### Feedback
- **Feature Requests**: Submit via feedback form
- **Bug Reports**: Use the bug report system
- **General Feedback**: Contact system administrator

---

## System Updates

### Recent Changes
- **Auto-Approval System**: All bookings are now automatically approved
- **Responsive Design**: Improved mobile and tablet experience
- **Real-time Updates**: Live booking status updates
- **Enhanced Filtering**: Better room and booking filtering options

### Upcoming Features
- **Mobile App**: Native mobile application
- **Calendar Integration**: Outlook and Google Calendar sync
- **Email Notifications**: Automated email reminders
- **Advanced Reporting**: Detailed usage analytics

---

*This user guide is regularly updated. For the latest version, please refer to the system documentation or contact your administrator.*
