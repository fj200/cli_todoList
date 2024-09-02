#! /usr/bin/env node
import fs from "fs";
import path from "path";
import readline from "readline";

const validStatuses = new Set(["done", "todo", "in-progress"]);
let counter = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to process the command
function processCommand(command) {
  const args = command.trim().split(/\s+/);
  const action = args[0];
  let option = null;
  let task = null;

  if ((action == "list" || action == "ls") && isValidStatus(args[1])) {
    option = args[1];
    task = args.slice(2).join(" ");
  } else {
    task = args.slice(1).join(" ");
  }

  switch (action) {
    case "add":
      setTask(task);
      console.log(`Added task: ${task}`);
      break;
    case "delete":
    case "d":
      deleteTask(task);
      break;
    case "update":
    case "u":
      updateTask(task);
      console.log(`Updated task: ${task}`);
      break;
    case "mark-in-progress":
    case "mip":
      updateTaskStatus(task, "in-progress");
      break;
    case "mark-done":
    case "md":
      updateTaskStatus(task, "done");
      break;
    case "list":
    case "ls":
      listTasks(option);
      break;
    case "help":
      console.log(`
          Available commands:
          - add: Add a new task.
          - delete (or d): Remove a specified task.
          - update (or u): Update an existing task.
          - mark-in-progress (or mip): Mark a task as in progress.
          - mark-done (or md): Mark a task as done.
          - list: List all tasks.
          - help: Show this help message.
        `);
      break;
    default:
      console.log(`Unknown command: ${action}`);
      console.log('Type "help" to see a list of available commands.');
      break;
  }
}

function setTask(task) {
  counter += 1;
  tasks.set(`${counter}`, { title: task, status: "todo" });
}

function updateTask(task) {
  const arg = task.split(" ");
  tasks.set(`${arg[0]}`, {
    title: `${arg.slice(1).join(" ")}`,
    status: "todo",
  });
}

function deleteTask(task) {
  if (tasks.has(task)) {
    tasks.delete(task);
    console.log(`Task '${task}' has been deleted.`);
  } else {
    console.log(`Task '${task}' not found.`);
  }
}

function updateTaskStatus(task, newStatus) {
  if (tasks.has(task)) {
    tasks.get(task).status = newStatus;
    console.log(`Task '${task}'Status has been Updated.`);
  } else {
    console.log(`Task '${task}' not found.`);
  }
}

function listTasks(status) {
  let formattedOutput = "Task List:\n";

  for (const [id, task] of tasks) {
    if (status == null || status == task.status) {
      formattedOutput += `ID: ${id} Title: ${task.title} Status: ${task.status}\n`;
    }
  }
  console.log(formattedOutput.trim());
}
// Function to check if a value is valid
function isValidStatus(status) {
  return validStatuses.has(status);
}

function isFilePresent(filePath) {
  // Resolve the full path of the file
  const fullPath = path.resolve(filePath);

  // Check if the file exists
  return fs.existsSync(fullPath);
}

function saveJsonToFile(jsonData) {
  // Define the path to the JSON file
  const jsonFilePath = path.join(process.cwd(), "tasks.json");

  try {
    // Convert JSON data to a string
    const jsonObject = Object.fromEntries(jsonData);
    const jsonString = JSON.stringify(jsonObject, null, 2); // Pretty-print with 2 spaces
    console.log(jsonData, jsonString, "json resultS");

    // Write the JSON string to the file (creates the file if it doesn't exist)
    fs.writeFileSync(jsonFilePath, jsonString, "utf-8");

    console.log(`File saved successfully at ${jsonFilePath}`);
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
  }
}

// Function to get tasks from a JSON file in the current directory
function getTasks() {
  // Define the path to the JSON file
  const jsonFilePath = path.join(process.cwd(), "tasks.json");

  console.log(jsonFilePath, "jsonFilePath");

  if (!isFilePresent(jsonFilePath)) return new Map();

  // Read the JSON file
  const data = fs.readFileSync(jsonFilePath, "utf-8");

  // Parse the JSON data
  const tasks = JSON.parse(data);
  return new Map(Object.entries(tasks));
}

function formatTasks(tasks) {
  let formattedOutput = "Task List:\n";

  for (const [id, task] of tasks) {
    formattedOutput += `ID: ${id} Title: ${task.title} Status: ${task.status}\n`;
    counter = Math.max(counter, id);
  }

  return formattedOutput.trim();
}

console.log("Welcome to todo List");

let tasks = getTasks();
console.log(typeof tasks);

if (tasks.length == 0) {
  console.log("No tasks present");
} else {
  console.log(formatTasks(tasks));
}

// Loop to keep accepting commands

// Set the prompt to indicate readiness for user input
rl.setPrompt("task-cli> ");

// Display the prompt
rl.prompt();

// Handle user input line by line
rl.on("line", (input) => {
  // Process the command entered by the user
  processCommand(input);
  // Display the prompt again for the next command
  rl.prompt();
}).on("close", () => {
  // Code to run when the readline interface is closed
  saveJsonToFile(tasks);
  console.log("Exiting...");
  process.exit(0);
});
