# 💬 One-to-One Chat App — Complete Build Guide

> **A step-by-step blueprint for building a production-minded one-to-one chat application with Next.js, Node.js, Express, MongoDB and Socket.IO.**

<div align="center">

### 🧭 BUILD → 🔐 AUTH → 💾 DATABASE → 💬 CHAT → ⚡ REAL-TIME → 🛡️ SECURITY → 🧪 TEST → 🚀 GIT

</div>

---

## 🎨 Step Color System

| Color | Meaning | Steps |
|---|---|---|
| 🔵 **Blue** | Foundation | Project setup |
| 🟣 **Purple** | Data layer | MongoDB + models |
| 🟢 **Green** | Authentication | Register, login, middleware |
| 🟠 **Orange** | Chat core | Conversations + messages |
| 🔴 **Red** | Real-time | Socket.IO + events |
| 🩷 **Pink** | User experience | UI + typing + presence |
| 🔷 **Indigo** | Reliability | Pagination + state + errors |
| 🟪 **Violet** | Quality | Security + testing |
| ⚫ **Dark** | Delivery | Git workflow |

---

## 🗺️ Complete Roadmap

```text
01  Project Setup
 ↓
02  MongoDB Configuration
 ↓
03  Database Connection
 ↓
04  User Model
 ↓
05  Registration
 ↓
06  Login
 ↓
07  Authentication Middleware
 ↓
08  Conversation Model
 ↓
09  Message Model
 ↓
10  Chat APIs
 ↓
11  Chat UI
 ↓
12  Socket.IO
 ↓
13  Socket Connection
 ↓
14  Send Message
 ↓
15  Message Events
 ↓
16  Typing Indicator
 ↓
17  Online / Offline
 ↓
18  Delivery + Read Status
 ↓
19  Old Messages + Pagination
 ↓
20  Message Ordering + Indexes
 ↓
21  Frontend State
 ↓
22  Error Handling
 ↓
23  Security
 ↓
24  Common Chat Problems
 ↓
25  Testing
 ↓
26  Git Workflow
```

---

## 🏗️ Target Architecture

```text
┌──────────────────────────── FRONTEND ────────────────────────────┐
│                         Next.js / React                          │
│                                                                  │
│  UserList → ChatWindow → MessageList → MessageInput             │
│                       │                                          │
│              REST API + Socket.IO                                │
└───────────────────────┬──────────────────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
       REST / Express       Socket.IO Server
              │                   │
              └─────────┬─────────┘
                        ▼
                ┌───────────────┐
                │   MongoDB     │
                │ Users         │
                │ Conversations │
                │ Messages      │
                └───────────────┘
```

---


<div align="center">

<h2 style="color:#2563EB;">STEP 01 · Create the Project</h2>
<p><strong>🔵 FOUNDATION</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create the main directory:

```bash
mkdir one-to-one-chat-app
cd one-to-one-chat-app

```
Create the frontend:

```bash
npx create-next-app@latest client

```
Recommended options:

TypeScript       → Yes
ESLint            → Yes
Tailwind CSS      → Yes
src/ directory    → Yes
App Router        → Yes

Create the backend:

```bash
mkdir server
cd server
npm init -y

```
Install backend dependencies:

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken socket.io

```
Development dependencies:

```bash
npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken
```

<div align="right">

**⬆️ Step 01 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#7C3AED;">STEP 02 · Configure MongoDB</h2>
<p><strong>🟣 DATABASE</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create a MongoDB Atlas database.

Create a .env file inside server.

```bash
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_super_secret_key

CLIENT_URL=http://localhost:3000

