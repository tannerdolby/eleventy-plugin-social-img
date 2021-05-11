# eleventy-plugin-social-img

An Eleventy plugin for generating social share images at build-time. It uses [capture-website](https://github.com/sindresorhus/capture-website) behind the scenes to capture a screenshot of the given input and save it to a given output file path. The URL for that generated image will be returned by the shortcode to be used in `<meta>` tags for Twitter and Open Graph. This plugin can be paired with [eleventy-plugin-metagen](https://github.com/tannerdolby/eleventy-plugin-metagen) for complete social share functionality.

The default viewport size for taking a screenshot is 600px by 315px. To use a custom width and height, utilize the `width` and `height` arguments. If you want a higher resolution display, set `highRes` equal to `true` for a 1200px by 630px image size (double the default dimensions).

## Installation

In your Eleventy project, [install the plugin]() from npm.

```
npm install eleventy-plugin-social-img
```

Then add it to your [Eleventy Config](https://www.11ty.dev/docs/config/) file:

```js
const socialImg = require('eleventy-plugin-social-img');

module.exports = (eleventyConfig) => {
    eleventyConfig.addPlugin(socialImg);
};
```

## What does it do?
The plugin turns [11ty shortcodes](https://www.11ty.dev/docs/shortcodes/) like this:

```nunjucks
{% set imgUrl %}
    {% socialImg
        theme=2,
        title="Some Interesting Blog Post Title Text",
        inputDir="./src",
        fileName="my-img",
        outputPath="/social-share/",
        themeColor="#7968c6",
        fontColor="#000215"
    %}
{% endset %}
```

into images like this:

![theme-two-demo](https://raw.githubusercontent.com/tannerdolby/eleventy-plugin-social-img/master/themes/theme-two-custom.png)

The shortcode returns a URL for the generated image which can be used in document metadata for `og:image` and `twitter:image` meta tags. I recommend storing the output of `socialImg` in a template variable like demonstrated with `{% set imgUrl %}`. 

```html
<!-- Twitter and Open Graph -->
<meta name="og:image" content="{{ imgUrl }}">
<meta name="twitter:image" content="{{ imgUrl }}">
```

The `inputDir` argument is required and if its value concatenated with `outputPath` doesn't already exist, the paths in `outputhPath` will be created. The image will be generated and placed at the end of `${inputDir}${outputPath}` with the extension in `type` (default 'png'). If the given filepath and image already exists, the shortcode will throw an error unless `overwrite` is set to `true`.

## Handling URLs

With the `process.env.URL` environment variable provided by Netlify, the image URL generated by the `socialImg` shortcode can be prefixed with the live sites URL. The return statement of your Eleventy config file will determine which directory of templates get transformed to HTML (e.g. [`input`](https://www.11ty.dev/docs/config/#input-directory)) and the directory to output the static files ([`output`](https://www.11ty.dev/docs/config/#output-directory)). The `input` directory in your Eleventy config file should be the same value you pass the `inputDir` in the `socialImg` shortcode.

Specify an `outputPath` that is relative to the `input` directory, for example if the `input` dir is `./src` then `outputPath` in `socialImg` should be:

```nunjucks
{% socialImg 
    input="<h1>Hello, 11ty!</h1>",
    inputType="html",
    fileName="my-file",
    inputDir="./src",
    outputPath="/social-share/",
    styles=["h1 { color: #f06; }"]
%}
```

Make sure to use `addPassthroughCopy()` to include the directory of social share images in your build output. This will ensure that the directory of generated images are included in the sites static output (ie `_site`) when built and deployed with Netlify. 

For the image URLs to be accessible for social card validators, don't forget to tell Eleventy to copy the directory of generated image files specified in `outputPath` into the site output with `addPassthroughCopy()`. This will make sure that URLs generated by the shortcode like `https://some-site.netlify.app/outputPath/fileName` work as expected since the static assets will be available at the expected URL.

```js
module.exports = (eleventyConfig) => {

    // Include the directory of generated images from `outputPath` in site output
    eleventyConfig.addPassthroughCopy("./src/social-share/");

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    }
}
```

If you have the above `dir` object as shown above, the following shortcode:

```nunjucks
{% set imgUrl %}
    {% socialImg
        input="<h1>Hello World!</h1>",
        inputType="html",
        fileName="my-file",
        inputDir="./src",
        outputPath="/social-share/some-dir/",
        styles=[
            "body { background: #333; }",
            "h1 { color: #fff }"
        ]
    %}
{% endset %}

<meta name="og:image" content="{{ imgUrl }}">
<meta name="twitter:image" content="{{ imgUrl }}">
```

will create the directories `/social-share/some-dir/` if they don't already exist, generate the image and return a URL:

```
https://site-name.netlify.app/social-share/some-dir/my-file.png
```

If you have a custom domain name through Netlify, then `process.env.URL` will replace "site-name.netlify.app" with your custom domain.

## Usage Options

Create an inline object by passing the name=value pair arguments to shortcode:

```nunjucks
{% socialImg 
    theme=1,
    title="Some Interesting Blog Post Title",
    img="https://tannerdolby.com/images/headshot3.png",
    initials="TD",
    fileName="my-image",
    inputDir="./src",
    outputPath="/images/",
    themeColor="#102647",
    fontColor="#edefbd"
%}
```

Define template variables in front matter and pass them to the shortcode:

```nunjucks
---
title: Some post about cool stuff
input: "<h1>Hello, world</h1>"
inputType: html
fileName: image-three
inputDir: ./src
outputPath: /share/
styles:
 - "body { background: #f06; }"
 - "h1 { color: #fff; }"
---

 {% socialImg
    input=input,
    inputType=inputType,
    fileName=fileName,
    inputDir=inputDir,
    outputPath=outputPath,
    styles=styles
%}
```

Pass a single object to the shortcode for a one liner:

```nunjucks
---
data:
  theme: 2
  title: Some Post Title
  fileName: my-image
  inputDir: ./src
  outputPath: /share/
---

{% socialImg data %}
```

To use your own custom templates and styles, have a look at [using custom templates](https://github.com/tannerdolby/eleventy-plugin-social-img#custom-html-templates). This provides room for creativity because you have a blank canvas and can provide it with any custom content or styles that you want. 

## Shortcode Options

| Argument | Type | Desc |
|----------|------|------|
| inputDir | `string` | The [input](https://www.11ty.dev/docs/config/#input-directory) directory in your `.eleventy.js` config file. (Default: ".")|
| input | `string` | The URL, file URL, data URL, local file path to the website, or HTML. (Default: 'url')| 
| inputType | `string` | Type of input location for capture-website. Can be a URL or HTML. (Default: 'url')|
| outputPath | `string` | The output file path for generated screenshots. Relative to the value provided in `inputDir`. (Default: inputDir + '/social-images/')|
| fileName | `string` | Name of the generated social share image. |
| styles | `string[]` | The styling for `html`. Accepts an array of inline code, absolute URLs, and local file paths (must have a .css extension). |
| title | `string` | The page title for images using a theme. |
| width | `number` | Page width. |
| height | `number`| Page height. |
| img | `string` | The URL, file URL, or local file path to a headshot image for theme 1. |
| initials | `string` | The site authors initials. |
| highRes | `boolean` | Sets page width and height to 1200px by 630px. |
| overwrite | `boolean` | If an image already exists, allow file to be overwritten. |
| theme | `number` | A number indicating which theme to use (1 or 2). |
| themeColor | `string` | The background color for theme. Any valid CSS `background` values. |
| fontColor | `string` | The font color for text in themes. |
| debugOutput | `boolean` | Logs the config object to console. |

If a `fileName` is not present and `title` is, then the generated image filename will be the value of `title` slugified. If the `outputPath` is not present but a `fileName` or `title` is, then the default output directory will be `./social-images/`. The `fileName` has higher precendence in the shortcode arguments so if you use both a `fileName` and `title` (which is common) then the `fileName` will be the generated image filename. Note: the order of shortcode arguments doesn't matter.

See [capture-website](https://github.com/sindresorhus/capture-website) for more details on available arguments. Many config options exist in `capture-website` and all of them are supported for usage with `socialImg`.

## Using Themes

Two social share image themes exist in this plugin. They use predefined HTML and styles, but the styles can be manipulated with optional arguments and/or the `styles` argument. When using a theme, make sure to include `theme` and assign it a value. Do not use the `url` or `html` arguments with a predefined theme, it will throw an error as the `input` source (eg HTML) is already supplied to `captureWebsite` for taking the screenshot.

You can view the [predefined themes]() to preview what generated social share images will look like. 

### Theme one
Specify a `theme`, `title`, `img`, `initials`, `fileName`, and `outputPath`.

```html
{% set imageUrl %}
    {% socialImg
        theme=1,
        inputDir="./src",
        title="Some Interesting Blog Post Title Text",
        img="https://tannerdolby.com/images/headshot3.png",
        initials="TD",
        fileName="my-image",
        outputPath="/social-share/"
    %}
{% endset %} 
```

### Theme two
Specify a `theme`, `title`, `fileName` and `outputPath` along with a `fileName` and `outputPath`.

```html
{% set imageUrl %}
    {% socialImg
        theme=2,
        inputDir="./src",
        title="Some Interesting Blog Post Title Text",
        fileName="theme-two",
        outputPath="/social-share/"
    %}
{% endset %} 
```

If you want to change the backgrund for a theme, provide a `themeColor` argument. You can also change the font color with `fontColor`. The `styles` argument is another way to style the predefined themes but [specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) usually will require extremely specific selectors or `!important` usage (This is because the predefined themes have their own HTML and CSS). 

Note: If you create a custom template of your own and pass that HTML into the `html` argument of `socialImg`, the styles you provide to `styles` will be the only styling (unless inline styles or internal CSS are present in the HTML) and therefore have the highest specificity.

## Custom HTML templates
Using your own custom templates are encouraged. Design the template however you like and simply pass in that HTML and CSS to the shortcode with `html` and `styles`. The plugin will do the work of creating directories and generating images. You can pass HTML straight into the shortcode using the `html` argument. Provide some CSS inline with HTML or to `styles` along with the other required arguments to begin generating images from your custom template. If your HTML doesn't rely upon any template variables then simply pass it directly to the shortcode in the `html` argument like this:

```nunjucks
{% socialImg
    html="<h1>Hello World!</h1>",
    styles=[
        "h1 { color: blue }"
    ],
    inputDir=".",
    outputPath="/images/",
    fileName="my-html"
%}
```

If you plan to use template variables in your HTML for the custom template, you can pull in HTML from a template however you'd like to pass it into the shortcode. I recommend using [`{% set %}`](https://mozilla.github.io/nunjucks/templating.html#set) (Nunjucks) to capture the contents of a block into a variable using block assignments like this:

```nunjucks
---
title: Some Post Title
date: 2021-05-07
inputDir: ./src
fileName: my-image
outputPath: /social-share/
styles:
  - "h1 { color: #f06; }"
---

{% set html %}
    <h1>{{ title }}</h1>
    <p>Posted on {{ date }}</p>
{% endset %}

{% set imgUrl %}
    {% socialImg 
        input=html,
        inputType="html",
        inputDir=inputDir,
        fileName=fileName,
        outputPath=outputPath,
        styles=styles
    %}
{% endset %}
```

Check out [randoma11y](https://randoma11y.com/) for some neat colors to help in designing a custom theme.

## Maintainer
[@tannerdolby](https://github.com/tannerdolby)

## Related
- [capture-website](https://github.com/sindresorhus/capture-website) - Capture screenshots of websites or HTML, using Puppeteer under the hood.
- [eleventy-plugin-social-share-card-generator](https://github.com/tpiros/eleventy-plugin-social-share-card-generator) - An eleventy plugin for generating social share card using Cloudinary.
- [eleventy-plugin-social-images](https://github.com/5t3ph/eleventy-plugin-social-images) - An eleventy plugin for dynamically generated social media images. (Inspiration from @5t3ph's plugin)