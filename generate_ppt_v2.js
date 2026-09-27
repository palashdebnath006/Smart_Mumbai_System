const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10" x 5.625"

// Theme - Cyber Teal
const primaryTeal = '028090';
const secondarySeafoam = '00A896';
const accentMint = '02C39A';
const darkNavy = '1E293B';
const almostBlack = '0F172A';
const lightGray = 'F8FAFC';

// Standard shadow
const dropShadow = { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.15 };

pres.defineSlideMaster({
  title: 'MASTER_CONTENT',
  background: { color: lightGray },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: almostBlack } } },
    { rect: { x: 0, y: 0.8, w: '100%', h: 0.05, fill: { color: accentMint } } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.15, w: 9, h: 0.5, color: 'FFFFFF', fontSize: 26, fontFace: 'Trebuchet MS', bold: true, margin:0 } } }
  ]
});

// SLIDE 1: TITLE SLIDE
let slide1 = pres.addSlide();
slide1.background = { color: almostBlack };
// Full background image from Gemini AI
try { slide1.addImage({ path: "C:/Users/VINIT/.gemini/antigravity/brain/e5752129-664a-428e-b221-0af45ce62023/future_smart_city_1775843016524.png", x: 0, y: 0, w: "100%", h: "100%", sizing: { type: 'cover' } }); } catch(e){}
// Dark overlay
slide1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "000000" }, transparency: 30 });
// Text
slide1.addText("India Smart City Dashboard", { x: 0.5, y: 1.8, w: 9, h: 1, color: "FFFFFF", fontSize: 48, bold: true, align: "center", fontFace: 'Trebuchet MS', shadow: dropShadow });
slide1.addText("Prakalp 4.0: Centralized Urban Infrastructure", { x: 0.5, y: 2.8, w: 9, h: 0.8, color: accentMint, fontSize: 24, align: "center", fontFace: 'Calibri', shadow: dropShadow });
slide1.addShape(pres.shapes.LINE, { x: 3.5, y: 3.6, w: 3, h: 0, line: { color: accentMint, width: 3 } });
slide1.addText("Transforming Fragmented Systems into Active Intelligence", { x: 0.5, y: 4.5, w: 9, h: 0.5, color: "E2E8F0", fontSize: 18, align: "center" });

// SLIDE 2: PROBLEM STATEMENT (WhatsApp Image 1)
let slide2 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide2.addText("The Urban Crisis: Data Fragmentation", { placeholder: "title" });
slide2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 5, h: 4, fill: { color: "FFFFFF" }, shadow: dropShadow });
slide2.addText([
  { text: "Massive Data Silos", options: { bold: true, fontSize: 18, color: primaryTeal, breakLine: true } },
  { text: "Traffic, Water, and Safety run on entirely separate legacy systems.", options: { bullet: true, breakLine: true } },
  { text: "Catastrophic Response Latency", options: { bold: true, fontSize: 18, color: primaryTeal, breakLine: true } },
  { text: "Lack of immediate cross-department alarms stalls emergency units.", options: { bullet: true, breakLine: true } },
  { text: "Severe Resource Wastage", options: { bold: true, fontSize: 18, color: primaryTeal, breakLine: true } },
  { text: "Undetected reservoir leaks result in millions of liters lost daily.", options: { bullet: true } }
], { x: 0.8, y: 1.4, w: 4.4, h: 3.6, fontSize: 15, color: "334155" });

try {
  slide2.addImage({ path: "WhatsApp Image 2026-04-08 at 16.01.52.jpeg", x: 5.8, y: 1.2, w: 3.7, h: 4, sizing: { type: 'cover' }, rounding: true });
} catch(e) {}

// SLIDE 3: OUR SOLUTION (WhatsApp Image 2)
let slide3 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide3.addText("Our Solution: The Command Center", { placeholder: "title" });
// Image on left, text on right
try {
  slide3.addImage({ path: "WhatsApp Image 2026-04-08 at 16.01.53.jpeg", x: 0.5, y: 1.2, w: 4.2, h: 4.0, sizing: { type: 'cover' }, rounding: true });
} catch(e) {}

slide3.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: 1.2, w: 4.5, h: 4.0, fill: { color: "FFFFFF" }, shadow: dropShadow });
slide3.addText([
  { text: "Single Pane of Glass", options: { bold: true, fontSize: 18, color: primaryTeal, breakLine: true } },
  { text: "Overlaying 8 city verticals into one fluid mapping reality.", options: { bullet: true, breakLine: true } },
  { text: "Actionable Real-Time Execution", options: { bold: true, fontSize: 18, color: primaryTeal, breakLine: true } },
  { text: "From static end-of-day reports to 3-second live IoT sensor streams.", options: { bullet: true, breakLine: true } },
  { text: "Interoperability Protocol", options: { bold: true, fontSize: 18, color: primaryTeal, breakLine: true } },
  { text: "API layers convert fragmented legacy databases into modern structures.", options: { bullet: true } },
], { x: 5.2, y: 1.4, w: 4.1, h: 3.6, fontSize: 15, color: "334155" });

