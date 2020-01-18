const { WebhookClient, RichEmbed } = require("discord.js")
const fs = require("fs")
const config = require("./config")
const data = require("./data.json")
const webhook = new WebhookClient(config.id, config.token, { disableEveryone: true })
const RSSFeedEmitter = require("rss-feed-emitter")
const feed = new RSSFeedEmitter()

console.log("[WEBHOOK] Ready!")

feed.add({ url: "http://feeds.feedburner.com/scnsrc/rss?format=xml", refresh: 60000 }) // every minute
feed.on("new-item", async item => {
    console.log("[FEED] New item")
    if (data.feed.includes(item.guid)) {
        console.log("[DATA] Exists")
        return
    } else {
        data.feed.push(item.guid)
        await fs.writeFileSync("./data.json", JSON.stringify(data))
        console.log("[DATA] Wrote to data.json")
    }
    const categories = item.categories.join(" | ")
    const ignoreList = ["Offtopic", "Applications", "Music"]
    if (categories.some(cat => ignoreList.includes(cat))) return
    let color = categories.includes("TV") ? "AQUA" : categories.includes("Movies") ? "PURPLE" : "GREY"

    const embed = new RichEmbed()
        .setAuthor(categories)
        .setTitle(item.title)
        .setURL(item.link)
        .setColor(color)
        .setTimestamp(item.pubDate)

    console.log("[HOOK] Sending message")
    webhook.send("New release!", { embeds: [embed] })
     .then(msg => console.log("[HOOK] Message sent!"))
     .catch(console.error)
})

process.on("unhandledRejection", err => console.log(err))