require('dotenv').load();
const Discord = require('discord.js');
const request = require('request');
const brian = new Discord.Client();
const TOKEN = process.env.API_TOKEN;
const ID_PUBLIC = 307961074626330624;

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
    var triggers = ['derek', 'perdi', 'feliz cumpleaños', 'himlich', 'greer', 'cumpleaños', 'perdí'];
    triggers.forEach(function (trig) {
        if (msg.content.toLowerCase().includes(trig) && msg.author.id != ID_PUBLIC) {
            msg.reply('Perdí...');
        }
    });

    var brianTriggers = ['whistles', 'the old man and the sea', 'tomats'];

    brianTriggers.forEach(function (trig) {
        if (msg.content.toLowerCase().includes(trig)) {
            msg.channel.sendMessage(brian.emojis.get('302665504999604224') + ' *I THOUGHT YOU KNEW BY NOW* ' + brian.emojis.get('302665504999604224'));
        }
    });

    var brianHello = ['hey', 'hello', 'hi', 'yo', 'sup', 'ey', 'oye'];

    var e = {};
    brianHello.some(function (trig) {
        if ((msg.isMentioned('307961074626330624') && msg.content.toLowerCase().includes(trig)) || msg.content.toLowerCase().includes(trig + ' brian')) {
            msg.channel.sendMessage('Hey buddy!');
            return true;
        } else {
            return false;
        }
    })

    //all / commands
    if (msg.content.toLowerCase().startsWith('/')) {
        var cmd = msg.content.toLowerCase().replace('/', '');
        var cmdInfo = '\nSource: ' + msg.author.username + '\nTime: ' + msg.createdAt + '\n';
        switch (true) {
            case cmd == 'mark':
            case cmd == 'nota':
                console.log('/mark' + cmdInfo);
                msg.reply('You got a ' + highestRand(1, 7, 7));
                break;
            case cmd.startsWith('weather '):
                console.log('/weather' + cmdInfo);
                var location = cmd.replace('weather ', '');
                if (location != '') {
                    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + location + "&APPID=c8c1e154402ef55a0e2699a2bbc9fa34";
                    var kelvin = -273.15;
                    var message = '';
                    getJSON(url, function (data) {
                        if (data.cod == 200) {
                            function getWeatherDesc(weather) {
                                var line = '';
                                weather.forEach(function (desc, id, array) {
                                    if (id != array.length - 1) {
                                        if (id == 0) {
                                            var first = desc.description.charAt(0).toUpperCase() + desc.description.slice(1);
                                            line += first + ' and ';

                                        } else {
                                            line += desc.description + ' and ';
                                        }
                                    } else {
                                        if (array.length == 1) {
                                            var first = desc.description.charAt(0).toUpperCase() + desc.description.slice(1);
                                            line += first + '.';
                                        } else {
                                            line += desc.description + '.';
                                        }
                                    }
                                });
                                return line;
                            }

                            var msgLines = [
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
                var query = cmd.replace('ask ', '').replace(/ /g, '+');
                console.log('/ask' + cmdInfo + 'Query: ' + cmd.replace('ask ', '') + '\n');
                getJSON("http://api.duckduckgo.com/?q=" + query + "&format=json", function (response) {
                    header = (response.Heading != '' ? "**" + response.Heading + "**\n\n" : '');
                    abstract = (response.AbstractURL != '' ? response.AbstractURL : '');
                    if(response.Heading != '' || response.Abstract != ''){
                        msg.channel.sendMessage(header + abstract);
                    } else if(response.Answer != ''){
                        msg.channel.sendMessage(header + response.Answer);
                    } else {
                        msg.channel.sendMessage("*Sorry guys, not a good idea*\n\nI didn't quite get that...");
                    }
                })
                break;
            case cmd == 'help':
            case cmd == 'brian':
                console.log('/help' + cmdInfo);
                msg.channel.sendMessage("*Hey guys!* " + msg.guild.emojis.get('302665504999604224') +
                    "\n\nHere are some of the things I do:" +
                    "\n•**/ask <query>:** Ask me about something! I don't know all the answers though, I'm just an english teacher after all..." +
                    "\n•**/help:** A list of the things I do" +
                    "\n•**/mark:** Generates a completely *not random* mark for you" +
                    "\n•**/weather <city-name>:** Gets the weather in that city");
                break;
            default:
                console.log(msg.content + cmdInfo)
                msg.channel.sendMessage("*Sorry guys, not a good idea*\n\nI didn't recognize that command.");
                break;
        }
    }
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
function highestRand(min, max, c) {
    min = Math.ceil(min);
    max = Math.floor(max);
    var max = 0;
    var curr;
    for (var i = 0; i < c; i++) {
        curr = Math.round((Math.random() * 60) + 10) / 10;
        if (curr > max) {
            max = curr;
        }
    }
    return max;
};