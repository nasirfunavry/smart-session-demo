# Reown AppKit Example using ethers (Vite + React)

This is a [Vite](https://vitejs.dev) project together with React.

## Usage

1. Go to [Reown Cloud](https://cloud.reown.com) and create a new project.
2. Copy your `Project ID`
3. Rename `.env.example` to `.env` and paste your `Project ID` as the value for `VITE_PROJECT_ID`
4. Run `pnpm install` to install dependencies
5. Run `pnpm run dev` to start the development server

# appkit-smart-session

# Switch Network
Select Network and Click on Switch to change Network

# Session Creation and Automation
Prepare Call
The Prepare Call initiates the session creation process.

When the Prepare Call is invoked, it performs the following steps:

   Creates the initial session.
   prepare call

   Sends the Prepare request.
     Within this step, it also internally calls the sendPrepare() function to handle the actual request transmission.