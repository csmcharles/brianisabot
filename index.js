require('dotenv').load();
const Discord = require('discord.js');
const request = require('request');
const brian = new Discord.Client();
const TOKEN = process.env.API_TOKEN;
const brianID = process.env.PUBLIC_ID;

const express = require('express');
const app = express();
const http = require('http');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 8000;

// make express look in the `public` directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', (request, response) => {
    response.render('index');
});

app.listen(port, () => {
    // will echo 'Our app is running on http://localhost:5000 when run locally'
    console.log('Our app is running on http://localhost:' + port);

    //login to discord
    brian.login(TOKEN);

//check that the bot is ready
    brian.on('ready', () => {
        console.log('Hey buddy!\n');
    });

//brian user id: 307961074626330624
//brain emoji id: 302665504999604224

//runs any time a message is sent
    brian.on('message', (msg) => {
        //losing the game triggers
        let triggers = ['derek', 'perdi', 'feliz cumpleaños', 'himlich', 'greer', 'cumpleaños', 'perdí'];
        for (let trig of triggers) {
            if (msg.content.toLowerCase().includes(trig) && msg.author.id !== brianID) {
                console.log(msg.author.id, brianID)
                msg.reply('Perdí...');
                break;
            }
        }

        //whistling triggers
        let brianTriggers = ['whistles', 'the old man and the sea', 'tomats'];
        for (let trig of brianTriggers) {
            if (msg.content.toLowerCase().includes(trig)) {
                msg.channel.sendMessage(brian.emojis.get('302665504999604224') + ' *I THOUGHT YOU KNEW BY NOW* ' + brian.emojis.get('302665504999604224'));
                break;
            }
        }

        //buddy triggers
        let brianHello = ['hey', 'hello', 'hi', 'yo', 'sup', 'ey', 'oye'];
        brianHello.some(function (trig) {
            if ((msg.isMentioned('307961074626330624') && msg.content.toLowerCase().includes(trig)) || msg.content.toLowerCase().includes(trig + ' brian')) {
                msg.channel.sendMessage('Hey buddy!');
                return true;
            } else {
                return false;
            }
        });

        //all / commands
        if (msg.content.toLowerCase().startsWith('/')) {
            let cmd = msg.content.toLowerCase().replace('/', '');
            let cmdInfo = '\nSource: ' + msg.author.username + '\nTime: ' + msg.createdAt + '\n';
            switch (true) {
                case cmd === 'mark':
                case cmd === 'nota':
                    console.log('/mark' + cmdInfo);
                    msg.reply('You got a ' + highestRand(5, 12));
                    break;
                case cmd.startsWith('weather '):
                    console.log('/weather' + cmdInfo);
                    let location = cmd.replace('weather ', '');
                    if (location !== '') {
                        let url = "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&APPID=c8c1e154402ef55a0e2699a2bbc9fa34";
                        let kelvin = -273.15;
                        let message = '';
                        getJSON(url, function (data) {
                            if (data.cod === 200) {
                                function getWeatherDesc(weather) {
                                    let line = '';
                                    weather.forEach(function (desc, id, array) {
                                        if (id !== array.length - 1) {
                                            if (id === 0) {
                                                let first = desc.description.charAt(0).toUpperCase() + desc.description.slice(1);
                                                line += first + ' and ';

                                            } else {
                                                line += desc.description + ' and ';
                                            }
                                        } else {
                                            if (array.length === 1) {
                                                let first = desc.description.charAt(0).toUpperCase() + desc.description.slice(1);
                                                line += first + '.';
                                            } else {
                                                line += desc.description + '.';
                                            }
                                        }
                                    });
                                    return line;
                                }

                                let msgLines = [
                                    "Here's the weather in " + data.name + " today:",
                                    getWeatherDesc(data.weather) + " It's currently " + Math.round(data.main.temp + kelvin) + "°C."
                                ];

                                //transcribe to a single message
                                msgLines.forEach(function (line) {
                                    message += line + '\n\n';
                                })
                                msg.channel.sendMessage(message);
                            } else {
                                msg.channel.sendMessage("*Sorry guys, not a good idea*\n\nCity not found");
                            }
                        });
                    }
                    break;
                case cmd.startsWith('ask '):
                    let query = cmd.replace('ask ', '').replace(/ /g, '+');
                    console.log('/ask' + cmdInfo + 'Query: ' + cmd.replace('ask ', '') + '\n');
                    getJSON("http://api.duckduckgo.com/?q=" + query + "&format=json", function (response) {
                        let header = (response.Heading !== '' ? "**" + response.Heading + "**\n\n" : '');
                        let abstract = (response.AbstractURL || '');
                        let infobox = (response.Infobox || '');
                        let answer = (response.Answer || '');
                        
                        if (infobox.content && infobox.content.length > 0) {
                            infobox = infobox.content
                                .filter(item => item.data_type === 'string')
                                .map(item => `**${item.label}:** ${item.value}`)
                                .join('\n') + '\n\n';
                        }
                        
                        if (header && abstract && infobox) {
                            msg.channel.sendMessage(header + infobox + abstract);
                        } else if (header && abstract) {
                            msg.channel.sendMessage(header + abstract);
                        } else if (header && answer) {
                            msg.channel.sendMessage(header + answer);
                        } else {
                            msg.channel.sendMessage("*Sorry guys, not a good idea*\n\nI didn't quite get that...");
                        }
                    })
                    break;
                case cmd === 'help':
                case cmd === 'brian':
                    console.log('/help' + cmdInfo);
                    msg.channel.sendMessage("*Hey guys!* " + msg.guild.emojis.get('302665504999604224') +
                        "\n\nHere are some of the things I do:" +
                        "\n•**/ask <query>:** Ask me about something! I don't know all the answers though, I'm just an english teacher after all..." +
                        "\n•**/help:** A list of the things I do" +
                        "\n•**/mark:** Generates a completely *not random* mark for you" +
                        "\n•**/weather <city-name>:** Gets the weather in that city");
                    break;
                default:
                    console.log(msg.content + cmdInfo);
                    msg.channel.sendMessage("*Sorry guys, not a good idea*\n\nI didn't recognize that command.");
                    break;
            }
        }
    });
    
    // Ping the 
    setInterval(() => {
        getHTTP('https://brian-is-a-bot.herokuapp.com', () => {})
    }, 1500000);
});

//gets JSON from url provided
function getJSON(url, callback) {
    request({
        url: url,
        json: true
    }, function (err, response, body) {
        if (err) {
            console.log('Sorry guys, not a good idea:', error);
        } else {
            callback(body);
        }
    });
}

//gets a http request
function getHTTP(url, callback) {
    request({
        url: url
    }, function (err, response, body) {
        if (err) {
            console.log('Sorry guys, not a good idea:', error);
        } else {
            callback(body);
        }
    });
}

//random number generator for the mark generator
function highestRand(max, c) {
    max = Math.floor(max);
    let curr;
    for (let i = 0; i < c; i++) {
        curr = Math.round((Math.random() * 60) + 10) / 10;
        if (curr > max) {
            max = curr;
        }
    }
    return max;
}
