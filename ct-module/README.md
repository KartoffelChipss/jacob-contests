# Jacobs Contests ChatTriggers module

With this module, you can scrape the Jacobs Contests from the ingame calendar and upload them to the website.

There are two variants of this module:

- `jacobs-1.8` - For ChatTriggers <3.0.0 (Forge 1.8 and 1.12)
- `jacobs-1.20` - For ChatTriggers >=3.0.0 and above (Fabric 1.20)

## Installation

1. Go to the `config/ChatTriggers/modules` folder in your minecraft instance.
2. Place the `jacobs-1.8` or `jacobs-1.20` folder inside it.
3. Restart ChatTriggers by running `/ct load`. If you run `/ct modules`, there should now be a module called `JacobEvent`.
4. Go inside the `jacobs-1.8` or `jacobs-1.20` folder and open the `main.js` file.
5. Replace `ENTER API KEY HERE` at the top of the file with your api key.

## Usage

1. Go to the ingame calendar using the SkyBlock menu (Nether star in your hotbar)
2. Click through every page and press the `H` key on every page.
3. (optional) When using `jacobs-1.20`, you can check the scraped contests using `/printjacobdata` or `/prettyprintjacobdata`
4. Upload the contests using `/uploadjacobdata`
5. Done!