```
Never commit .env to GitHub.

Add:

- 📁 `.env`
node_modules/
.next/

to .gitignore.

<div align="right">

**⬆️ Step 02 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#0891B2;">STEP 03 · Create Database Connection</h2>
<p><strong>🟦 BACKEND</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create:

- 📁 `server/src/config/db.ts`

The responsibility of this file is to establish a connection between Node.js and MongoDB.

Conceptually:

Server starts
     ↓
Read MONGO_URI
     ↓
Connect to MongoDB
     ↓
Connection successful
     ↓
Start Express server

If MongoDB connection fails, the server should report the error rather than silently continuing.

<div align="right">

**⬆️ Step 03 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#059669;">STEP 04 · Design the User Model</h2>
<p><strong>🟢 AUTH</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create:

- 📁 `server/src/models/User.ts`

A user should contain:

User
│
├── _id
├── name
├── email
├── password
├── avatar
├── isOnline
├── lastSeen
├── createdAt
└── updatedAt

Example conceptual document:

{
  "_id": "user123",
  "name": "Ansh",
  "email": "ansh@example.com",
  "password": "hashed_password",
  "avatar": "avatar_url",
  "isOnline": true,
  "lastSeen": "2026-08-17T15:00:00Z"
}

Never store a user's plain-text password.

<div align="right">

**⬆️ Step 04 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#D97706;">STEP 05 · Implement Registration</h2>
<p><strong>🟠 CHAT</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create:

- **`POST /api/auth/register`**

Flow:

User enters:
    ↓
Name
Email
Password
    ↓
Frontend sends request
    ↓
Backend validates data
    ↓
Check whether email exists
    ↓
Hash password using bcrypt
    ↓
Create user
    ↓
Generate JWT
    ↓
Return authentication response

Example request:

{
  "name": "Ansh",
  "email": "ansh@example.com",
  "password": "password123"
}

<div align="right">

**⬆️ Step 05 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#DC2626;">STEP 06 · Implement Login</h2>
<p><strong>🔴 REAL-TIME</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create:

- **`POST /api/auth/login`**

Flow:

Email + Password
       ↓
Find user
       ↓
Compare password
       ↓
Password correct?
    ↙       ↘
  No         Yes
  ↓           ↓
Error       Generate JWT
              ↓
          Return token

The frontend stores the authentication state securely.

For a production application, prefer secure, HTTP-only cookies over exposing long-lived JWTs to JavaScript.

<div align="right">

**⬆️ Step 06 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#DB2777;">STEP 07 · Authentication Middleware</h2>
<p><strong>🩷 UX</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create:

- 📁 `server/src/middleware/authMiddleware.ts`

Its job is to protect private APIs.

Example:

Request
   ↓
Authorization
   ↓
Validate token
   ↓
Extract user ID
   ↓
Attach user to request
   ↓
Controller

Protected routes include:

- **`GET /api/users`**
- **`GET /api/chats`**
- **`GET /api/chats/:id/messages`**
- **`POST /api/chats`**

<div align="right">

**⬆️ Step 07 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#4F46E5;">STEP 08 · Create Conversation Model</h2>
<p><strong>🔷 RELIABILITY</strong> · Build this layer before moving to the next step.</p>

</div>

---

A one-to-one conversation contains exactly two users.

Create:

- 📁 `server/src/models/Conversation.ts`

Structure:

Conversation
│
├── _id
├── participants
│     ├── userA
│     └── userB
├── lastMessage
├── lastMessageAt
├── createdAt
└── updatedAt

Example:

{
  "_id": "conversation123",
  "participants": [
    "userA",
    "userB"
  ],
  "lastMessage": "Hello!",
  "lastMessageAt": "2026-08-17T15:30:00Z"
}
13. Important Rule — Avoid Duplicate Conversations

Suppose:

User A → User B

already has a conversation.

User A should not be able to create:

Conversation 1 → A + B
Conversation 2 → A + B
Conversation 3 → A + B

Instead, search for an existing conversation containing both users.

Conceptually:

Find conversation where:

participants contains A
AND
participants contains B

If found:

Return existing conversation

Otherwise:

Create new conversation

This is one of the most important database rules in a one-to-one chat system.

<div align="right">

**⬆️ Step 08 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#65A30D;">STEP 09 · Create Message Model</h2>
<p><strong>🟩 SECURITY</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create:

- 📁 `server/src/models/Message.ts`

Structure:

Message
│
├── _id
├── conversationId
├── senderId
├── receiverId
├── content
├── status
├── createdAt
└── readAt

Example:

{
  "_id": "message123",
  "conversationId": "conversation123",
  "senderId": "userA",
  "receiverId": "userB",
  "content": "Hello!",
  "status": "sent",
  "createdAt": "2026-08-17T15:30:00Z"
}

Message status can be:

- **`sent`**
- **`delivered`**
- **`read`**

<div align="right">

**⬆️ Step 09 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#9333EA;">STEP 10 · Create Chat APIs</h2>
<p><strong>🟪 QUALITY</strong> · Build this layer before moving to the next step.</p>

</div>

---

Create:

- 📁 `server/src/routes/chatRoutes.ts`

Recommended APIs:

Get conversations
- **`GET /api/chats`**

Returns the user's conversations.

Create/Get conversation
- **`POST /api/chats`**

Request:

{
  "userId": "receiverId"
}
Get messages
- **`GET /api/chats/:conversationId/messages`**

Returns previous messages.

Send message

You can technically send through:

- **`POST /api/messages`**

but for a real-time chat application, the preferred flow is usually:

Socket.IO → send message
MongoDB → persist message
Socket.IO → deliver message

<div align="right">

**⬆️ Step 10 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#2563EB;">STEP 11 · Build the Chat UI</h2>
<p><strong>🔵 FOUNDATION</strong> · Build this layer before moving to the next step.</p>

</div>

---

The main chat page can be divided into three sections:

┌─────────────────────────────────────────────┐
│                  Chat App                   │
├───────────────┬─────────────────────────────┤
│               │                             │
│  Users        │       Chat Header           │
│               │                             │
│  User A       ├─────────────────────────────┤
│  User B       │                             │
│  User C       │      Message Area           │
│               │                             │
│  User D       │  Hello                 →    │
│               │                 ← Hi        │
│               │                             │
│               ├─────────────────────────────┤
│               │ Message...            Send  │
└───────────────┴─────────────────────────────┘

Components:

ChatPage
│
├── UserList
│   └── UserCard
│
└── ChatWindow
    ├── ChatHeader
    ├── MessageList
    │   └── MessageBubble
    └── MessageInput

<div align="right">

**⬆️ Step 11 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#7C3AED;">STEP 12 · Introduce Socket.IO</h2>
<p><strong>🟣 DATABASE</strong> · Build this layer before moving to the next step.</p>

</div>

---

Install Socket.IO client:

```bash
cd client
npm install socket.io-client

