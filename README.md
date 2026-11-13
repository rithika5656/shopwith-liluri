# shopwith.LiLuRi

A lightweight, responsive storefront using plain HTML, CSS and JavaScript. No build step or payment service is included.

## Run locally

From this folder, run `py -m http.server 8000` and open `http://localhost:8000`.

## Update the catalogue

Edit `src/products.js` to manage product images, descriptions, categories and optional variations. Add a real product name before enabling orders; listings with a blank name cannot be sent to WhatsApp. Images belong in `public/images/`. The storefront and WhatsApp order message intentionally do not show price details.

Set a real international WhatsApp business number with country code (digits only) in `src/config.js` to enable WhatsApp ordering. Until configured, the site will not send an unconfigured order.

The shop category filters and the coming-soon section can be updated in `src/products.js`, `src/main.js` and `index.html` as collections grow.

The homepage collection edits use LiLuRi product photos and charm themes; Pinterest is used only for palette, grouping and presentation inspiration. Butterfly accessory-set collections link to the existing Accessory Sets category. The personalised name-bead illustration is a coming-soon concept, not a product photo.

The Phone Charms category displays official Pinterest Pin embeds as a clearly labelled inspiration moodboard. The Pins link back to their original creators and are not LiLuRi product listings.
