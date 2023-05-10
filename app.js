const fs = require("fs/promises");

// Open --> you are saving a number related to file (file descriptor )
// Read or write, or append, or get status from file 


(async () => {

    const CREATE_FILE = "create a file"
    const DELETE_FILE = "delete the file"
    const RENAME_FILE = "rename the file"
    const ADD_TO_FILE = "add to the file"


    const createFile = async (path) => {
        try {
        const existingFileHandle = await fs.open(path, "r")
        return console.log(`The file ${path} already exists.`)
        existingFileHandle.close(); 

        } catch (e) {
            // We don't have the file, now we need to create it
            const newFileHandle = await fs.open(path, "w")
            console.log("A new file was successfully created");
            newFileHandle.close();
        }
    };

    const deleteFile = async (path) => {
        try {
            await fs.unlink(path);
            console.log("The file was successfully removed")
        } catch (e) {
          if (e.code === "ENOENT") {
            console.log("No file at this path to remove.");
          } else {
            console.log("An error occurred while removing the file: ");
            console.log(e)
          }
        }
    };

    const renameFile = async (oldPath, newPath) => {
        try {
            await fs.rename(oldPath, newPath);
            console.log("The file was successfully renamed.")
        } catch (e) {
            if (e.code === "ENOENT") {
                console.log("No file at this path to rename, or the destination doesn't exist");
            } else {
                console.log("An error occurred while renaming the file: ");
                console.log(e)
            }
        }
    }

    let addedContent;

    const addToFile = async (path, content) => {
        if(addedContent === content) return;
        try {
            const fileHandle = await fs.open(path, "a");
            fileHandle.write(content);
            addedContent = content;
        } catch (e) {
            console.log("An error occurred while removing the file: ");
            console.log(e);
        }

    }

    // commands
    const commandFileHandler = await fs.open("./command.txt", "r");

    commandFileHandler.on("change", async () => {
 // Get the size of our file
           const size = (await commandFileHandler.stat()).size;
           // allocate our buffer with the size of file
           const buff = Buffer.alloc(size);
           // The location at which we want to start filling our buffer
           const offset = 0;
           // How many bytes we want to read
           const length = buff.byteLength;
           // The position that we want to start reading the file from
           const position = 0;

            // We always want to read the whole content (from beggining to end)
            const content = await commandFileHandler.read(
                buff,
                offset,
                length,
                position
            );

            const command = buff.toString("utf-8");

            // create a file;
            // create a file <path>
            if (command.includes(CREATE_FILE)) {
                const filePath = command.substring(CREATE_FILE.length + 1);
                createFile(filePath);
            }

            // delete a file
            // delete the file <path>
            if (command.includes(DELETE_FILE)) {
                const filePath = command.substring(DELETE_FILE.length + 1)
                deleteFile(filePath);
            }

            // rename the file:
            // rename the file <path> to <new-path>
            if (command.includes(RENAME_FILE)) {
                const _idx = command.indexOf(" to ");
                const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
                const newFilePath = command.substring(_idx + 4);

                renameFile(oldFilePath, newFilePath);
            }

            // add to file:
            // add to the file <path> this content: <content>

            if (command.includes(ADD_TO_FILE)) {
                const _idx = command.indexOf(" this content: ");
                const filePath = command.substring(ADD_TO_FILE + 1, _idx);
                const content = command.substring(_idx + 15 )
                addToFile(filePath, content);
            }

    
    });

    // watcher...
    const watcher = fs.watch("./command.txt");

    for await (const event of watcher) {
        if (event.eventType === "change") {
            commandFileHandler.emit("change");
        }
    }
})();