```
The backend already has:

```bash
npm install socket.io

```
Socket.IO provides the persistent connection needed for real-time communication.

Normal HTTP:

Client → Request → Server
Server → Response → Client

WebSocket/Socket.IO:

Client ←────────→ Server
       persistent
       connection

This means the server can immediately push a new message to the receiver.

<div align="right">

**⬆️ Step 12 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#0891B2;">STEP 13 · Socket Connection</h2>
<p><strong>🟦 BACKEND</strong> · Build this layer before moving to the next step.</p>

</div>

---

When the user logs in:

User logs in
     ↓
Frontend obtains authenticated session
     ↓
Connect Socket.IO
     ↓
Identify current user
     ↓
Server associates socket with user

Conceptually:

User A
  │
  │ socket connection
  ▼
Socket Server
  │
  └── userA → socket123

If User B connects:

userA → socket123
userB → socket456

Now the server knows where to send real-time events.

<div align="right">

**⬆️ Step 13 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#059669;">STEP 14 · Sending a Message</h2>
<p><strong>🟢 AUTH</strong> · Build this layer before moving to the next step.</p>

</div>

---

Suppose:

User A → User B

User A types:

Hello!

Flow:

User A
  ↓
MessageInput
  ↓
socket.emit("send_message")
  ↓
Socket.IO Server
  ↓
Validate sender
  ↓
Validate conversation
  ↓
Save message to MongoDB
  ↓
Find User B's socket
  ↓
socket.to(userB).emit("receive_message")
  ↓
User B UI updates

This gives the application real-time behavior.

<div align="right">

**⬆️ Step 14 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#D97706;">STEP 15 · Message Event Design</h2>
<p><strong>🟠 CHAT</strong> · Build this layer before moving to the next step.</p>

</div>

---

Define clear socket events.

Connection
connection
User joins
user_online
Send message
send_message
Receive message
receive_message
Typing
typing
Stop typing
stop_typing
Message delivered
message_delivered
Message read
message_read
Disconnect
disconnect

<div align="right">

**⬆️ Step 15 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#DC2626;">STEP 16 · Typing Indicator</h2>
<p><strong>🔴 REAL-TIME</strong> · Build this layer before moving to the next step.</p>

</div>

---

When User A starts typing:

User A
   ↓
typing event
   ↓
Socket Server
   ↓
User B
   ↓
"Ansh is typing..."

When User A stops:

stop_typing

The frontend should use a small debounce timer so that it does not emit a socket event for every keystroke.

<div align="right">

**⬆️ Step 16 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#DB2777;">STEP 17 · Online / Offline Status</h2>
<p><strong>🩷 UX</strong> · Build this layer before moving to the next step.</p>

</div>

---

When a user connects:

isOnline = true

When the socket disconnects:

isOnline = false
lastSeen = current time

Flow:

User opens app
      ↓
Socket connects
      ↓
Set online
      ↓
Notify relevant users

When the user leaves:

Socket disconnects
      ↓
Set offline
      ↓
Update lastSeen
      ↓
Notify relevant users

<div align="right">

**⬆️ Step 17 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#4F46E5;">STEP 18 · Message Delivery Status</h2>
<p><strong>🔷 RELIABILITY</strong> · Build this layer before moving to the next step.</p>

</div>

---

Implement statuses in stages.

Sent

Message successfully reaches the server and is stored.

User A → Server

Status:

- **`sent`**
Delivered

Message reaches User B's active socket.

Server → User B

Status:

- **`delivered`**
Read

User B opens/views the conversation.

User B reads message
       ↓
message_read
       ↓
Server
       ↓
Update MongoDB
       ↓
Notify User A

Status:

- **`read`**

<div align="right">

**⬆️ Step 18 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#65A30D;">STEP 19 · Loading Old Messages</h2>
<p><strong>🟩 SECURITY</strong> · Build this layer before moving to the next step.</p>

</div>

---

When User A opens a conversation:

Open conversation
       ↓
- **`GET /api/chats/:id/messages`**
       ↓
Server queries MongoDB
       ↓
Messages returned
       ↓
Frontend displays messages

Do not load thousands of messages at once.

Use pagination.

For example:

First request → latest 30 messages
Scroll upward → previous 30
Scroll upward → previous 30

This improves performance.

<div align="right">

**⬆️ Step 19 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#9333EA;">STEP 20 · Message Ordering</h2>
<p><strong>🟪 QUALITY</strong> · Build this layer before moving to the next step.</p>

</div>

---

Messages should contain:

createdAt

Then sort them chronologically.

Example:

10:00 → Hello
10:01 → Hi
10:02 → How are you?
10:03 → I'm good

For large chat histories, database indexes become important.

Recommended indexes include:

conversationId
createdAt

A compound index such as:

conversationId + createdAt

can make message-history queries much faster.

<div align="right">

**⬆️ Step 20 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#2563EB;">STEP 21 · Frontend State Management</h2>
<p><strong>🔵 FOUNDATION</strong> · Build this layer before moving to the next step.</p>

</div>

---

The frontend needs to maintain:

currentUser
conversations
selectedConversation
messages
onlineUsers
typingUsers
connectionStatus

For a small application, React state/context may be enough.

For a larger application, consider:

Zustand

or another dedicated state-management solution.

Example state:

ChatState
│
├── currentUser
├── conversations[]
├── activeConversation
├── messages[]
├── onlineUsers[]
└── typingUsers[]

<div align="right">

**⬆️ Step 21 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#7C3AED;">STEP 22 · Error Handling</h2>
<p><strong>🟣 DATABASE</strong> · Build this layer before moving to the next step.</p>

</div>

---

Handle errors at every layer.

Frontend
Network error
Authentication error
Message send failure
Socket disconnected
Backend
Invalid token
Invalid user
Invalid conversation
Database error
Socket error
UI

Show useful messages:

Unable to send message
Connection lost
Reconnecting...
Session expired
User not found

<div align="right">

**⬆️ Step 22 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#0891B2;">STEP 23 · Security</h2>
<p><strong>🟦 BACKEND</strong> · Build this layer before moving to the next step.</p>

</div>

---

Security should be implemented before deployment.

Passwords

Never store:

password123

Store:

bcrypt(password)
Authentication

Protect private APIs using authentication middleware.

Authorization

A user should only be allowed to access conversations they participate in.

For example:

User A
   ↓
Request conversation ABC
   ↓
Does A belong to ABC?
   ↓
Yes → allow
No  → reject
Message authorization

User A should not be able to send a message pretending to be User B.

The sender should always be derived from the authenticated session/socket identity.

Input validation

Validate:

message length
user ID
conversation ID
email
password

Also escape or safely render user-generated content to prevent XSS.

<div align="right">

**⬆️ Step 23 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#059669;">STEP 24 · Prevent Common Chat Problems</h2>
<p><strong>🟢 AUTH</strong> · Build this layer before moving to the next step.</p>

</div>

---

Problem 1 — Duplicate messages

Can happen when:

REST request
+
Socket event

both add the same message to the UI.

Choose one authoritative client update path.

A good approach is:

send through socket
       ↓
server saves message
       ↓
server returns message with ID
       ↓
client inserts that exact message
Problem 2 — Duplicate conversations

Always check whether a conversation between the two users already exists.

Problem 3 — Lost messages

Persist the message in MongoDB before treating it as successfully sent.

Problem 4 — Socket disconnect

Implement reconnection.

When reconnected:

Reconnect
   ↓
Authenticate again
   ↓
Restore user presence
   ↓
Reload/synchronize missed state

<div align="right">

**⬆️ Step 24 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#D97706;">STEP 25 · Testing</h2>
<p><strong>🟠 CHAT</strong> · Build this layer before moving to the next step.</p>

</div>

---

Test authentication:

✓ Register
✓ Login
✓ Wrong password
✓ Duplicate email
✓ Invalid token

Test users:

✓ Search users
✓ View profile
✓ Online status
✓ Offline status

Test chat:

✓ Create conversation
✓ Prevent duplicate conversation
✓ Send message
✓ Receive message
✓ Load old messages
✓ Pagination

Test real-time:

✓ Typing indicator
✓ Online status
✓ Delivered status
✓ Read status
✓ Reconnection

<div align="right">

**⬆️ Step 25 complete → move to the next layer**

</div>


<div align="center">

<h2 style="color:#DC2626;">STEP 26 · Git Workflow</h2>
<p><strong>🔴 REAL-TIME</strong> · Build this layer before moving to the next step.</p>

</div>

---

Initialize Git:

```bash
git init

