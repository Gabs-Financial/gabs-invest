const { execSync } = require("child_process");

// Get the NODE_ENV variable
const environment = process.env.NODE_ENV || "development";

// Map environments to commands
const command = environment === "development" ? "npm run dev" : "npm start";

// Execute the appropriate command
console.log(`Running "${command}" for environment: ${environment}`);
try {
  execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error(`Failed to execute "${command}":`, error.message);
  process.exit(1);
}
