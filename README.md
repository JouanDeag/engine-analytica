# Engine Analytica - Development Setup

This README provides instructions on how to set up a development version of the "Engine Analytica" project using SvelteKit. Engine Analytica is a web application built to analyze and visualize chess engine data and provide a simple way to benchmark them. Follow the steps below to get started.

## Prerequisites

Before setting up the development environment, ensure that you have the following software installed on your system:

- Node.js (version 16 or higher)
- pnpm (Performance Node Package Manager)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Jouandeag/engine-analytica.git
   ```

2. Navigate to the project directory:

   ```bash
   cd engine-analytica
   ```

3. Install project dependencies:

   ```bash
   pnpm i
   ```

4. Generate DB and DB client
   ```bash
   pnpx prisma db push
   ```

## Configuration

The Engine Analytica project requires some configuration settings based on your specific environment. Look for a .env.example file in the project root directory, copy it to `.env` and adjust the values according to your needs.

## Development Server

To run the development server and view the Engine Analytica project locally, execute the following command:

```bash
pnpm dev
```

This command starts the SvelteKit development server at [http://localhost:5173](http://localhost:5173/) Open this URL in your web browser to access the Engine Analytica application.

The development server watches for changes in your code and automatically rebuilds the project, allowing you to see the updates in real-time without manual restarts.

## Building for Production

If you want to build the Engine Analytica project for production deployment, you can use the following command:

```bash
pnpm build
```

This command compiles the project and generates optimized static assets in the build directory as well as the node server files.

To test the production build locally, you can use the following command:

```bash
pnpm preview
```

This will start a local server to preview the production build of Engine Analytica at [http://localhost:4173](http://localhost:4173/).
