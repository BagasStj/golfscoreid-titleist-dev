# Admin Guide: Flight Management & News System

## Quick Start Guide for Admins

### Creating a Tournament with Flights

#### Step 1: Create Tournament
1. Login as admin
2. Navigate to **Tournaments** section
3. Click **Create New Tournament**
4. Fill in all required fields:
   - **Tournament Name** * (required)
   - **Description** (optional but recommended)
   - **Location** * (required) - e.g., "Pondok Indah Golf Course"
   - **Date** * (required)
   - **Time** * (required)
   - **Prize** (optional) - e.g., "Rp 50.000.000"
   - **Registration Fee** (optional) - e.g., "Rp 500.000"
   - **Contact Person** (optional) - e.g., "John Doe - 08123456789"
   - **Max Participants** (optional) - default: 60
   - **Start Hole** * (required) - 1-18
   - **Course Type** * (required) - 18 holes, F9, or B9
   - **Game Mode** * (required) - Stroke Play, Stableford, or System 36
   - **Scoring Display** * (required) - Stroke or Over/Under Par
   - **Special Scoring Holes** (optional) - Select holes for special leaderboard

5. Click **Create Tournament**

#### Step 2: Create Flights
1. After creating tournament, go to tournament details
2. Navigate to **Flight Management** section
3. Click **Add Flight**
4. Fill in flight details:
   - **Flight Name** * (required) - e.g., "Flight A", "Morning Group"
   - **Flight Number** * (required) - Sequential number (1, 2, 3...)
   - **Start Time** (optional) - e.g., "08:00"
   - **Start Hole** * (required) - Starting hole for this flight

5. Click **Create**
6. Repeat for all flights needed (e.g., Flight A, B, C, D)

**Best Practices:**
- Create 4-6 players per flight for optimal pace
- Stagger start times by 10-15 minutes
- Use clear naming: "Flight A", "Flight B" or "Group 1", "Group 2"

#### Step 3: Add Players to Flights
1. Select a flight from the list
2. Click **Add Players** button
3. Search for players by name or email
4. Select players (checkbox)
5. Set start hole for each player (if different from flight default)
6. Click **Add X Players**

**Tips:**
- You can add multiple players at once
- Players can only be in one flight per tournament
- Start hole can be customized per player

#### Step 4: Manage Flight Players
- **View Players**: Click on a flight to see all players
- **Remove Player**: Click trash icon next to player name
- **Edit Flight**: Click edit icon on flight card
- **Delete Flight**: Click delete icon (only if no players)

### Managing News & Announcements

#### Creating News

1. Navigate to **News Management** section
2. Click **Create News**
3. Fill in news details:
   - **Title** * (required) - Clear, concise headline
   - **Excerpt** * (required) - Brief summary (shown in list)
   - **Content** * (required) - Full article content
   - **Category** * (required):
     - **Tournament**: Tournament-related news
     - **Tips**: Golf tips and advice
     - **Berita**: General news
     - **Announcement**: Important announcements
   - **Target Audience** * (required):
     - **All Users**: Everyone can see
     - **Players Only**: Only players can see
     - **Admins Only**: Only admins can see
   - **Publish Immediately**: Check to publish now, uncheck to save as draft

4. Click **Create**

#### Managing Existing News

**Edit News:**
1. Click edit icon on news item
2. Modify any fields
3. Click **Update**

**Publish/Unpublish:**
1. Click eye icon to toggle publish status
2. Published news shows green badge
3. Draft news shows gray badge

**Delete News:**
1. Click trash icon
2. Confirm deletion

**Best Practices:**
- Use clear, engaging titles
- Keep excerpts under 150 characters
- Use appropriate categories
- Target the right audience
- Review drafts before publishing

### Tournament Management Workflow

#### Pre-Tournament (1-2 weeks before)
1. ✅ Create tournament with all details
2. ✅ Create flights based on expected participants
3. ✅ Add registered players to flights
4. ✅ Send announcement news about tournament
5. ✅ Verify all player information
6. ✅ Set tournament status to "upcoming"