// SLIDE 4: CORE MODULES & AI (WhatsApp Image 3)
let slide4 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide4.addText("Core Modules & Conversational AI", { placeholder: "title" });

try {
  slide4.addImage({ path: "WhatsApp Image 2026-04-08 at 16.01.55.jpeg", x: 5.8, y: 1.2, w: 3.7, h: 4, sizing: { type: 'cover' }, rounding: true });
} catch(e) {}

slide4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 5.0, h: 2.3, fill: { color: almostBlack }, shadow: dropShadow });
slide4.addText([
  { text: "Traffic:", options: { bold: true, color: accentMint } }, { text: " Live congestion and velocity logs.\n" },
  { text: "Environment:", options: { bold: true, color: accentMint } }, { text: " Localized AQI tracking.\n" },
  { text: "Utilities:", options: { bold: true, color: accentMint } }, { text: " Predictive reservoir leak detection.\n" },
  { text: "Safety:", options: { bold: true, color: accentMint } }, { text: " Live CCTV parsing." }
], { x: 0.7, y: 1.4, w: 4.6, h: 1.9, fontSize: 15, color: "FFFFFF" });

slide4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.7, w: 5.0, h: 1.5, fill: { color: secondarySeafoam }, shadow: dropShadow });
slide4.addText("Gemini 2.5 Flash Chatbot Integration", { x: 0.7, y: 3.8, w: 4.6, h: 0.5, fontSize: 18, bold: true, color: "FFFFFF", fontFace: 'Trebuchet MS' });
slide4.addText("Administrators seamlessly prompt: 'List all offline CCTVs in Zone 4' and instantly trigger maintenance dispatches bypassing manual UI hunting.", { x: 0.7, y: 4.2, w: 4.6, h: 0.8, fontSize: 14, color: "F8FAFC" });

// SLIDE 5: ARCHITECTURE FLOWCHART
let slide5 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide5.addText("System Architecture: Data & Intelligence Flow", { placeholder: "title" });

try { slide5.addImage({ path: "C:/Users/VINIT/.gemini/antigravity/brain/e5752129-664a-428e-b221-0af45ce62023/ai_command_center_1775843033056.png", x: 0, y: 0.8, w: "100%", h: "100%", sizing: { type: 'cover' }, transparency: 75 }); } catch(e){}

let blockFmt = { fill: { color: primaryTeal }, shadow: dropShadow, rectRadius: 0.2 };
let textFmt = { bold: true, color: "FFFFFF", fontSize: 14, align: "center", margin: 0.1 };
let arrowFmt = { fill: { color: almostBlack }, line: { color: accentMint, width: 2 } };

slide5.addText("Hardware Edge", { x: 1, y: 1.3, w: 2, h: 0.4, fontSize: 16, bold: true, color: almostBlack });
slide5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1, y: 1.8, w: 2, h: 0.8, ...blockFmt });
slide5.addText("Live IoT Sensors\nCCTV & Feeds", { x: 1, y: 1.8, w: 2, h: 0.8, ...textFmt });

slide5.addShape(pres.shapes.RIGHT_ARROW, { x: 3.1, y: 2.0, w: 0.8, h: 0.4, ...arrowFmt });

slide5.addText("Server Routing", { x: 4, y: 1.3, w: 2, h: 0.4, fontSize: 16, bold: true, color: almostBlack });
slide5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4, y: 1.8, w: 2, h: 0.8, fill: { color: almostBlack }, shadow: dropShadow, rectRadius: 0.2 });
slide5.addText("Next.js App Router\nAPI / WebSockets", { x: 4, y: 1.8, w: 2, h: 0.8, ...textFmt });

slide5.addShape(pres.shapes.RIGHT_ARROW, { x: 6.1, y: 2.0, w: 0.8, h: 0.4, ...arrowFmt });

slide5.addText("Data Core", { x: 7, y: 1.3, w: 2, h: 0.4, fontSize: 16, bold: true, color: almostBlack });
slide5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7, y: 1.8, w: 2, h: 0.8, ...blockFmt });
slide5.addText("Prisma ORM\nSQLite / PostGIS", { x: 7, y: 1.8, w: 2, h: 0.8, ...textFmt });

// Return Arrow for AI
slide5.addShape(pres.shapes.LEFT_ARROW, { x: 4.6, y: 2.8, w: 0.8, h: 0.6, ...arrowFmt });

