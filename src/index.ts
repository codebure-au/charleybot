import child_process from "child_process";
import Discord from "discord.io";

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
let playingAlt = false;

import { discordOptions } from "./config";

const getClient = () => {
  const bot = new Discord.Client(discordOptions);

  bot.on("connect", () => {
    console.log(new Date().toISOString(), "- connect event received");
  });

  bot.on("disconnect", () => {
    console.log(new Date().toISOString(), "- disconnect event received");

    setTimeout(() => {
      bot.connect();
    }, 5000);
  });

  bot.on("ready", () => {
    console.log("Logged in as %s - %s\n", bot.username, bot.id);

    setInterval(() => {
      playingAlt = !playingAlt;
      bot.setPresence({
        game: {
          name: playingAlt
            ? `!sunny <message>`
            : `on ${Object.keys(bot.servers).length} servers`,
          type: 1,
        },
        idle_since: new Date().getTime(),
      });
    }, 1000 * 10);
  });

  bot.on("message", async (user, userID, channelID, message, event) => {
    const exp = /^\!sunny (.*)$/;

    if (exp.test(message)) {
      const match = exp.exec(message);
      if (!match) return;

      try {
        const text = match[1];
        const fileName = await generateImage(text);
        console.log("file %s generated with text %s", fileName, text);

        bot.uploadFile(
          {
            file: `${root}/${fileName}`,
            to: channelID,
          },
          () => {
            child_process.exec(
              `rm -f ./${fileName}`,
              (error, stdout, stderr) => {
                console.log(error ? "file not deleted" : "file deleted");
              }
            );
          }
        );
      } catch (e) {
        console.log(e);
      }
    }
  });

  return bot;
};

getClient();

setTimeout(() => {
  console.log(new Date().toISOString(), "- ending script for the day");
  process.exit();
}, 1000 * 60 * 60 * 24);

const generateImage = (input: string) => {
  return new Promise((resolve, reject) => {
    try {
      let text = input.replace(/[^a-zA-Z0-9' ]/g, "");

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
