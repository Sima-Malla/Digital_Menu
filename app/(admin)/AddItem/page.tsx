"use client";
import { useState } from "react";
import {
  UtensilsCrossed,
  Coffee,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Star,
  Tag,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  ImageOff,
  Flame,
  Leaf,
  Wheat,
  Award,
  TrendingUp,
  Sparkles,
  Clock,
  Soup,
  Sandwich,
  Pizza,
  Beef,
  Salad,
  IceCream,
  Egg,
  Droplets,
  Wine,
  GlassWater,
  Citrus,
  ShoppingBag,
} from "lucide-react";

const foodCategories = [
  { label: "Starters", Icon: Salad },
  { label: "Soups & Salads", Icon: Soup },
  { label: "Main Course", Icon: UtensilsCrossed },
  { label: "Sandwiches & Wraps", Icon: Sandwich },
  { label: "Burgers", Icon: ShoppingBag },
  { label: "Pizza / Pasta", Icon: Pizza },
  { label: "Rice & Noodles", Icon: UtensilsCrossed },
  { label: "Grills & BBQ", Icon: Beef },
  { label: "Sides / Add-ons", Icon: ShoppingBag },
  { label: "Desserts & Sweets", Icon: IceCream },
  { label: "Breakfast / Brunch", Icon: Egg },
];

const drinkCategories = [
  { label: "Hot Beverages", Icon: Coffee },
  { label: "Cold Beverages", Icon: GlassWater },
  { label: "Smoothies & Shakes", Icon: Citrus },
  { label: "Fresh Juices", Icon: Citrus },
  { label: "Mocktails", Icon: Wine },
  { label: "Alcoholic Drinks", Icon: Wine },
  { label: "Water & Sparkling", Icon: Droplets },
];

const dietaryTags = [
  { label: "Vegan", Icon: Leaf },
  { label: "Vegetarian", Icon: Leaf },
  { label: "Gluten-Free", Icon: Wheat },
  { label: "Spicy", Icon: Flame },
  { label: "Chef's Special", Icon: Award },
  { label: "Bestseller", Icon: TrendingUp },
  { label: "New", Icon: Sparkles },
];

type FormData = {
  section: "food" | "drinks";
  category: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: string;
  dietary: string[];
  image: File | null;
  imagePreview: string;
  available: boolean;
};

const initial: FormData = {
  section: "food",
  category: foodCategories[0].label,
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  rating: "",
  dietary: [],
  image: null,
  imagePreview: "",
  available: true,
};

const steps = ["Item Details", "Pricing & Tags", "Review & Publish"];