slide5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4, y: 3.6, w: 2, h: 1.2, fill: { color: secondarySeafoam }, shadow: dropShadow, rectRadius: 0.2 });
slide5.addText("Gemini 2.5 Flash\nNL Intelligence", { x: 4, y: 3.6, w: 2, h: 1.2, ...textFmt });

slide5.addShape(pres.shapes.DOWN_ARROW, { x: 7.8, y: 2.8, w: 0.4, h: 0.6, ...arrowFmt });
slide5.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.5, y: 3.6, w: 3, h: 1.2, fill: { color: almostBlack }, shadow: dropShadow, rectRadius: 0.2 });
slide5.addText("Smart City UI Deck\nZustand Cache\nshadcn/ui Render", { x: 6.5, y: 3.6, w: 3, h: 1.2, ...textFmt });

// connect gemini to UI
slide5.addShape(pres.shapes.RIGHT_ARROW, { x: 6.2, y: 4.0, w: 0.2, h: 0.4, ...arrowFmt });

// SLIDE 6: IMPLEMENTATION & IMPACT (WhatsApp Image 4)
let slide6 = pres.addSlide({ masterName: "MASTER_CONTENT" });
slide6.addText("Implementation Plan & Real Impact", { placeholder: "title" });
slide6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 5, h: 4, fill: { color: "FFFFFF" }, shadow: dropShadow });
slide6.addText("Rollout Phases", { x: 0.8, y: 1.4, w: 4.4, h: 0.4, bold: true, fontSize: 18, color: primaryTeal, fontFace: 'Trebuchet MS' });
slide6.addText([
  { text: "Phase 1: Deploy core UI & connect test AQI sensors.", options: { bullet: true, breakLine: true } },
  { text: "Phase 2: Database transition to PostgreSQL+PostGIS.", options: { bullet: true, breakLine: true } },
  { text: "Phase 3: Rollout Admin/Officer portals securely.", options: { bullet: true, breakLine: true } }
], { x: 0.8, y: 1.8, w: 4.4, h: 1.2, fontSize: 14, color: "334155" });

slide6.addShape(pres.shapes.LINE, { x: 0.8, y: 3.3, w: 4.4, h: 0, line: { color: "E2E8F0", width: 1 } });
slide6.addText("Tangible ROI", { x: 0.8, y: 3.4, w: 4.4, h: 0.4, bold: true, fontSize: 18, color: primaryTeal, fontFace: 'Trebuchet MS' });
slide6.addText("40% Emergency Response Reduction\n25% Energy & Utility Conservation", { x: 0.8, y: 3.8, w: 4.4, h: 1, fontSize: 16, bold: true, color: secondarySeafoam });

try {
  slide6.addImage({ path: "WhatsApp Image 2026-04-08 at 23.06.11.jpeg", x: 5.8, y: 1.2, w: 3.7, h: 4, sizing: { type: 'cover' }, rounding: true });
} catch(e) {}

// SLIDE 7: FUTURE SCOPE
let slide7 = pres.addSlide();
slide7.background = { color: primaryTeal };
let fbox = { fill: { color: "FFFFFF" }, shadow: dropShadow, rectRadius: 0.1 };

slide7.addText("The Future Scope & Urban Vision", { x: 0.5, y: 0.8, w: 9, h: 1, color: "FFFFFF", fontSize: 36, bold: true, align: "center", fontFace: 'Trebuchet MS' });

// 3 floating pillars
slide7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 2.2, w: 2.6, h: 2.8, ...fbox });
slide7.addText("Predictive Routing\nAI algorithms to adjust traffic grid lights preemptively based on weather variables.", { x: 0.8, y: 2.5, w: 2.6, h: 2.2, fontSize: 15, align: "center", color: almostBlack });

slide7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.7, y: 2.2, w: 2.6, h: 2.8, ...fbox });
slide7.addText("Drone Dispatch\nAutonomous IoT-triggered drone mapping before fire engines arrive.", { x: 3.7, y: 2.5, w: 2.6, h: 2.2, fontSize: 15, align: "center", color: almostBlack });

slide7.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.6, y: 2.2, w: 2.6, h: 2.8, ...fbox });
slide7.addText("Nation-Wide Scale\nOpen-source deployment model allowing seamless cloning for every Indian state.", { x: 6.6, y: 2.5, w: 2.6, h: 2.2, fontSize: 15, align: "center", color: almostBlack });

// Save
pres.writeFile({ fileName: "India_Smart_City_Dashboard_V2.pptx" }).then(() => {
    console.log("Presentation created: India_Smart_City_Dashboard_V2.pptx");
});