#### Tournament Day (Morning)
1. ✅ Verify all players are present
2. ✅ Make last-minute flight adjustments if needed
3. ✅ Change tournament status to "active"
4. ✅ Send "Tournament Starting" announcement
5. ✅ Monitor from Live Monitoring dashboard

#### During Tournament
1. ✅ Monitor live scores from all flights
2. ✅ Check for any issues or delays
3. ✅ Send updates if needed
4. ✅ Assist players with scoring questions

#### Post-Tournament
1. ✅ Verify all scores are submitted
2. ✅ Review final leaderboard
3. ✅ Change tournament status to "completed"
4. ✅ Send results announcement
5. ✅ Share photos and highlights

### Common Admin Tasks

#### Adding a Late Player
1. Go to tournament details
2. Select appropriate flight
3. Click "Add Players"
4. Search and add the player
5. Set their start hole

#### Moving a Player Between Flights
1. Remove player from current flight
2. Select new flight
3. Add player to new flight

#### Changing Flight Start Time
1. Click edit icon on flight
2. Update start time
3. Click "Update"

#### Emergency Announcement
1. Go to News Management
2. Create news with category "Announcement"
3. Write urgent message
4. Select "All Users" as target
5. Check "Publish Immediately"
6. Click "Create"

### Flight Organization Tips

#### Small Tournament (20-30 players)
- Create 4-6 flights
- 4-5 players per flight
- 10-minute intervals between flights

#### Medium Tournament (40-60 players)
- Create 8-12 flights
- 4-5 players per flight
- 10-minute intervals
- Consider shotgun start

#### Large Tournament (80+ players)
- Create 16-20 flights
- 4-5 players per flight
- Shotgun start recommended
- Multiple starting holes

### News Content Ideas

**Tournament Announcements:**
- Tournament registration open
- Registration closing soon
- Tournament schedule
- Weather updates
- Results and winners

**Tips & Advice:**
- Course strategy
- Equipment recommendations
- Rules clarifications
- Etiquette reminders

**General News:**
- New features
- Upcoming events
- Player achievements
- Course updates

### Troubleshooting

#### Problem: Can't delete flight
**Solution**: Remove all players from flight first

#### Problem: Player not showing in flight
**Solution**: Check if player is already in another flight for this tournament

#### Problem: News not visible to players
**Solution**: Check publish status and target audience settings

#### Problem: Tournament not showing for players
**Solution**: Verify players are added to flights, not just tournament

#### Problem: Wrong start time for flight
**Solution**: Edit flight and update start time

### Keyboard Shortcuts & Tips

- Use search to quickly find players
- Multi-select players for batch operations
- Save drafts for news you're still working on
- Use clear flight names for easy identification
- Keep contact person info updated

### Data Management

#### Backup Important Information
- Export player lists regularly
- Save tournament configurations
- Keep records of flight assignments

#### Regular Maintenance
- Archive completed tournaments
- Clean up old draft news
- Review player information
- Update contact details

### Support & Help

If you encounter issues:
1. Check this guide first
2. Review error messages carefully
3. Verify all required fields are filled
4. Check user permissions
5. Contact technical support if needed

### Best Practices Summary

✅ **DO:**
- Create flights before adding players
- Use clear, descriptive names
- Test with a small tournament first
- Keep players informed with news
- Monitor tournaments actively
- Verify all data before tournament day

❌ **DON'T:**
- Delete flights with players
- Forget to publish important news
- Change flight assignments during play
- Ignore player questions
- Skip pre-tournament verification

### Quick Reference

**Flight Capacity:**
- Recommended: 4-5 players per flight
- Maximum: 6 players per flight
- Minimum: 2 players per flight

**Start Time Intervals:**
- Standard: 10 minutes
- Busy days: 8 minutes
- Relaxed pace: 12-15 minutes

**News Categories:**
- Tournament: Event-specific news
- Tips: Educational content
- Berita: General updates
- Announcement: Urgent messages

**Tournament Status:**
- Upcoming: Not started yet
- Active: Currently in progress
- Completed: Finished

---

## Need Help?

Contact your system administrator or refer to the technical documentation for advanced features and troubleshooting.
