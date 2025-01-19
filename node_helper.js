const NodeHelper = require("node_helper");
const { spawn } = require("child_process");
const crypto = require("crypto");

module.exports = NodeHelper.create({
    processedImages: new Set(), // Store hashes of processed images

    start: function () {
        console.log("Starting node_helper for module: MMM-Shairportsync-color");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "PROCESS_IMAGE") {
            const imageHash = this.getImageHash(payload); // Generate a hash for the image

            // Check if the image has already been processed
            if (this.processedImages.has(imageHash)) {
                console.log("Image already processed, skipping...");
                return;
            }

            console.log("Processing image with Python...");
            this.processedImages.add(imageHash); // Add the hash to the processed set
            this.processImage(payload);
        }
    },

    getImageHash: function (base64Image) {
        // Generate a unique hash for the image data
        return crypto.createHash("md5").update(base64Image).digest("hex");
    },

    processImage: function (base64Image) {
        const pythonProcess = spawn("python3", ["modules/MMM-Shairportsync-color/color_palette_extractor.py"]);

        let pythonOutput = "";

        // Ensure base64Image is a string before writing
        if (typeof base64Image !== "string") {
            console.error("Invalid input: base64Image must be a string.");
            pythonProcess.kill(); // Ensure process is terminated
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

            // Ensure process is cleaned up
            pythonProcess.kill();
        });
    },
});
