const image = (filename) => `/public/images/${filename}`;

const pendingDetails = {
  name: "",
  description: "We are adding the finishing details for this piece. Please check back soon.",
  variations: [],
};

export const categories = [
  "All Products",
  "Beaded Bracelets",
  "Phone Charms",
  "Personalised Accessories",
  "New Arrivals",
  "Accessory Sets",
];

export const products = [
  { id: "bracelet-01", image: image("bracelet-01.jpeg"), imageDescription: "A layered blush and clear beaded bracelet with delicate charms", category: "Beaded Bracelets", ...pendingDetails },
  { id: "bracelet-02", image: image("bracelet-02.jpeg"), imageDescription: "Ivory beaded bracelets with small dangling charms", category: "Beaded Bracelets", ...pendingDetails },
  { id: "bracelet-04", image: image("bracelet-04.jpeg"), imageDescription: "A soft peach beaded bracelet with a butterfly charm", category: "Beaded Bracelets", ...pendingDetails },
  { id: "bracelet-05", image: image("bracelet-05.jpeg"), imageDescription: "Aqua blue beaded bracelet with a gold-tone charm", category: "Beaded Bracelets", ...pendingDetails },
  { id: "bracelet-08", image: image("bracelet-08.jpeg"), imageDescription: "A peach beaded bracelet with a dark butterfly charm", category: "Beaded Bracelets", ...pendingDetails },
  { id: "bracelet-10", image: image("bracelet-10.jpeg"), imageDescription: "Black and ivory beaded bracelets with crown charms", category: "Beaded Bracelets", ...pendingDetails },
  { id: "bracelet-15", image: image("bracelet-15.jpeg"), imageDescription: "Blush and ivory beaded bracelets with small charms", category: "Beaded Bracelets", ...pendingDetails },
  {
    id: "phone-charms-collection",
    image: image("phone-charms-collection.jpg"),
    imageDescription: "Phone hanging straps with heart, daisy, rose, panda, swan, butterfly and dolphin charms",
    imageSource: "https://www.instagram.com/shopwith.liluri/p/DfowbU7ARAx/",
    category: "Phone Charms",
    ...pendingDetails,
    description: "A playful mix of phone hanging straps with sweet character, flower and heart charms. Message us to ask which designs are available.",
  },
  { id: "set-01", image: image("set-01.jpeg"), imageDescription: "A white butterfly necklace and bracelet shown together", category: "Accessory Sets", ...pendingDetails },
  { id: "set-02", image: image("set-02.jpeg"), imageDescription: "A pink butterfly necklace and matching bracelet", category: "Accessory Sets", ...pendingDetails },
  { id: "set-03", image: image("set-03.jpeg"), imageDescription: "A black butterfly necklace and coordinating accessories", category: "Accessory Sets", ...pendingDetails },
  { id: "set-04", image: image("set-04.jpeg"), imageDescription: "A curated collection of delicate necklaces and bracelets", category: "Accessory Sets", ...pendingDetails },
  { id: "set-05", image: image("set-05.jpeg"), imageDescription: "Blush and black butterfly jewellery pieces on a soft textured background", category: "Accessory Sets", ...pendingDetails },
];
