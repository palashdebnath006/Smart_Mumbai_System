const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

// Theme - Teal Trust
const primaryTeal = '028090';
const secondarySeafoam = '00A896';
const accentMint = '02C39A';
const darkNavy = '1E293B';
const lightGray = 'F8FAFC';

pres.defineSlideMaster({
  title: 'MASTER_TITLE',
  background: { color: primaryTeal },
  objects: [
    { rect: { x: 0, y: 4.8, w: '100%', h: 0.8, fill: { color: darkNavy } } },
    { rect: { x: 0, y: 4.75, w: '100%', h: 0.05, fill: { color: accentMint } } }
  ]
});

pres.defineSlideMaster({
  title: 'MASTER_CONTENT',
  background: { color: lightGray },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: darkNavy } } },
    { rect: { x: 0, y: 1.0, w: '100%', h: 0.05, fill: { color: accentMint } } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.25, w: 9, h: 0.5, color: 'FFFFFF', fontSize: 28, fontFace: 'Trebuchet MS', bold: true, margin:0 } } }
  ]
});

// SLIDE 1: Title
let slide1 = pres.addSlide({ masterName: "MASTER_TITLE" });
slide1.addText("India Smart City Dashboard", { x: 0.5, y: 2.0, w: 9, h: 1, color: "FFFFFF", fontSize: 48, bold: true, align: "center", fontFace: 'Trebuchet MS' });
slide1.addText("Prakalp 4.0: Urban Management Infrastructure", { x: 0.5, y: 3.0, w: 9, h: 1, color: accentMint, fontSize: 24, align: "center", fontFace: 'Calibri' });
slide1.addText("Presented by: Prakalp Team", { x: 0.5, y: 5.0, w: 9, h: 0.5, color: "CBD5E1", fontSize: 16, align: "center" });

try {
  slide1.addImage({ path: "public/logo.svg", x: 4.5, y: 0.5, w: 1, h: 1, sizing: { type: 'contain', w: 1, h: 1 } });
} catch (e) {}

// SLIDE 2: Vision & Problem Statement
let slide2 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide2.addText("The Vision & Problem Statement", { placeholder: "title" });
slide2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.5, w: 4.25, h: 3.5, fill: { color: "FFFFFF" }, shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.1 } });
slide2.addText("The Challenge", { x: 0.8, y: 1.8, w: 3.65, h: 0.5, bold: true, fontSize: 22, color: primaryTeal, fontFace: 'Trebuchet MS' });
slide2.addText([
  { text: "Modern Indian cities face rapid urbanization and fragmented data tracking.", options: { bullet: true, breakLine: true } },
  { text: "Departments for traffic, water, energy, and safety exist in silos.", options: { bullet: true } }
], { x: 0.8, y: 2.4, w: 3.65, h: 2, fontSize: 16, color: "334155" });

slide2.addShape(pres.shapes.RECTANGLE, { x: 5.25, y: 1.5, w: 4.25, h: 3.5, fill: { color: primaryTeal }, shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.1 } });
slide2.addText("The Solution", { x: 5.55, y: 1.8, w: 3.65, h: 0.5, bold: true, fontSize: 22, color: "FFFFFF", fontFace: 'Trebuchet MS' });
slide2.addText([
  { text: "A unified, centralized command center.", options: { bullet: true, breakLine: true } },
  { text: "Bringing together 8 core city verticals.", options: { bullet: true, breakLine: true } },
  { text: "Real-time insights empowering government officials intelligently.", options: { bullet: true } }
], { x: 5.55, y: 2.4, w: 3.65, h: 2, fontSize: 16, color: "E2E8F0" });

// SLIDE 3: Core Dashboard Modules
let slide3 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide3.addText("Core Dashboard Modules", { placeholder: "title" });

const boxFormat = { fill: { color: "FFFFFF" }, shadow: { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.1 } };
// 4 Grid blocks
slide3.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.5, w: 4.25, h: 1.5, ...boxFormat });
slide3.addText("Traffic & Safety\nFlow monitoring, CCTV mapping & security alerts.", { x: 0.5, y: 1.5, w: 4.25, h: 1.5, color: darkNavy, fontSize: 16, align: "center", bold: true });

slide3.addShape(pres.shapes.RECTANGLE, { x: 5.25, y: 1.5, w: 4.25, h: 1.5, ...boxFormat });
slide3.addText("Environment\nLive AQI mapping and PM2.5 monitoring.", { x: 5.25, y: 1.5, w: 4.25, h: 1.5, color: darkNavy, fontSize: 16, align: "center", bold: true });

slide3.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.5, w: 4.25, h: 1.5, ...boxFormat });
slide3.addText("Water & Energy\nLeak detection and smart grid analytics.", { x: 0.5, y: 3.5, w: 4.25, h: 1.5, color: darkNavy, fontSize: 16, align: "center", bold: true });

slide3.addShape(pres.shapes.RECTANGLE, { x: 5.25, y: 3.5, w: 4.25, h: 1.5, ...boxFormat });
slide3.addText("Waste & Parking\nSmart bin logistics & lot availability.", { x: 5.25, y: 3.5, w: 4.25, h: 1.5, color: darkNavy, fontSize: 16, align: "center", bold: true });

