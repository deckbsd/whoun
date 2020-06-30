const puppeteer = require('puppeteer')
const htmlparser = require("htmlparser2")
const fs = require("fs")

let pseudos = []

async function loginTweeter(page, twitter_account, password) {
    try {
        /** Define twitter fields */
        let twitterAccount = {
            userField: "input[name='session[username_or_email]']",
            passField: "input[name='session[password]']",
            loginSubmit: ".EdgeButton"
        }

        await page.waitFor(5000)

        await page.waitForSelector(twitterAccount.userField)
        await page.click(twitterAccount.userField)
        await page.keyboard.type(twitter_account)

        await page.waitForSelector(twitterAccount.passField)
        await page.click(twitterAccount.passField)
        await page.keyboard.type(password)

        await page.waitFor(2000)

        await page.click('div[data-testid="LoginForm_Login_Button"]')
    } catch (err) {
        console.log(err)
        return err
    }
}

async function get_links(page){
    let bodyHTML = await page.content()
    let section = false
    let a = false
    const parser = new htmlparser.Parser({
        onopentag: (name, attrib) => {
            if(name === "section" && attrib.role != undefined && attrib.role === "region"){
                section = true
            }

            if(name === "a" && attrib.dir != undefined && attrib.dir === "ltr" && section === true){
                a = true
            }
        },
        ontext: (text) => {
            if(text.startsWith('@') && section === true && a === false)
                if (!pseudos.includes(text))
                    pseudos.push(text)
        },
        onclosetag: (name, attrib) => {
            if(name === "section" && section === true){
                section = false
            }

            if(name === "a" && a === true &&section === true){
                a = false
            }
        },
    }, {decodeEntities: true})
    parser.write(bodyHTML)
    parser.end()
}

async function scrollToBottom(page) {
    const distance = 100 // should be less than or equal to window.innerHeight
    const delay = 100
    while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
        await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y) }, distance)
        await page.waitFor(delay)
        get_links(page)
    }
}

async function run(){
    if(process.argv.length < 5){
        console.log("Missing arguments  [account password account_to_check]")
        process.exit(1)
    }

    let headless = true
    let twitter_account = process.argv[2]
    let password = process.argv[3]
    let account_to_check = process.argv[4]

    if(process.argv.length == 6 && process.argv[5] == 'v'){
        headless = false
    }
    
    let filename = "pseudos_" + account_to_check + ".txt"
    let previous_pseudos = null
    try {
        let file_content = fs.readFileSync(filename, "utf8")
        previous_pseudos = file_content.split(/\n|\r/g)
    }catch(err){
        console.log("No pseudos file found. A first one will be created")
    }

    const browser = await puppeteer.launch({headless: headless})
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    console.log("Connecting to twitter...")
    await page.goto('https://twitter.com')
    await loginTweeter(page, twitter_account, password)
    await page.waitFor(3000)

    console.log("Connecting https://twitter.com/" + account_to_check + "/followers...")
    await page.goto("https://twitter.com/" + account_to_check + "/followers")
    await page.waitFor(5000)

    console.log("Scrolling the followers page (this can take times)...")
    await scrollToBottom(page)

    console.log("Found : " + pseudos.length + " followers")
    file = fs.createWriteStream(filename)
    file.on('error', function(err) { console.log("Cannot open the file") })
    pseudos.forEach(function(v) { file.write(v + '\n') })
    file.end()

    console.log("Unfollower(s) : ")
    if(previous_pseudos !== null){
        let result = previous_pseudos.filter(e => !pseudos.find(a => e === a))
        console.log(result)
    }

    await browser.close()
}

run()