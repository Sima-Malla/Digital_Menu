"use client";
import { useState } from "react";
import Cards from "@/Components/Cards/Cards";
import DrinkCard from "@/Components/DrinkCard/DrinkCard";
import { OrderProvider } from "@/Components/OrderContext/OrderContext";
import OrderSummary from "@/Components/OrderSummary/OrderSummary";

const foodCategories = [
  "Starters / Appetizers",
  "Soups & Salads",
  "Main Course",
  "Sandwiches & Wraps",
  "Burgers",
  "Pizza / Pasta",
  "Rice & Noodles",
  "Grills & BBQ",
  "Sides / Add-ons",
  "Desserts & Sweets",
  "Breakfast / Brunch",
];

const drinkCategories = [
  "Hot Beverages",
  "Cold Beverages",
  "Smoothies & Shakes",
  "Fresh Juices",
  "Mocktails",
  "Alcoholic Drinks",
  "Water & Sparkling",
];

type FoodItem = { name: string; description: string; image: string; price: number; originalPrice: number; rating?: string };
type DrinkItem = { name: string; description: string; image: string; price: number; originalPrice: number; rating?: string };

const foodData: Record<string, FoodItem[]> = {
  "Starters / Appetizers": [
    { name: "Veg Momo", description: "Steamed dumplings stuffed with spiced vegetables, served with tomato chutney.", image: "/Vegmomo.jpg", price: 180, originalPrice: 220 },
    { name: "Chicken Chowmein", description: "Stir-fried noodles with chicken and fresh vegetables in savory sauce.", image: "/chickenchaumien.jpg", price: 220, originalPrice: 260 },
    { name: "Veg Chowmein", description: "Classic stir-fried noodles tossed with colorful vegetables.", image: "/vegchaumein.jpg", price: 160, originalPrice: 200 },
  ],
  "Soups & Salads": [
    { name: "Kima Noodle Soup", description: "Rich minced meat soup with soft noodles and Nepali spices.", image: "/kimanoodles.jpg", price: 200, originalPrice: 240 },
    { name: "Veg Momo Soup", description: "Juicy veg momos served in a warm, flavorful broth.", image: "/Vegmomo.jpg", price: 190, originalPrice: 230 },
    { name: "Chicken Noodle Soup", description: "Comforting chicken broth with silky noodles and tender chicken.", image: "/chickenchaumien.jpg", price: 220, originalPrice: 260 },
  ],
  "Main Course": [
    { name: "Thakali Khana Set", description: "Authentic Thakali set with dal, bhat, tarkari, achar, and papad.", image: "/thakalikhana.jpg", price: 550, originalPrice: 750, rating: "4.9" },
    { name: "Chicken Chowmein", description: "Stir-fried noodles with chicken, veggies, and savory sauces.", image: "/chickenchaumien.jpg", price: 220, originalPrice: 260 },
    { name: "Kima Noodles", description: "Spiced minced meat noodles cooked Nepali style.", image: "/kimanoodles.jpg", price: 250, originalPrice: 300 },
  ],
  "Rice & Noodles": [
    { name: "Veg Chowmein", description: "Classic stir-fried noodles with fresh garden vegetables.", image: "/vegchaumein.jpg", price: 160, originalPrice: 200 },
    { name: "Chicken Chowmein", description: "Stir-fried noodles with juicy chicken pieces and spices.", image: "/chickenchaumien.jpg", price: 220, originalPrice: 260 },
    { name: "Kima Noodles", description: "Minced chicken noodles with Nepali seasoning.", image: "/kimanoodles.jpg", price: 250, originalPrice: 300 },
  ],
};