```
First commit:

```bash
git add .
git commit -m "Initialize chat application"

```
Create GitHub repository and connect it:

```bash
git remote add origin YOUR_REPOSITORY_URL
git branch -M main
git push -u origin main

```
Recommended commit structure:

feat: setup frontend and backend
feat: add MongoDB connection
feat: add user authentication
feat: add user search
feat: add conversation model
feat: add message model
feat: add chat APIs
feat: integrate Socket.IO
feat: add real-time messaging
feat: add typing indicator
feat: add online status
feat: add message read status
fix: handle socket reconnection

This keeps your GitHub history clean and demonstrates incremental development.

<div align="right">

**⬆️ Step 26 complete → move to the next layer**

</div>


---

# 🚦 Recommended Development Order

### Phase 1 — Foundation
- Step 1 → Project setup
- Step 2 → MongoDB configuration
- Step 3 → Database connection

### Phase 2 — Authentication
- Step 4 → User model
- Step 5 → Registration
- Step 6 → Login
- Step 7 → Authentication middleware

### Phase 3 — Chat Data
- Step 8 → Conversation model
- Step 9 → Message model
- Step 10 → Chat APIs

### Phase 4 — Frontend
- Step 11 → Chat UI
- Step 21 → Frontend state management

### Phase 5 — Real-Time Messaging
- Step 12 → Socket.IO
- Step 13 → Socket connection
- Step 14 → Send message
- Step 15 → Event design
- Step 16 → Typing indicator
- Step 17 → Online/offline status
- Step 18 → Delivery/read status

### Phase 6 — Scale & Reliability
- Step 19 → Pagination
- Step 20 → Message ordering + indexes
- Step 22 → Error handling
- Step 24 → Common chat problems

### Phase 7 — Production Readiness
- Step 23 → Security
- Step 25 → Testing
- Step 26 → Git workflow

---

# ✅ Definition of Done

Before calling the project complete, verify:

- [ ] Users can register and log in
- [ ] Passwords are hashed
- [ ] Private APIs require authentication
- [ ] A pair of users can have only one conversation
- [ ] Messages are persisted in MongoDB
- [ ] Messages arrive in real time
- [ ] Typing indicator works
- [ ] Online/offline status works
- [ ] Sent/delivered/read states work
- [ ] Old messages are paginated
- [ ] Message-history indexes exist
- [ ] Socket reconnection is handled
- [ ] Unauthorized conversation access is rejected
- [ ] Input is validated and safely rendered
- [ ] Authentication and chat flows are tested
- [ ] Git history uses meaningful commits

---

# 🎯 Git Commit Strategy

Instead of committing the whole project at once, commit after each meaningful milestone.

```text
feat: setup frontend and backend
feat: add MongoDB connection
feat: add user authentication
feat: add user search
feat: add conversation model
feat: add message model
feat: add chat APIs
feat: integrate Socket.IO
feat: add real-time messaging
feat: add typing indicator
feat: add online status
feat: add message read status
fix: handle socket reconnection
```

> **Tip:** Keep each commit small enough that you can clearly explain what changed and why.

---

<div align="center">

## 💙 Build One Layer → Test It → Commit It → Move Forward

**One-to-One Chat App · Backend + Database + Real-Time + Security**

</div>
