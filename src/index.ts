import child_process from "child_process";
import Discord from "discord.js";

const root = "/usr/src/app";
const uncapitalisedWords = [
  "a",
  "an",
  "the",
  "for",
  "and",
  "nor",
  "but",
  "or",
  "yet",
  "so",
  "at",
  "around",
  "by",
  "after",
  "along",
  "for",
  "from",
  "of",
  "on",
  "to",
  "with",
  "without",
];

const generateImage = (input: string) => {
  return new Promise<string>((resolve, reject) => {
    try {
      let text = input.replace(/[^a-zA-Z0-9' ]/g, "").trim();

      let splitStr = text.split(" ");
      splitStr = splitStr.map((word, index) => {
        const exp = /^.*\.$/;

        //always capitalise the first word, or any word after a full stop
        if (index > 0 && !exp.test(splitStr[index - 1])) {
          //if this word is not the first word, and does not come after a full stop
          //check if the word should not be capitalised
          if (uncapitalisedWords.includes(word)) return word; //return uncapitalised word
        }

        return word.charAt(0).toUpperCase() + word.substring(1);
      });

      text = splitStr.join(" ");

      const fileName = new Date().getTime() + ".png";
      const command = `magick -size 1280x720 canvas:black \\
      -size 1000x -background none -font ./includes/textile.ttf \\
      -fill white -pointsize 60 -gravity center caption:"\\"${text}\\"" \\
      -composite ${fileName}`;

      console.log(command);
      child_process.exec(command, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(fileName);
      });
    } catch (e) {
      reject(e);
    }
  });
};

let playingAlt = false;

import { token } from "./config.json";

const client = new Discord.Client();

client.on("ready", () => {
  console.log("client ready");
});

client.on("message", async ({ content, channel }) => {
  const exp = new RegExp(`(?:^\\!sunny|<@!?${client.user?.id}>) (.*)$`);

  if (exp.test(content)) {
    const match = exp.exec(content);
    if (!match) return;

    try {
      const text = match[1];
      const fileName = await generateImage(text);
      console.log("file %s generated with text %s", fileName, text);

      const attachment = new Discord.MessageAttachment(
        `${root}/${fileName}`,
        fileName
      );
      await channel.send(attachment);
      child_process.exec(`rm -f ./${fileName}`, (error) => {
        console.log(error ? "file not deleted" : "file deleted");
      });
    } catch (e) {
      console.log(e);
    }
  }
});

client.on("error", (error) => {
  console.log("ERROR", error);
});

client.setInterval(() => {
  playingAlt = !playingAlt;

  client.user?.setPresence({
    activity: {
      type: "LISTENING",
      name: playingAlt
        ? `!sunny <message>`
        : `on ${Object.keys(client.guilds.cache).length} servers`,
    },
  });
}, 30 * 1000);

client.login(token);
