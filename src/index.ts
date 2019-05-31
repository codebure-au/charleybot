import express from "express";
import child_process from "child_process"
import Discord from "discord.io"

const app = express();

const root = '/usr/src/app';
const bannedWords = [
  'a', 'an', 'the', 'for', 'and', 'nor', 'but', 'or', 'yet', 'so', 
  'at', 'around', 'by', 'after', 'along', 'for', 'from', 'of', 'on', 'to', 'with', 'without'
]

const bot = new Discord.Client({
  token: "NTgzNTc2NjExMDc3NzUwODA1.XO-YjQ.uNnl1zEaS5VUFfd-Q6g_NnPkj7c",
  autorun: true
})

setInterval(() => {
  bot.disconnect();

  setTimeout(() => {
    bot.connect();
  }, 5000)
}, 1000 * 60 * 60 * 12)

bot.on('disconnect', () => {
  console.log('disconnect event received');

  setTimeout(() => {
    bot.connect();
  }, 5000)
})

bot.on('ready', () => {
  console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('message', async (user, userID, channelID, message, event) => {
  const exp = /^\!sunny (.*)$/

  if(exp.test(message)){
    const match = exp.exec(message);
    if(!match) return

    try {
      const text = match[1];
      const fileName = await generateImage(text);
      console.log('file %s generated with text %s', fileName, text)

      bot.uploadFile({
        file: `${root}/${fileName}`,
        to: channelID
      }, () => {
        child_process.exec(`rm -f ./${fileName}`, (error, stdout, stderr) => {
          console.log(error ? "file not deleted" : "file deleted");
        })
      })
    } catch (e) {
      console.log(e)
      bot.sendMessage({
        to: channelID,
        message: "shits fucked"
      })
    }
  }
});

app.get('/', async (req, res) => {
  console.log('visited /')

  try {
    const fileName = await generateImage('The Gang Generates Text. Way too much fucking text. Like this is going to be really long.')
    res.sendFile(root + '/' + fileName);
  } catch (e) {
    res.json(e);
  }
})

app.listen(3000, () => {
  console.log('listening on port 3000');
})

const generateImage = (input: string) => {
  return new Promise((resolve, reject) => {
    try {
      let text = input.replace('"', '\\"');
      text = input.replace('$', '\\$');

      let splitStr = text.split(' ');
      splitStr = splitStr.map((word, index) => {
        const exp = /^.*\.$/
        if(index > 0 && !exp.test(splitStr[index-1])) {
          if(bannedWords.includes(word)) return word;
        }

        return word.charAt(0).toUpperCase() + word.substring(1); 
      })
      
      text = splitStr.join(' '); 

      const fileName = new Date().getTime() + ".png";
      const command = `magick -size 1280x720 canvas:black \\
      -size 1000x -background none -font ./textile.ttf \\
      -fill white -pointsize 60 -gravity center caption:"\\"${text}\\"" \\
      -composite ${fileName}`

      console.log(command)
      child_process.exec(command, (error) => {
        if(error) {
          reject(error)
          return
        }

        resolve(fileName)
      })
    } catch (e) {
      reject(e)
    }
  });
}