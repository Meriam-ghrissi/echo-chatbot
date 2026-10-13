# Echo – AI Chatbot

Echo is a full-stack AI chatbot web application. Users can create an account, chat with an AI model, generate images from text prompts, share images with a community gallery, and buy extra credits online with Stripe.

The project is split into two independent parts:

- **`client`**: the React frontend (Vite)
- **`server`**: the Node.js / Express REST API

---

## Features

- **Authentication**: register and log in with email and password (JWT-based sessions, 30 days)
- **Text chat**: ask questions and get AI answers rendered in Markdown, with syntax-highlighted code blocks
- **Image generation**: turn a text prompt into an image (generated through ImageKit AI, stored in the ImageKit media library)
- **Stop button**: cancel a request that is in progress
- **Multiple conversations**: create, search, open and delete chats from the sidebar
- **Community gallery**: images published by users are shown on the *Community Images* page
- **Credit system**: every user starts with 20 credits; text costs 1 credit, image costs 2 credits
- **Credit purchase**: Basic, Pro and Premium plans paid through Stripe Checkout
- **Dark / light mode** with a turquoise theme
- **Responsive layout** with a collapsible sidebar on mobile

---

## Tech stack

| Part | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS v4, React Router, Axios, react-hot-toast, react-markdown, Prism.js, Moment.js |
| Backend | Node.js (ES modules), Express, Mongoose, JSON Web Tokens, bcryptjs, CORS, dotenv |
| Database | MongoDB Atlas |
| AI | OpenAI-compatible SDK (text), ImageKit AI generation (images) |
| Payments | Stripe Checkout + Stripe webhooks |
| Hosting | Vercel (two projects: `client` and `server`) |

---

## Project structure

```
Echo/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/            # images, icons, Prism theme
│   │   ├── components/
│   │   │   ├── Chatbox.jsx    # message list + prompt form
│   │   │   ├── Message.jsx    # one message (text, code or image)
│   │   │   └── Sidebar.jsx    # chats, credits, theme, account
│   │   ├── context/
│   │   │   └── AppContext.jsx # global state (user, chats, token, theme)
│   │   ├── pages/
│   │   │   ├── Community.jsx  # published images
│   │   │   ├── Credits.jsx    # plans and checkout
│   │   │   ├── Loading.jsx
│   │   │   └── Login.jsx      # login / sign up
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
│
├── server/
│   ├── configs/               # db.js, imageKit.js, openai.js
│   ├── controllers/           # user, chat, message, credit, webhooks
│   ├── middlewares/auth.js    # JWT verification (protect)
│   ├── models/                # User, Chat, Transaction
│   ├── routes/                # user, chat, message, credit routes
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## How it works

### 1. Authentication
1. The user registers or logs in from `Login.jsx`.
2. The server hashes the password with bcrypt, checks the credentials and returns a JWT.
3. The frontend saves the token in `localStorage` and sends it in the `Authorization` header of every protected request.
4. The `protect` middleware verifies the token and attaches the user to the request.

### 2. Chats and messages
1. When a user has no chat, one is created automatically.
2. Each chat stores its messages (`role`, `content`, `timestamp`, `isImage`, `isPublished`) in MongoDB.
3. On submit, the frontend calls `/api/message/text` or `/api/message/image` with the chat id and the prompt.
4. The server checks the credits, calls the AI, saves both messages and deducts the credits.

### 3. Image generation
1. The server builds an ImageKit AI generation URL from the prompt.
2. It fetches the URL repeatedly until the image is ready (up to 10 attempts).
3. The image is uploaded to the ImageKit media library (`echo` folder) and its URL is saved in the chat.
4. If *Publish to Community* is checked, the message is saved with `isPublished: true`.

### 4. Community gallery
`GET /api/user/published-images` aggregates all messages where `isImage` and `isPublished` are `true` and returns the image URL with the author name.

### 5. Buying credits
1. `Credits.jsx` loads the plans from `/api/credit/plan`.
2. Clicking **Buy Now** calls `/api/credit/purchase`: the server creates an unpaid `Transaction` and a Stripe Checkout session, then returns its URL.
3. The user pays on the Stripe page and is redirected to the app.
4. Stripe sends a `payment_intent.succeeded` event to `/api/stripe`. The webhook verifies the signature, marks the transaction as paid and adds the credits to the user.

| Plan | Price | Credits |
|---|---|---|
| Basic | $10 | 100 |
| Pro | $20 | 500 |
| Premium | $30 | 1000 |

---

## API endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/user/register` | no | create an account |
| POST | `/api/user/login` | no | log in |
| GET | `/api/user/data` | yes | current user |
| GET | `/api/user/published-images` | no | community images |
| GET | `/api/chat/create` | yes | create a chat |
| GET | `/api/chat/get` | yes | list the user's chats |
| POST | `/api/chat/delete` | yes | delete a chat |
| POST | `/api/message/text` | yes | send a text prompt |
| POST | `/api/message/image` | yes | generate an image |
| GET | `/api/credit/plan` | no | list credit plans |
| POST | `/api/credit/purchase` | yes | start a Stripe checkout |
| POST | `/api/stripe` | Stripe signature | payment webhook |

---

## Getting started

### Prerequisites
- Node.js 18 or newer
- A MongoDB Atlas database
- Accounts for ImageKit, Stripe (test mode is enough) and your AI provider

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/echo-chatbot.git
cd echo-chatbot

cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

Create `server/.env`:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
# plus the API key of your AI provider
# (see server/configs/openai.js for the exact variable name)
```

Create `client/.env`:

```env
VITE_SERVER_URL=http://localhost:3000
```

> Never commit `.env` files. They are listed in `.gitignore`.

### 3. Run in development

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

The app is available at `http://localhost:5173`.

### 4. Test payments locally

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe
```

Copy the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET`, restart the server, and pay with the test card `4242 4242 4242 4242` (any future date, any CVC).

---

## Deployment (Vercel)

The repository contains two deployable projects. Create **two Vercel projects** from the same GitHub repo:

| Project | Root Directory | Environment variables |
|---|---|---|
| Frontend | `client` | `VITE_SERVER_URL` (URL of the deployed server) |
| Backend | `server` | all variables from `server/.env` |

Then, in the Stripe dashboard, add a webhook endpoint pointing to `https://<your-server>/api/stripe` for the `payment_intent.succeeded` event, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

`client/vercel.json` rewrites every route to `index.html` so pages such as `/credits` and `/community` keep working after a refresh.

---

## Author
Created by Meriam Ghrissi.