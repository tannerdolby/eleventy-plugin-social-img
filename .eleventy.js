const captureWebsite = require("capture-website");
const slugify = require("slugify");
const fs = require("fs");

module.exports = (eleventyConfig, pluginNamespace) => {
    eleventyConfig.namespace(pluginNamespace, () => {
        eleventyConfig.addShortcode("socialImg", function(data) {
            let isValid;
            let outputPath;
            let config;
            let output;
            
            function propExist(prop) {
                return typeof prop !== 'undefined' ? true : false;
            }

            function typeCheck(prop, type) {
                return propExist(prop) && typeof prop === type;
            }

            let isObject = typeCheck(data, 'object');
            let usingTheme = typeCheck(data.theme, 'number');
            let isHighRes = typeCheck(data.highRes, 'boolean');
            let hasInput = typeCheck(data.input, 'string');

            data.overwrite = propExist(data.overwrite) ? data.overwrite : false;

            if (usingTheme) {
                data["inputType"] = "html";
            }

            if (isHighRes && data.highRes) {
                data["width"] = 1200;
                data["height"] = 630;
            }

            if (!propExist(data.inputDir)) {
                throw new Error("Error: inputDir is a required shortcode argument.");
            }

            if (!data.fileName && data.title) {
                output = `${slugify(data.title).toLowerCase()}`;
            } else if (data.fileName && data.title) {
                output = `${data.fileName}`;
            } else if (data.fileName && !data.title) {
                output = `${data.fileName}`
            } else {
                throw new Error("Error: Must provide a fileName or title argument to shortcode");
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
                    css: `@import url(https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap);@import url(https://fonts.googleapis.com/css2?family=Candal&display=swap);*,::after,::before{box-sizing:border-box}:root{--page-bg:#fff;--bottom-border-bg:#fff;--title-font:'Noto Serif',sans-serif;--bulky-font:'Candal','Noto Serif',sans-serif;--date-font:'Archivo Black','Noto Serif',sans-serif}body{font-family:'Noto Serif',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:0}.wrapper{padding:1.5rem 0;overflow:hidden}.container{display:grid;grid-template-columns:repeat(6,minmax(7rem,1fr));margin:0 auto;padding:0 1rem}.container h1{grid-column:1/6;margin-bottom:.5rem;height:8rem;margin:.75rem 0 .75rem 0;line-height:1.4;font-size:2.3rem;text-align:left;max-width:25ch;font-family:var(--bulky-font);font-family:"Open Sans",sans-serif;color:#111;font-weight:600}.metadata,.row{margin-top:0;display:flex;align-items:center}.row{justify-content:space-between;grid-column:1/6;padding-bottom:.25rem}.metadata{position:relative;justify-content:space-between;width:100%;margin-top:4rem;z-index:999}.metadata>img{width:37px;height:38px;object-fit:cover;max-width:100%}.headshot{border-radius:50%}.metadata .logo{width:30px;height:30px}.metadata p{margin-left:1rem;margin-bottom:.5rem;color:#222;font-family:var(--date-font);font-family:"Noto Serif",sans-serif;font-weight:550}.bottom-bar{position:relative;width:680px;left:-10%;height:1.4rem;top:.1rem}.initials{border:.12rem solid #222;padding:.35rem;padding-bottom:.3rem}`
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

            const head = `<head><meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge"></head>`;

            function formatHtml(head, body) {
                let html = `<!DOCTYPE html>${head}<body>${body}</body></html>`;
                return html;
            }

            if (propExist(data.theme) && hasInput) {
                throw new Error("Do not include URL or HTML argument when using a theme");
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

                    if (propExist(data.title) && propExist(data.img) && propExist(data.initials)) {
                    } else {
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

            let regex = /\s+/gm;
            
            if (data.styles) {
                data.styles = data.styles.map(s => s.replace(regex, ""));
            }

            function generate(bool, config) {
                return bool ? (async () => {
                    let input = data.input;
                    if (!input) {
                        throw new Error("Undefined `input` source: A URL, file path, or HTML is required as input.");
                    }
                    return captureWebsite.file(input, `${output}.${config.type}`, config, (err) => {
                        if (err) throw err;
                    })
                })() : false;
            }

            // Netlify provides an environment variables `env.URL` at build time
            // this is the URL of the deployed site on Netlify - credit @5t3ph
            const siteUrl = process.env.URL || "http://localhost:8080";

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

                let extraConfig = [
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

                if (!fs.existsSync(`${data.inputDir}`)) {
                    throw new Error(`The '${data.inputDir}' directory doesn't exist!`)
                }

                if (!fs.existsSync(`${data.inputDir}/social-images/`) && !propExist(data.outputPath)) {
                    fs.mkdir(`${data.inputDir}/social-images/`, (err) => {
                        if (err) throw err;
                    });
                }

                if (!fs.existsSync(`${data.inputDir}${data.outputPath}`) && propExist(data.outputPath)) {
                    fs.mkdir(`${data.inputDir}${data.outputPath}`, (err) => {
                        if (err) throw err;
                    });
                }

                fs.access(outputPath, fs.F_OK, async (err) => {
                    if (err) {
                        await generate(isValid, config);

                        fs.rename(`${output}.${config.type}`, outputPath, (err) => {
                            if (err) throw err;
                        });
                    } else {
                        const doOverwrite = typeCheck(data.overwrite, 'boolean') || typeCheck(data.overwrite, 'string');
    
                        if (doOverwrite && data.overwrite) {
                            await generate(isValid, config);
                            fs.rename(`${output}.${config.type}`, outputPath, (err) => {
                                if (err) throw err;
                            })
                        } else {
                            throw new Error(`No image generated! ${outputPath} already exists and overwrite is false.`);
                        }
                    }
                });
            } else {
                isValid = false;
                if (!hasInput && !usingTheme) {
                    throw new Error("Missing input source. Provide a 'input' argument to shortcode. ");
                }
            }
            if (data.debugOutput) {
                console.log(config);
            }

            let outputDir = data.outputPath || `/social-images/`;
            return `${siteUrl}${outputDir}${output}.${config.type}`;
        });
    });
}