const drinkData: Record<string, DrinkItem[]> = {
  "Hot Beverages": [
    { name: "Hot Lemon Tea", description: "Freshly brewed tea with a squeeze of lemon and honey.", image: "/lemon.jpg", price: 80, originalPrice: 100 },
    { name: "Black Coffee", description: "Rich, strong black coffee brewed to perfection.", image: "/Cocktail.jpg", price: 120, originalPrice: 150 },
    { name: "Masala Chai", description: "Traditional spiced milk tea with cardamom, ginger and cinnamon.", image: "/lemon.jpg", price: 70, originalPrice: 90 },
    { name: "Hot Chocolate", description: "Creamy hot chocolate made with rich cocoa and steamed milk.", image: "/Cocktail.jpg", price: 150, originalPrice: 180 },
  ],
  "Cold Beverages": [
    { name: "Lemon Mint Cooler", description: "Fresh lemon, mint leaves, soda water with a hint of honey.", image: "/lemon.jpg", price: 120, originalPrice: 150 },
    { name: "Iced Coffee", description: "Chilled brewed coffee over ice with a splash of cream.", image: "/Cocktail.jpg", price: 160, originalPrice: 200 },
    { name: "Mango Lassi", description: "Thick and creamy mango yogurt drink, refreshing and sweet.", image: "/lemon.jpg", price: 140, originalPrice: 170 },
    { name: "Cold Brew", description: "Smooth, slow-steeped cold brew coffee served over ice.", image: "/Cocktail.jpg", price: 180, originalPrice: 220 },
  ],
  "Mocktails": [
    { name: "Virgin Mojito", description: "Lime, mint, sugar, soda — a classic refreshing mocktail.", image: "/lemon.jpg", price: 180, originalPrice: 220 },
    { name: "Sunrise Punch", description: "Orange juice layered with grenadine for a sunrise effect.", image: "/Cocktail.jpg", price: 200, originalPrice: 240 },
    { name: "Blue Lagoon", description: "Blue curacao syrup, lemon juice and soda for a vibrant drink.", image: "/lemon.jpg", price: 190, originalPrice: 230 },
    { name: "Watermelon Cooler", description: "Fresh watermelon juice blended with lime and mint.", image: "/Cocktail.jpg", price: 170, originalPrice: 210 },
  ],
  "Alcoholic Drinks": [
    { name: "Classic Cocktail", description: "House special cocktail with premium spirits and fresh mixers.", image: "/Cocktail.jpg", price: 450, originalPrice: 550 },
    { name: "Mojito", description: "Rum, lime, mint, sugar and soda — a timeless classic.", image: "/lemon.jpg", price: 400, originalPrice: 500 },
    { name: "Margarita", description: "Tequila, lime juice and triple sec served with a salted rim.", image: "/Cocktail.jpg", price: 420, originalPrice: 520 },
    { name: "Beer Pint", description: "Chilled draught beer served fresh from the tap.", image: "/Cocktail.jpg", price: 350, originalPrice: 400 },
  ],
};

const defaultFoodItems: FoodItem[] = [
  { name: "Veg Momo", description: "Steamed dumplings with spiced vegetables and tomato chutney.", image: "/Vegmomo.jpg", price: 180, originalPrice: 220 },
  { name: "Thakali Khana Set", description: "Authentic Thakali set with dal, bhat, tarkari, achar and papad.", image: "/thakalikhana.jpg", price: 550, originalPrice: 750 },
  { name: "Kima Noodles", description: "Spiced minced meat noodles cooked Nepali style.", image: "/kimanoodles.jpg", price: 250, originalPrice: 300 },
];

const defaultDrinkItems: DrinkItem[] = [
  { name: "Lemon Mint Cooler", description: "Fresh lemon, mint leaves, soda water with a hint of honey.", image: "/lemon.jpg", price: 120, originalPrice: 150 },
  { name: "Classic Cocktail", description: "House special cocktail with premium spirits and fresh mixers.", image: "/Cocktail.jpg", price: 450, originalPrice: 550 },
  { name: "Virgin Mojito", description: "Lime, mint, sugar, soda — a classic refreshing mocktail.", image: "/lemon.jpg", price: 180, originalPrice: 220 },
  { name: "Hot Lemon Tea", description: "Freshly brewed tea with a squeeze of lemon and honey.", image: "/lemon.jpg", price: 80, originalPrice: 100 },
];

export default function Menu() {
  const [activeSection, setActiveSection] = useState<"food" | "drinks">("food");
  const [activeCategory, setActiveCategory] = useState("Starters / Appetizers");

  const categories = activeSection === "food" ? foodCategories : drinkCategories;
  const foodItems = foodData[activeCategory] ?? defaultFoodItems;
  const drinkItems = drinkData[activeCategory] ?? defaultDrinkItems;

  return (
    <OrderProvider>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          {/* Left — Menu */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our Menu 🍽️</h1>

            {/* Section Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setActiveSection("food"); setActiveCategory(foodCategories[0]); }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeSection === "food" ? "bg-orange-500 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"}`}
              >
                🍛 Food
              </button>
              <button
                onClick={() => { setActiveSection("drinks"); setActiveCategory(drinkCategories[0]); }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeSection === "drinks" ? "bg-orange-500 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"}`}
              >
                🥤 Drinks
              </button>
            </div>

            {/* Category Navbar */}
            <div className="flex gap-2 flex-wrap mb-6 border-b border-gray-200 pb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition border ${activeCategory === cat ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">{activeCategory}</h2>

            {/* Cards */}
            {activeSection === "food" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {foodItems.map((item) => (
                  <Cards key={item.name} {...item} category={activeCategory} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {drinkItems.map((item) => (
                  <DrinkCard key={item.name} {...item} category={activeCategory} />
                ))}
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <OrderSummary />
          </div>
        </div>
      </div>
    </OrderProvider>
  );
}
