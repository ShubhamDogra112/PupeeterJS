const pup = require("puppeteer");
let tab;
let id = "vobip91824"
let password = "12345678";
const browser = pup.launch({
	headless: false,  //false means browser is going to visible
	defaultViewport: false
})
//everything is promise 
browser.then(br => {
	return br.pages();
})
.then(pages => {
	tab = pages[0];
	return tab.goto("https://www.hackerrank.com/auth/login");
})
.then(async () => {
	await tab.type("#input-1", id);
	return tab.type("#input-2", password);
})
.then(()=>{
	return tab.click(".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled");
})
.then(async () => {
	await tab.waitForSelector("#base-card-1-link", {visible: true});
	await tab.click("#base-card-1-link")

	await tab.waitForSelector(".playlist-card", {visible: true});
	let challenges = await tab.$$(".playlist-card") //for finding elements
	await challenges[0].click(".ui-btn");

	await tab.waitForSelector(".js-track-click.challenge-list-item", {visible: true});
	return tab.$$(".js-track-click.challenge-list-item")
})
.then(data => {
	let urls = [];
	//creating an array of prmoises 
	for(let d of data){
		let url = tab.evaluate(e => e.getAttribute("href"), data[0]);
		urls.push(url);
	}
	return Promise.all(urls);	
})
.then(async data => {
	// for(let d of data){
		await solve('https://hackerrank.com' + data[1]);
	// }
})
.catch(err => {
	console.error(err);
})

async function solve(url){
	let newurl = url.replace('?',"/editorial?");
	return new Promise(async (resolve, reject) => {
		await tab.goto(newurl)
		let data = [];
		let languages = await tab.$$(".hackdown-content h3");
		for(let l of languages){
			let name = await tab.evaluate(e => e.textContent, l);
			data.push(name);
		}

		let Allcodes = await tab.$$(".highlight");
		for(let i in data){
			if(data[i] == "C++"){
				let code = await tab.evaluate(e => e.textContent, Allcodes[i]);
				await tab.goto(url);
				await tab.waitForSelector(".monaco-scrollable-element.editor-scrollable.vs", {visible: true})

				//click on the checkbox
				await tab.waitForSelector(".custom-input-checkbox",{visible: true})
				await tab.click(".custom-input-checkbox")
				await tab.type(".custominput", code)
				await tab.keyboard.down("Control");
				await tab.keyboard.press("A");
				await tab.keyboard.press("X");
				await tab.keyboard.up("Control");

				//writing code in the editor
				await tab.click(".monaco-scrollable-element.editor-scrollable.vs")
				await tab.keyboard.down("Control");
				await tab.keyboard.press("A");
				await tab.keyboard.press("V");
				await tab.keyboard.up("Control");

				//submitting the code to the editor
				await tab.click(".pull-right.btn.btn-primary.hr-monaco-submit")
				await tab.waitForSelector(".congrats-wrapper")
			}
		}
		resolve();
	})
}