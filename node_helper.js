/* Magic Mirror
 * Module: MMM-Shairportsync-color
 *
 * By Your Name
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const { spawn } = require("child_process");

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node_helper for module: MMM-Shairportsync-color");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "PROCESS_IMAGE") {
            console.log("Processing image with Python...");
            this.processImage(payload); // Pass the image string to processImage
        }
    },

    processImage: function (base64Image) {
        const pythonProcess = spawn("python3", ["modules/MMM-Shairportsync-color/color_palette_extractor.py"]);

        let pythonOutput = "";

        // Ensure base64Image is a string before writing
        if (typeof base64Image !== "string") {
            console.error("Invalid input: base64Image must be a string.");
            return;
        }

        // Send base64 image to Python process
        pythonProcess.stdin.write(base64Image);
        pythonProcess.stdin.end();

        // Capture Python process output
        pythonProcess.stdout.on("data", (data) => {
            pythonOutput += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            console.error("Python error:", data.toString());
        });

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    const palette = JSON.parse(pythonOutput); // Parse JSON output from Python
                    console.log("Color palette received:", palette);
                    this.sendSocketNotification("COLOR_PALETTE", palette); // Send palette back to the frontend
                } catch (err) {
                    console.error("Error parsing Python output:", err);
                }
            } else {
                console.error(`Python process exited with code ${code}`);
            }
        });
    },
});
