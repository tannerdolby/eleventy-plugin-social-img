const captureWebsite = import("capture-website");
const slugify = require("slugify");
const fs = require("fs");
const constants = require("fs");

module.exports = (eleventyConfig, pluginNamespace) => {

    eleventyConfig.addPassthroughCopy("./src/social-share/");

    eleventyConfig.namespace(pluginNamespace, () => {
        let count = 0;
        eleventyConfig.addShortcode("socialImg", function(data) {
            // Netlify provides an environment variable `env.URL` at build time
            // this is the URL of the deployed site on Netlify - credit @5t3ph
            const siteUrl = process.env.URL || "http://localhost:8080";
            const outputDir = data.outputPath || `/social-images/`;
            const head = `<head><meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge"></head>`;

            let isValid, config, output;

            data.count = 0

            process.setMaxListeners(500);

            function formatHtml(head, body) {
                let html = `<!DOCTYPE html>${head}<body>${body}</body></html>`;
                return html;
            }

            async function generate(input, path, config) {
                const capture = await captureWebsite;
                await capture.default.file(input, path, config);
            }

            function propExist(prop) {
                return (prop && typeof prop !== 'undefined') ? true : false;
            }

            function typeCheck(prop, type) {
                return propExist(prop) && typeof prop === type;
            }

            const isObject = typeCheck(data, 'object');
            const usingTheme = typeCheck(data.theme, 'number') || typeCheck(data.theme, 'string');
            const isHighRes = typeCheck(data.highRes, 'boolean');
            const hasInput = typeCheck(data.input, 'string');

            data.overwrite = propExist(data.overwrite) ? data.overwrite : false;

            if (typeCheck(data.input, 'object') && data.input.length >= 1) {
                data.input.forEach(s => {
                    manyInputs.push(s);
                });
            }

            if (usingTheme) data["inputType"] = "html";

            if (isHighRes && data.highRes) {
                data["width"] = 1200;
                data["height"] = 630;
            }

            if (propExist(data.outputPath) && data.outputPath[data.outputPath.length - 1] != '/') {
                data.outputPath = data.outputPath.concat("/");
            } 

            if (!propExist(data.inputDir)) {
                throw new Error("Error: `inputDir` is a required shortcode argument.");
            }
            
            if (propExist(data.inputDir) && !propExist(data.input) && !propExist(data.theme)) {
                throw new Error("Error: Must provide an `input` argument.");
            }

            if (!data.fileName && data.title) {
                output = `${slugify(data.title).toLowerCase()}`;
            } else if (data.fileName && data.title) {
                output = `${data.fileName}`;
            } else if (data.fileName && !data.title) {
                output = `${data.fileName}`
            } else {
                throw new Error("Error: Must provide a `fileName` or `title` argument to shortcode");
            }

            let themes = [
                {   
                    title: "theme-one",
                    stylesheet: "./themes/css/theme-one.css",
                    html: `<style>body, .initials { background:${propExist(data.themeColor) ? data.themeColor : 'inherit' }; }</style>
                        <div class="wrapper">
                    <div class="container">
                    <h1 style="color: ${propExist(data.fontColor) ? data.fontColor : 'inherit'}">${data.title}</h1>
                    <div class="row">
                        <div class="metadata">
                        <img id="h-img" class="headshot" src="${data.img}" alt="Social share headshot">
                        <p id="init-c" style="color: ${propExist(data.fontColor) ? data.fontColor : 'inherit'}; border: .12rem solid ${propExist(data.fontColor) ? data.fontColor : 'inherit'}" class="initials">${data.initials}</p>
                        </div>
                    </div></div></div>`,
                    css: `@import url(https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap);@import url(https://fonts.googleapis.com/css2?family=Candal&display=swap);*,::after,::before{box-sizing:border-box}:root{--page-bg:#fff;--bottom-border-bg:#fff;--title-font:'Noto Serif',sans-serif;--bulky-font:'Candal','Noto Serif',sans-serif;--date-font:'Archivo Black','Noto Serif',sans-serif}body{font-family:'Noto Serif',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:0}.wrapper{padding:1.5rem 0;overflow:hidden}.container{display:grid;grid-template-columns:repeat(6,minmax(7rem,1fr));margin:0 auto;padding:0 1rem}.container h1{grid-column:1/6;margin-bottom:.5rem;height:8rem;margin:.75rem 0 .75rem 0;line-height:1.4;font-size:2.3rem;text-align:left;max-width:25ch;font-family:var(--bulky-font);font-family:"Open Sans",sans-serif;color:#111;font-weight:600}.metadata,.row{margin-top:0;display:flex;align-items:center}.row{justify-content:space-between;grid-column:1/6;padding-bottom:.25rem}.metadata{position:relative;justify-content:space-between;width:100%;margin-top:4rem;z-index:999}.metadata>img{width:37px;height:38px;object-fit:cover;max-width:100%; z-index: 999; position: relative; margin-top: .5rem; }.headshot{border-radius:50%}.metadata .logo{width:30px;height:30px}.metadata p{margin-left:1rem;margin-bottom:.5rem;color:#222;font-family:var(--date-font);font-family:"Noto Serif",sans-serif;font-weight:550}.bottom-bar{position:relative;width:680px;left:-10%;height:1.4rem;top:.1rem}.initials{border:.12rem solid #222;padding:.35rem;padding-bottom:.3rem}`
                },
                { 
                    title: "theme-two",  
                    stylesheet: "./themes/css/theme-two.css",
                    html: `<style>body { background:${propExist(data.themeColor) ? data.themeColor : 'inherit' }; }</style>
                        <div class="wrapper">
                            <div class="container">
                                <h1 style="color: ${propExist(data.fontColor) ? data.fontColor : 'inherit'}">${data.title}</h1>
                            </div>
                        </div>`,
                    css: `@import url(https://fonts.googleapis.com/css2?family=Candal&display=swap);*,::after,::before{box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0 auto}.wrapper{padding:.5rem 2rem; margin-top: -2rem; margin-left: -1rem; }.wrapper h1{text-align:center;font-size:2.3rem;line-height:1.5;max-width:19ch;margin:.5rem auto;font-family:Candal,sans-serif}`
                }
            ];

            if (propExist(data.theme) && hasInput) {
                throw new Error("Do not include `input` argument when using a theme");
            }

            if (typeof data.theme == 'string') {
                parseInt(data.theme, 10);
            }

            switch (data.theme) {
                case 1:
                    data.input = formatHtml(head, themes[0]["html"]);
                    data.inputType = "html";

                    if (propExist(data.styles)) {
                        data.styles.unshift(themes[0]["css"]);
                    } else {
                        data.styles = [themes[0]["css"]];
                    }

                    if (isHighRes && data.highRes) {
                        data.styles.push(`
                        .wrapper { overflow: auto; } 
                        .container h1 { 
                            font-size: 4.5rem; 
                            position: fixed;
                            top: 3rem;
                            left: 2rem;
                            max-width: 20ch;
                            display: flex;
                            flex-direction: column; 
                            justify-content: space-between;
                        }
                        #h-img { width: 70px; height: 70px; }
                        #init-c { font-size: 1.9rem; text-align: center; padding-top: 15px; padding-right: 1.1rem padding-left: 1.1rem; width: 67px; height: 67px;}
                        .metadata {position: fixed; bottom: 3rem; left: 0rem; padding: 0 2rem;}`)
                    }

                    if (!(propExist(data.title) && propExist(data.img) && propExist(data.initials))) {
                        throw new Error("Missing arguments for theme 1: title, img, initials are required");
                    }

                    break;
                case 2:
                    data.input = themes[1]["html"];
                    data.inputType = "html";

                    if (propExist(data.styles)) {
                        data.styles.unshift(themes[1]["css"]);
                    } else {
                        data.styles = [themes[1]["css"]];
                    }

                    if (isHighRes && data.highRes) {
                        data.styles.push(`.wrapper h1 { font-size: 4.5rem; max-width: 19ch; } .wrapper { margin-top: -4rem; }`);
                    }

                    if (!propExist(data.title)) {
                        throw new Error("Missing arguments for theme 2: title is required");
                    }

                    break;
                default:
                    data.styles = propExist(data.styles) ? data.styles : undefined;
            }

            if (!data.input && !data.theme) {
                throw new Error("Undefined `input` source: A URL, file path, or HTML is required as input.");
            }

            if (isObject) {
                isValid = true;
                config = {
                    input: typeCheck(data.input, 'string') ? data.input : undefined,
                    inputType: typeCheck(data.inputType, 'string') ? data.inputType : 'url',
                    inputDir: typeCheck(data.inputDir, 'string') ? data.inputDir : '.',
                    width: typeCheck(data.width, 'number') ? data.width : 600,
                    height: typeCheck(data.height, 'number') ? data.height : 315,
                    type: typeCheck(data.type, 'string') ? data.type : 'png',
                    scaleFactor: typeCheck(data.scaleFactor, 'number') ? data.scaleFactor : 2,
                    fullPage: typeCheck(data.fullPage, 'boolean') ? data.fullPage : false,
                    defaultBackground: typeCheck(data.defaultBackground, 'boolean') ? data.defaultBackground : true,
                    delay: typeCheck(data.delay, 'number') ? data.delay : 0,
                    disableAnimations: typeCheck(data.disableAnimations, 'boolean') ? data.disableAnimations : false,
                    isJavaScriptEnabled: typeCheck(data.isJavaScriptEnabled, 'boolean') ? data.isJavaScriptEnabled : true,
                    headers: typeCheck(data.headers) ? data.headers : {},
                    debug: typeCheck(data.debug, 'boolean') ? data.debug : false,
                    darkMode: typeCheck(data.darkMode, 'boolean') ? data.darkMode : false,
                    inset: typeCheck(data.inset, 'number') ? data.inset : 0,
                    launchOptions: typeCheck(data.launchOptions, 'object') ? data.launchOptions : {},
                    overwrite: typeCheck(data.overwrite, 'boolean') ? data.overwrite : false,
                    preloadFunction: typeCheck(data.preloadFunction, 'function') ? data.preloadFunction : undefined,
                    debugOutput: typeCheck(data.debugOuput, 'boolean') ? data.debugOutput : false
                };

                const extraConfig = [
                    "emulateDevice",
                    "waitForElement",
                    "element",
                    "hideElements",
                    "removeElements",
                    "clickElement",
                    "scrollToElement",
                    "offsetFrom",
                    "offset",
                    "modules",
                    "scripts",
                    "styles",
                    "userAgent",
                    "cookies",
                    "authentication",
                    "username",
                    "password",
                    "beforeScreenshot"
                ];

                extraConfig.forEach(prop => {
                    if (propExist(data[prop])) {
                        config[prop] = data[prop];
                    }
                });
                
                // todo: refactor this mess lol
                if (propExist(data.fileName) && propExist(data.outputPath) && propExist(data.title)) {
                    outputPath = `${data.inputDir}${data.outputPath}${data.fileName}.${config.type}`;
                } else if (propExist(data.outputPath) && propExist(data.title) && !propExist(data.fileName)) {
                    outputPath = `${data.inputDir}${data.outputPath}${slugify(data.title).toLowerCase()}.${config.type}`;
                } else if (!propExist(data.outputPath) && propExist(data.title) && !propExist(data.fileName)) {
                    outputPath = `${data.inputDir}/social-images/${slugify(data.title).toLowerCase()}.${config.type}`;
                } else if (!propExist(data.outputPath) && propExist(data.fileName) && !propExist(data.title)) {
                    outputPath = `${data.inputDir}/social-images/${data.fileName}.${config.type}`;
                } else if (propExist(data.fileName) && propExist(data.input) && propExist(data.outputPath)) {
                    outputPath = `${data.inputDir}${data.outputPath}${data.fileName}.${config.type}`;
                } else if (propExist(data.fileName) && propExist(data.outputPath) && propExist(data.title)) {
                    outputPath = `${data.inputDir}${data.outputPath}${data.fileName}.${config.type}`;
                } else {
                    outputPath = `${data.inputDir}/social-images/${data.fileName}.${config.type}`;
                }

                fs.access(`${data.inputDir}/social-images/`, constants.FS_OK, (err) => {
                    if (err) {
                        if (!propExist(data.outputPath)) {
                            fs.mkdir(`${data.inputDir}/social-images/`, (err) => {
                                if (err) throw err;
                            });
                        }
                    }
                });

                const partialPath = `${data.inputDir}${data.outputPath}`;
                const fullPath = `${partialPath}${output}.${config.type}`;

                fs.access(partialPath, constants.FS_OK, (err) => {
                    if (err && propExist(data.outputPath)) {                       
                        fs.mkdir(partialPath, { recursive: true }, (err) => {
                            if (err) throw err;
                        });
                    }
                });

                fs.access(fullPath, constants.F_OK, (err) => {
                    if (err) {
                        console.log('here')
                        if (isValid) {
                            console.log(`Generating image: ${fullPath}`);
                            generate(data.input, fullPath, config);
                        }
                    } else {
                        if (data.overwrite && count === 0) {
                            console.log(`Generating image: ${fullPath}`);
                            generate(data.input, fullPath, config);
                            // to avoid browsersync continuing to executre generate()
                            // since data.overwrite might be true when running npm run dev
                            count += 1
                        }
                    }
                });
            } else {
                isValid = false;
                if (!hasInput && !usingTheme) {
                    throw new Error("Missing input source. Provide a 'input' argument to shortcode.");
                }
            }

            if (data.debugOutput) console.log(config);

            return `${siteUrl}${outputDir}${output}.${config.type}`.trim();
        });
    });

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    }

}