// SLIDE 4: Current Technical Architecture
let slide4 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide4.addText("Current Technical Architecture", { placeholder: "title" });
slide4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.3, w: 9, h: 3.8, fill: { color: "FFFFFF" }, shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.1 } });
slide4.addText([
  { text: "Frontend Framework:", options: { bold: true, breakLine: true, color: primaryTeal, fontSize: 18 } },
  { text: "Next.js 16 (App Router), Tailwind CSS 4, and shadcn/ui. Dark/light interfaces.", options: { bullet: true, breakLine: true, fontSize: 15 } },
  { text: "State Management:", options: { bold: true, breakLine: true, color: primaryTeal, fontSize: 18 } },
  { text: "Zustand for lightweight, fast local state caching and UI interactions.", options: { bullet: true, breakLine: true, fontSize: 15 } },
  { text: "Backend & Database:", options: { bold: true, breakLine: true, color: primaryTeal, fontSize: 18 } },
  { text: "Prisma ORM connected to SQLite for rapid iteration and type-safe schema definitions.", options: { bullet: true, breakLine: true, fontSize: 15 } },
  { text: "Security & Access:", options: { bold: true, breakLine: true, color: primaryTeal, fontSize: 18 } },
  { text: "BCrypt + Custom JWT authentication system with Role-Based Access.", options: { bullet: true, fontSize: 15 } }
], { x: 0.8, y: 1.5, w: 8.4, h: 3.4, color: "334155" });

// SLIDE 5: The AI Evolution
let slide5 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide5.addText("The AI Evolution (GenAI Integration)", { placeholder: "title" });
slide5.addText("Predictive & Conversational City Management", { x: 0.5, y: 1.4, w: 9, h: 0.6, fontSize: 24, color: primaryTeal, fontFace: 'Trebuchet MS', bold: true });
slide5.addText([
  { text: "Integrated Gemini 2.5 Flash chatbot allowing conversational queries.", options: { bullet: true, breakLine: true } },
  { text: "Impact: Streamlined UX. An officer just types \"Show CCTV status in Sector 4\".", options: { bullet: true } }
], { x: 0.5, y: 2.2, w: 9, h: 1.2, fontSize: 18, color: "334155" });

slide5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.6, w: 9, h: 1.4, fill: { color: secondarySeafoam } });
slide5.addText("Workflow Flow:\nUser Prompt ➔ Next.js Route ➔ Gemini AI Context ➔ Instant Dashboard Action", { x: 0.5, y: 3.6, w: 9, h: 1.4, color: "FFFFFF", fontSize: 20, bold: true, align: "center", margin: 0 });

// SLIDE 6: Enterprise Scalability & Upgrades
let slide6 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide6.addText("Proposed Enterprise Upgrades", { placeholder: "title" });
slide6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.5, w: 2.8, h: 3.2, fill: { color: "FFFFFF" } });
slide6.addText("1. Data Lake\n(Geospatial)", { x: 0.5, y: 1.6, w: 2.8, h: 0.8, color: primaryTeal, fontSize: 18, bold: true, align: "center" });
slide6.addText("Migrating from SQLite to PostgreSQL + PostGIS to handle robust spatial queries.", { x: 0.7, y: 2.6, w: 2.4, h: 1.8, color: "334155", fontSize: 14, align: "center" });

slide6.addShape(pres.shapes.RECTANGLE, { x: 3.6, y: 1.5, w: 2.8, h: 3.2, fill: { color: "FFFFFF" } });
slide6.addText("2. Real-time\nPipelines", { x: 3.6, y: 1.6, w: 2.8, h: 0.8, color: primaryTeal, fontSize: 18, bold: true, align: "center" });
slide6.addText("Moving from simulated polling to WebSockets/MQTT for instant sensor updates.", { x: 3.8, y: 2.6, w: 2.4, h: 1.8, color: "334155", fontSize: 14, align: "center" });

slide6.addShape(pres.shapes.RECTANGLE, { x: 6.7, y: 1.5, w: 2.8, h: 3.2, fill: { color: "FFFFFF" } });
slide6.addText("3. UI\nEnhancements", { x: 6.7, y: 1.6, w: 2.8, h: 0.8, color: primaryTeal, fontSize: 18, bold: true, align: "center" });
slide6.addText("Switching iframe maps to fully integrated Leaflet/Mapbox layers.", { x: 6.9, y: 2.6, w: 2.4, h: 1.8, color: "334155", fontSize: 14, align: "center" });

// SLIDE 7: Roadmap
let slide7 = pres.addSlide({ masterName: "MASTER_TITLE" });
slide7.addText("Deployment Roadmap & Conclusion", { x: 0.5, y: 1.5, w: 9, h: 1, color: "FFFFFF", fontSize: 36, bold: true, align: "center", fontFace: 'Trebuchet MS' });
slide7.addShape(pres.shapes.LINE, { x: 3, y: 2.5, w: 4, h: 0, line: { color: accentMint, width: 2 } });
slide7.addText([
  { text: "Q3 Strategy: Finalize PostGIS & Mapbox integrations.", options: { bullet: true, breakLine: true } },
  { text: "Q4 Strategy: Launch PWA for on-ground team mobility.", options: { bullet: true, breakLine: true } },
  { text: "Conclusion: Designing the backbone for a safer urban tomorrow.", options: { bullet: true } }
], { x: 1, y: 3.0, w: 8, h: 2, color: "E2E8F0", fontSize: 20 });

pres.writeFile({ fileName: "India_Smart_City_Dashboard.pptx" }).then(() => {
    console.log("Presentation created: India_Smart_City_Dashboard.pptx");
});
