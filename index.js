const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const youtubeDl = require('youtube-dl-exec');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
  console.log('Connection success!');
});

client.on('message', async message => {
  
  if(message.body.includes("youtube.com") && message.body.includes("mp3")){

    client.sendMessage(message.from, "Downloading, please wait...")

    const videoUrl = message.body.split(' ')[0].split('=')[1].split('&')[0]
    const options = {
      extractAudio: true,
      audioFormat: 'mp3',
    };
    
    await youtubeDl(videoUrl, options)
      .then(output => {
        const mp3Path = `${output.split('\n')[6].split(": ")[1].split(".webm")[0]}.mp3`;
        console.log('File:', mp3Path);
        const media = MessageMedia.fromFilePath(`./${mp3Path}`)
        
        client.sendMessage(message.from, media)
  
        setTimeout(() => {
          fs.unlink(`./${mp3Path}`, (error) => {
            if (error) {
              console.error('ERROR:', error);
            } else {
              return
            }
          });
        }, 1000);
      })
      .catch(error => {
        console.error('ERROR:', error);
      });
  }
})

client.initialize();