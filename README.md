warning: this is very scuffed, very laggy.

architecture:
[-] we use a ngrok tunnel + rust server + react native expo
[-] user on ipad scans expo qr code and writes in hardcoded tunnel/ip address, connects
[-] poll for any input on ipad, trigger x/z/lmb click on screen
[-] attempt to track apple pencil direction
[-] need to use proper mouse movement for osu to detect cursor

this thing runs at a 15-20 ms delay and the precision is so off i couldn't even play a 2 star beatmap.