export default function AddItem() {
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const categories = form.section === "food" ? foodCategories : drinkCategories;

  const handleSection = (section: "food" | "drinks") => {
    setForm((f) => ({
      ...f,
      section,
      category:
        section === "food" ? foodCategories[0].label : drinkCategories[0].label,
    }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((f) => ({
      ...f,
      image: file,
      imagePreview: file ? URL.createObjectURL(file) : "",
    }));
  };

  const toggleDietary = (tag: string) => {
    setForm((f) => ({
      ...f,
      dietary: f.dietary.includes(tag)
        ? f.dietary.filter((t) => t !== tag)
        : [...f.dietary, tag],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setForm(initial);
      setSubmitted(false);
      setActiveStep(1);
    }, 3000);
  };

  const discount =
    form.price &&
    form.originalPrice &&
    Number(form.originalPrice) > Number(form.price)
      ? Math.round(
          ((Number(form.originalPrice) - Number(form.price)) /
            Number(form.originalPrice)) *
            100,
        )
      : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
            }}
          >
            <UtensilsCrossed size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{
                color: "#111",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "-0.3px",
              }}
            >
              Menu Manager
            </div>
            <div style={{ color: "#9ca3af", fontSize: 11 }}>
              Restaurant Dashboard
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {steps.map((label, i) => {
            const step = i + 1;
            const done = activeStep > step;
            const active = activeStep === step;
            return (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        done || active
                          ? "linear-gradient(135deg, #f97316, #ea580c)"
                          : "#f3f4f6",
                      border: done || active ? "none" : "1.5px solid #e5e7eb",
                      color: done || active ? "#fff" : "#9ca3af",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                      boxShadow: active
                        ? "0 2px 8px rgba(249,115,22,0.3)"
                        : "none",
                    }}
                  >
                    {done ? <CheckCircle size={14} /> : step}
                  </div>
                  <span
                    style={{
                      color: active ? "#f97316" : done ? "#6b7280" : "#d1d5db",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    style={{
                      width: 24,
                      height: 1.5,
                      background: done ? "#f97316" : "#e5e7eb",
                      margin: "0 8px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 80px" }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              color: "#f97316",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Step {activeStep} of 3 — {steps[activeStep - 1]}
          </div>
          <h1
            style={{
              color: "#111827",
              fontSize: 26,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Add New Menu Item
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: "5px 0 0" }}>
            Complete all steps to publish to your live menu.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── STEP 1 ── */}
          {activeStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Card>
                <SectionLabel>Item Type</SectionLabel>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["food", "drinks"] as const).map((s) => {
                    const Icon = s === "food" ? UtensilsCrossed : Coffee;
                    const active = form.section === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSection(s)}
                        style={{
                          flex: 1,
                          padding: "13px 0",
                          borderRadius: 12,
                          border: active ? "none" : "1.5px solid #e5e7eb",
                          background: active
                            ? "linear-gradient(135deg, #f97316, #ea580c)"
                            : "#fafafa",
                          color: active ? "#fff" : "#6b7280",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow: active
                            ? "0 4px 12px rgba(249,115,22,0.25)"
                            : "none",
                        }}
                      >
                        <Icon size={16} />
                        {s === "food" ? "Food" : "Drinks"}
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <SectionLabel>Category</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {categories.map(({ label, Icon }) => {
                    const active = form.category === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, category: label }))
                        }
                        style={{
                          padding: "7px 13px",
                          borderRadius: 100,
                          border: active
                            ? "1.5px solid #f97316"
                            : "1.5px solid #e5e7eb",
                          background: active ? "#fff7ed" : "#fafafa",
                          color: active ? "#f97316" : "#6b7280",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <SectionLabel>Item Details</SectionLabel>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <FieldLabel>Item Name *</FieldLabel>
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Chicken Momo"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <FieldLabel>Description *</FieldLabel>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Describe the dish — ingredients, cooking style, flavors..."
                      style={{
                        ...inputStyle,
                        resize: "none" as const,
                        lineHeight: 1.7,
                      }}
                    />
                    <div
                      style={{
                        color: "#d1d5db",
                        fontSize: 11,
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {form.description.length} / 200
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionLabel>Item Photo</SectionLabel>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px dashed #e5e7eb",
                    borderRadius: 14,
                    padding: form.imagePreview ? "0" : "32px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: "#fafafa",
                    gap: 10,
                    overflow: "hidden",
                  }}
                >
                  {form.imagePreview ? (
                    <img
                      src={form.imagePreview}
                      alt="preview"
                      style={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Upload size={20} color="#f97316" />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            color: "#f97316",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Upload a photo
                        </div>
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: 12,
                            marginTop: 3,
                          }}
                        >
                          PNG or JPG — square images work best
                        </div>
                      </div>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    style={{ display: "none" }}
                  />
                </label>
                {form.imagePreview && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, image: null, imagePreview: "" }))
                    }
                    style={{
                      marginTop: 8,
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <X size={12} /> Remove photo
                  </button>
                )}
              </Card>

              <NextBtn onClick={() => setActiveStep(2)} />
            </div>
          )}

          {/* ── STEP 2 ── */}
          {activeStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Card>
                <SectionLabel>Pricing</SectionLabel>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <FieldLabel>Selling Price (Rs.) *</FieldLabel>
                    <input
                      required
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      placeholder="250"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <FieldLabel>Original / MRP (Rs.)</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      value={form.originalPrice}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          originalPrice: e.target.value,
                        }))
                      }
                      placeholder="300"
                      style={inputStyle}
                    />
                  </div>
                </div>
                {discount && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 10,
                      padding: "10px 14px",
                      color: "#16a34a",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Tag size={14} />
                    {discount}% discount will be shown on the menu
                  </div>
                )}
              </Card>

              <Card>
                <SectionLabel>Rating</SectionLabel>
                <FieldLabel>Initial Rating (0.0 – 5.0)</FieldLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.1}
                    value={form.rating || 0}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, rating: e.target.value }))
                    }
                    style={{ flex: 1, accentColor: "#f97316" }}
                  />
                  <div
                    style={{
                      minWidth: 64,
                      textAlign: "center",
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: 10,
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "#f97316",
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    <Star size={13} fill="#f97316" color="#f97316" />
                    {form.rating ? Number(form.rating).toFixed(1) : "—"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#d1d5db",
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  <span>0.0</span>
                  <span>2.5</span>
                  <span>5.0</span>
                </div>
              </Card>

              <Card>
                <SectionLabel>Dietary & Badges</SectionLabel>
                <p
                  style={{ color: "#9ca3af", fontSize: 12, margin: "0 0 12px" }}
                >
                  Select all that apply — shown as badges on your live menu.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {dietaryTags.map(({ label, Icon }) => {
                    const active = form.dietary.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleDietary(label)}
                        style={{
                          padding: "7px 13px",
                          borderRadius: 100,
                          border: active
                            ? "1.5px solid #f97316"
                            : "1.5px solid #e5e7eb",
                          background: active ? "#fff7ed" : "#fafafa",
                          color: active ? "#f97316" : "#6b7280",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Icon size={12} />
                        {label}
                        {active && <CheckCircle size={11} />}
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clock size={16} color="#f97316" />
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#111827",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        Available Now
                      </div>
                      <div
                        style={{ color: "#9ca3af", fontSize: 11, marginTop: 1 }}
                      >
                        Show this item on the live menu
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, available: !f.available }))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {form.available ? (
                      <ToggleRight size={40} color="#f97316" />
                    ) : (
                      <ToggleLeft size={40} color="#d1d5db" />
                    )}
                  </button>
                </div>
              </Card>

              <div style={{ display: "flex", gap: 10 }}>
                <BackBtn onClick={() => setActiveStep(1)} />
                <NextBtn onClick={() => setActiveStep(3)} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {activeStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Card>
                <SectionLabel>Preview Card</SectionLabel>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {form.imagePreview ? (
                    <img
                      src={form.imagePreview}
                      alt=""
                      style={{ width: "100%", height: 180, objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 120,
                        background: "#f9fafb",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <ImageOff size={26} color="#d1d5db" />
                      <span style={{ color: "#d1d5db", fontSize: 12 }}>
                        No photo uploaded
                      </span>
                    </div>
                  )}
                  <div style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#111827",
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          {form.name || "Item Name"}
                        </div>
                        <div
                          style={{
                            color: "#f97316",
                            fontSize: 11,
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {form.category} · {form.section}
                        </div>
                      </div>
                      {form.rating && (
                        <div
                          style={{
                            background: "#fff7ed",
                            border: "1px solid #fed7aa",
                            borderRadius: 8,
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#f97316",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <Star size={11} fill="#f97316" color="#f97316" />
                          {Number(form.rating).toFixed(1)}
                        </div>
                      )}
                    </div>
                    {form.description && (
                      <p
                        style={{
                          color: "#6b7280",
                          fontSize: 12,
                          margin: "0 0 10px",
                          lineHeight: 1.6,
                        }}
                      >
                        {form.description}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 5,
                        marginBottom: 12,
                      }}
                    >
                      {form.dietary.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            padding: "2px 8px",
                            color: "#6b7280",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            color: "#f97316",
                            fontWeight: 800,
                            fontSize: 20,
                          }}
                        >
                          Rs. {form.price || "—"}
                        </span>
                        {form.originalPrice &&
                          Number(form.originalPrice) > Number(form.price) && (
                            <span
                              style={{
                                color: "#d1d5db",
                                fontSize: 13,
                                textDecoration: "line-through",
                              }}
                            >
                              Rs. {form.originalPrice}
                            </span>
                          )}
                      </div>
                      {discount && (
                        <span
                          style={{
                            background: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                            borderRadius: 6,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionLabel>Summary</SectionLabel>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {[
                    ["Type", form.section === "food" ? "Food" : "Drinks"],
                    ["Category", form.category],
                    ["Name", form.name || "—"],
                    ["Price", form.price ? `Rs. ${form.price}` : "—"],
                    [
                      "Original Price",
                      form.originalPrice ? `Rs. ${form.originalPrice}` : "—",
                    ],
                    [
                      "Rating",
                      form.rating
                        ? `${Number(form.rating).toFixed(1)} / 5.0`
                        : "—",
                    ],
                    [
                      "Dietary Tags",
                      form.dietary.length ? form.dietary.join(", ") : "None",
                    ],
                    ["Available", form.available ? "Yes" : "No"],
                    ["Photo", form.imagePreview ? "Uploaded" : "None"],
                  ].map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #f3f4f6",
                        paddingBottom: 9,
                      }}
                    >
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>
                        {key}
                      </span>
                      <span
                        style={{
                          color: "#374151",
                          fontSize: 13,
                          fontWeight: 500,
                          textAlign: "right",
                          maxWidth: "60%",
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{ display: "flex", gap: 10 }}>
                <BackBtn onClick={() => setActiveStep(2)} />
                {submitted ? (
                  <div
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "14px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 12,
                      color: "#16a34a",
                      fontWeight: 700,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle size={18} /> Item published to menu!
                  </div>
                ) : (
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "linear-gradient(135deg, #f97316, #ea580c)",
                      border: "none",
                      borderRadius: 12,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Publish to Menu <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: "#f97316",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        color: "#6b7280",
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "#fff",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  color: "#111827",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

function NextBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "13px",
        background: "linear-gradient(135deg, #f97316, #ea580c)",
        border: "none",
        borderRadius: 12,
        color: "#fff",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      Continue <ChevronRight size={15} />
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "13px 18px",
        background: "#fff",
        border: "1.5px solid #e5e7eb",
        borderRadius: 12,
        color: "#6b7280",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <ChevronLeft size={15} /> Back
    </button>
  );
}
