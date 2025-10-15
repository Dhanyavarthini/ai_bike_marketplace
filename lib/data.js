export const featuredBikes = [
  {
    id: 1,
    make: "Royal Enfield",
    model: "Classic 350",
    year: 2022,
    price: 185000,
    images: ["/1.avif"],
    transmission: "Manual",
    fuelType: "Petrol",
    category: "Cruiser",
    mileage: 9500,
    color: "Chrome Black",
    wishlisted: false,
  },
  {
    id: 2,
    make: "TVS",
    model: "Apache RTR 160 4V",
    year: 2023,
    price: 118000,
    images: ["/2.avif"],
    transmission: "Manual",
    fuelType: "Petrol",
    category: "Street",
    mileage: 4500,
    color: "Racing Red",
    wishlisted: true,
  },
  {
    id: 3,
    make: "Bajaj",
    model: "Pulsar NS200",
    year: 2021,
    price: 105000,
    images: ["/3.avif"],
    transmission: "Manual",
    fuelType: "Petrol",
    category: "Sport",
    mileage: 7200,
    color: "Graphite Grey",
    wishlisted: false,
  },
];


export const bikeMakes = [
  { id: 1, name: "Royal Enfield", image: "/make/royalenfield.png" },
  { id: 2, name: "TVS", image: "/make/tvs.png" },
  { id: 3, name: "Bajaj", image: "/make/bajaj.png" },
  { id: 4, name: "Honda", image: "/make/honda.png" },
  { id: 5, name: "Hero", image: "/make/hero.png" },
  { id: 6, name: "KTM", image: "/make/ktm.png" },
];

export const bikeCategories = [
  { id: 1, name: "Cruiser", image: "/category/cruiser.avif" },
  { id: 2, name: "Street", image: "/category/street.avif" },
  { id: 3, name: "Sport", image: "/category/sport.avif" },
  { id: 4, name: "Adventure", image: "/category/adventure.avif" },
];


export const faqItems = [
  {
    question: "How do I book a test ride?",
    answer:
      "Find the bike you're interested in, click 'Test Ride', and select your preferred time slot. We'll confirm your booking and send all the details to your email.",
  },
  {
    question: "Can I upload a bike photo to find matches?",
    answer:
      "Yes! Use our AI-powered image search to upload a photo, and we'll show you similar bikes available on BikeBay.",
  },
  {
    question: "Are bikes verified before listing?",
    answer:
      "All bikes listed on BikeBay go through a verification process to ensure trust and authenticity.",
  },
  {
    question: "What happens after I book a ride?",
    answer:
      "You'll get a confirmation email with full details, and our team will also contact you to assist further.",
  },
];
