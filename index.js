import axios from "axios";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import puppeteer from "puppeteer";
import Pushover from "node-pushover";
import cron from "node-cron";

cron.schedule("* * 2 * *", () => {
  (async () => {
    /* Loading the environment variables from the .env file. */
    const { __dirname } = getPaths(import.meta.url);
    dotenv.config({ path: path.join(__dirname, "./.env") });

    /* Clear the cookies.json file. */
    await fs.writeFile("./cookies.json", JSON.stringify([], null, 2));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const siteURL = process.env.SITE_URL || "https://fuel.avias.ua/";

    await page.goto(siteURL);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    /* Waiting for the phone input field to appear and then typing the phone into it. */
    const searchPhoneSelector = "input[name='phone']";
    await page.waitForSelector(searchPhoneSelector);
    await page.type(searchPhoneSelector, process.env.PHONE_NUMBER);

    /* Waiting for the password input field to appear and then typing the password into it. */
    const searchPasswordSelector = "input[name='static_password']";
    await page.waitForSelector(searchPasswordSelector);
    await page.type(searchPasswordSelector, process.env.PASSWORD);

    /* Clicking the button to submit form. */
    const confirmBtnSelector = "button[type='button']";
    await page.waitForSelector(confirmBtnSelector);
    await page.click(confirmBtnSelector);

    /* Waiting for the login page to load. */
    const loginSelector = ".login";
    await page.waitForSelector(loginSelector);

    /* Saving the cookies to a file. */
    const cookies = await page.cookies();
    await fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2));

    /* Creating a new instance of the Pushover class. */
    const push = new Pushover({
      token: process.env.PUSHOVER_TOKEN,
      user: process.env.PUSHOVER_USER,
    });

    const sKey = await getCookie("skey2");
    if (sKey) {
      try {
        const region = process.env.REGION || "SU";
        const gas_station = process.env.GAS_STATION || "B44";
        const { data } = await axios.get(
          `${siteURL}client_api/v1/1/user_accounts/1591416/stations/_${region}00${gas_station}?mode=show&_lang=uk`,
          {
            headers: {
              cookie: `skey2=${sKey}`,
            },
          }
        );
        const {
          data: { units },
        } = data;

        const fuel = process.env.FUEL || "95";

        if (units && units[fuel]) {
          const { rate, status } = units[fuel];
          if (status === "ok") {
            return push.send(
              "Avias fuel",
              `Fuel ${fuel} is available \n Price: ${rate.toFixed(2)} UAH`
            );
          }
        }
      } catch (error) {
        console.log(error);
        return await browser.close();
      }
    } else {
      console.log("No skey2 cookie found");
      await browser.close();
    }

    await browser.close();
  })();
});

/**
 * It takes a file URL and returns an object with the file's pathname and its directory name
 * @param fileUrl - The URL of the file to be loaded.
 * @returns An object with two properties, __filename and __dirname.
 */
function getPaths(fileUrl) {
  const { pathname } = new URL(fileUrl);
  const __filename = pathname;
  const __dirname = path.dirname(pathname);

  return { __filename, __dirname };
}

/**
 * It reads the cookies.json file, parses it into an array of objects, finds the cookie with the name
 * that matches the cookieName argument, and returns the value of that cookie
 * @param cookieName - The name of the cookie you want to get the value of.
 * @returns The value of the cookie with the name cookieName
 */
async function getCookie(cookieName) {
  const cookies = await fs.readFile("./cookies.json", "utf-8");
  const cookie = JSON.parse(cookies);
  const cookieValue = cookie.find((c) => c.name === cookieName)?.value;
  return cookieValue;
}
