import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import AuthScreen from "./AuthScreen.jsx";

// ═══════════════════════════════════════════════════════════
// MOCK DATA & CONSTANTS
// ═══════════════════════════════════════════════════════════

const FOOD_DB = {
  "ramen": { calories: 430, protein: 18, carbs: 62, fat: 12 },
  "egg": { calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "rice": { calories: 206, protein: 4.3, carbs: 45, fat: 0.4 },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  "protein shake": { calories: 150, protein: 30, carbs: 5, fat: 2 },
  "salad": { calories: 120, protein: 3, carbs: 15, fat: 6 },
  "steak": { calories: 271, protein: 26, carbs: 0, fat: 18 },
  "oatmeal": { calories: 166, protein: 6, carbs: 28, fat: 4 },
  "almonds": { calories: 164, protein: 6, carbs: 6, fat: 14 },
  "yogurt": { calories: 100, protein: 17, carbs: 6, fat: 0.7 },
  "tuna": { calories: 132, protein: 28, carbs: 0, fat: 1.4 },
  "sweet potato": { calories: 103, protein: 2.3, carbs: 24, fat: 0.1 },
  "broccoli": { calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  "pasta": { calories: 220, protein: 8, carbs: 43, fat: 1.3 },
};

const WORKOUT_DB = {
  "run": { caloriesPerMinute: 11, type: "cardio" },
  "running": { caloriesPerMinute: 11, type: "cardio" },
  "walk": { caloriesPerMinute: 5, type: "cardio" },
  "cycling": { caloriesPerMinute: 9, type: "cardio" },
  "pushups": { caloriesPerMinute: 7, type: "strength" },
  "pullups": { caloriesPerMinute: 8, type: "strength" },
  "squat": { caloriesPerMinute: 8, type: "strength" },
  "deadlift": { caloriesPerMinute: 9, type: "strength" },
  "hiit": { caloriesPerMinute: 14, type: "hiit" },
  "yoga": { caloriesPerMinute: 4, type: "flexibility" },
  "swim": { caloriesPerMinute: 10, type: "cardio" },
  "boxing": { caloriesPerMinute: 13, type: "combat" },
};

const RECIPES = [
  {
    id: 1,
    name: "High-Protein Strike Meal",
    emoji: "⚡",
    macros: { protein: 52, carbs: 28, fat: 12, calories: 432 },
    ingredients: ["200g chicken breast", "1 cup brown rice", "1 cup broccoli", "2 tbsp olive oil", "Spices"],
    instructions: ["Season chicken with spices", "Grill 15min each side", "Steam broccoli 8min", "Serve over rice"],
    tag: "HIGH PROTEIN"
  },
  {
    id: 2,
    name: "Keto Power Surge",
    emoji: "🔥",
    macros: { protein: 38, carbs: 4, fat: 42, calories: 546 },
    ingredients: ["200g ribeye steak", "3 eggs", "2 cups spinach", "1 avocado", "Butter"],
    instructions: ["Sear steak 4min each side", "Scramble eggs in butter", "Plate with raw spinach", "Top with avocado slices"],
    tag: "KETO"
  },
  {
    id: 3,
    name: "Vegan Combat Fuel",
    emoji: "🌿",
    macros: { protein: 28, carbs: 58, fat: 14, calories: 474 },
    ingredients: ["1 cup lentils", "Sweet potato", "Quinoa", "Tahini", "Lemon"],
    instructions: ["Cook lentils 25min", "Roast sweet potato", "Cook quinoa", "Mix tahini dressing"],
    tag: "VEGAN"
  }
];

const MOCK_EVENTS = [
  {
    id: "evt1",
    name: "Operation: Lean Warrior",
    description: "30-day cutting protocol for elite operatives",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    participants: [
      { id: "u1", name: "Kira Tanaka",   startWeight: 88.0, endWeight: 83.5, targetWeight: 80.0 },
      { id: "u2", name: "Deven Rao",     startWeight: 95.2, endWeight: 91.0, targetWeight: 88.0 },
      { id: "u3", name: "Mia Solis",     startWeight: 70.4, endWeight: 68.0, targetWeight: 65.0 },
      { id: "u4", name: "Jamal Carter",  startWeight: 102.0, endWeight: null, targetWeight: 95.0 },
      { id: "u5", name: "Yuki Haruto",   startWeight: 78.5, endWeight: null, targetWeight: 73.0 },
    ]
  },
  {
    id: "evt2",
    name: "Bulk Protocol Alpha",
    description: "Mass accumulation phase — maximum output required",
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    participants: [
      { id: "u6", name: "Riku Mazur",    startWeight: 68.0, endWeight: null, targetWeight: 75.0 },
      { id: "u7", name: "Lena Voss",     startWeight: 57.5, endWeight: null, targetWeight: 63.0 },
      { id: "u8", name: "Omar Khalid",   startWeight: 74.0, endWeight: null, targetWeight: 82.0 },
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

function parseNaturalInput(text) {
  const lower = text.toLowerCase();
  const results = [];

  // Check for workout
  const workoutKeywords = Object.keys(WORKOUT_DB);
  const isWorkout = workoutKeywords.some(k => lower.includes(k));

  if (isWorkout) {
    let duration = 30;
    let distance = null;
    const timeMatch = lower.match(/(\d+)\s*(min|minute|hour)/);
    const distMatch = lower.match(/(\d+\.?\d*)\s*(km|mile|k)/);
    if (timeMatch) duration = parseInt(timeMatch[1]) * (timeMatch[2] === "hour" ? 60 : 1);
    if (distMatch) { distance = parseFloat(distMatch[1]); duration = Math.round(distance * 6); }

    const workout = workoutKeywords.find(k => lower.includes(k));
    const db = WORKOUT_DB[workout];
    const calories = Math.round(db.caloriesPerMinute * duration);

    results.push({
      id: Date.now(),
      type: "workout",
      name: workout.charAt(0).toUpperCase() + workout.slice(1),
      calories,
      duration,
      distance,
      workoutType: db.type,
      timestamp: new Date()
    });
  } else {
    // Parse food
    const foodKeys = Object.keys(FOOD_DB);
    const multiplierMatch = lower.match(/(\d+)\s*(x|pieces?|eggs?|cups?|servings?)?/);
    const multiplier = multiplierMatch ? parseInt(multiplierMatch[1]) : 1;

    foodKeys.forEach(food => {
      if (lower.includes(food)) {
        const db = FOOD_DB[food];
        const qty = food === "egg" ? (multiplierMatch ? parseInt(multiplierMatch[1]) : 1) : 1;
        results.push({
          id: Date.now() + Math.random(),
          type: "food",
          name: food.charAt(0).toUpperCase() + food.slice(1),
          calories: Math.round(db.calories * qty),
          protein: Math.round(db.protein * qty * 10) / 10,
          carbs: Math.round(db.carbs * qty * 10) / 10,
          fat: Math.round(db.fat * qty * 10) / 10,
          timestamp: new Date()
        });
      }
    });

    if (results.length === 0) {
      results.push({
        id: Date.now(),
        type: "food",
        name: text.slice(0, 30),
        calories: 250,
        protein: 12,
        carbs: 30,
        fat: 8,
        estimated: true,
        timestamp: new Date()
      });
    }
  }

  return results;
}

function calculateBMR(profile) {
  const { weight, height, age, sex } = profile;
  if (sex === "male") return Math.round(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age);
  return Math.round(447.593 + 9.247 * weight + 3.098 * height - 4.330 * age);
}

function calculateTDEE(bmr, activity) {
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(bmr * (multipliers[activity] || 1.55));
}

function formatCountdown(endDate) {
  const diff = endDate - Date.now();
  if (diff <= 0) return "EXPIRED";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}D ${hours}H`;
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

function GlowRing({ value, max, color, label, size = 120 }) {
  const pct = Math.min(value / max, 1);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={8}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700, color: "#fff" }}>{value}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>/{max}g</span>
        </div>
      </div>
      <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color, textTransform: "uppercase", letterSpacing: 2 }}>{label}</span>
    </div>
  );
}

function Panel({ children, style = {}, glow = false, className = "" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${glow ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12,
      backdropFilter: "blur(20px)",
      boxShadow: glow ? "0 0 30px rgba(245,158,11,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
      ...style
    }}>
      {children}
    </div>
  );
}

function Badge({ children, color = "#F59E0B" }) {
  return (
    <span style={{
      background: `${color}22`,
      border: `1px solid ${color}44`,
      color,
      fontSize: 9,
      fontFamily: "'Orbitron', monospace",
      letterSpacing: 2,
      padding: "3px 8px",
      borderRadius: 4,
      textTransform: "uppercase"
    }}>{children}</span>
  );
}

function SectionTitle({ children, accent = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 20, background: "#F59E0B", borderRadius: 2, boxShadow: "0 0 10px #F59E0B" }} />
      <span style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 12,
        fontWeight: 700,
        color: accent ? "#F59E0B" : "#fff",
        letterSpacing: 3,
        textTransform: "uppercase"
      }}>{children}</span>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
      position: "relative"
    }}>
      {active && <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 40, height: 2, background: "#F59E0B",
        boxShadow: "0 0 12px #F59E0B", borderRadius: "0 0 4px 4px"
      }} />}
      <span style={{ fontSize: 20, opacity: active ? 1 : 0.4 }}>{icon}</span>
      <span style={{
        fontFamily: "'Orbitron', monospace", fontSize: 8, letterSpacing: 1,
        color: active ? "#F59E0B" : "rgba(255,255,255,0.3)", textTransform: "uppercase"
      }}>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════

function Scouter({ logs, targets, onAddLog }) {
  const todayLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const foodLogs = todayLogs.filter(l => l.type === "food");
  const workoutLogs = todayLogs.filter(l => l.type === "workout");

  const consumed = foodLogs.reduce((a, l) => ({
    calories: a.calories + l.calories,
    protein: a.protein + (l.protein || 0),
    carbs: a.carbs + (l.carbs || 0),
    fat: a.fat + (l.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const burned = workoutLogs.reduce((a, l) => a + l.calories, 0);
  const netCal = consumed.calories - burned;

  const getTacticalIntel = () => {
    const msgs = [];
    if (consumed.protein < targets.protein * 0.5) msgs.push("⚠️ PROTEIN CRITICAL — Deploy chicken breast immediately.");
    else if (consumed.protein >= targets.protein * 0.9) msgs.push("✅ Protein levels optimal. Maintain offensive.");
    if (consumed.calories > targets.calories * 1.1) msgs.push("🔴 CALORIC BREACH — Reduce fuel intake. Switch to defensive mode.");
    else if (consumed.calories < targets.calories * 0.4) msgs.push("⚡ Power reserves low. Initiate refueling protocol.");
    if (workoutLogs.length === 0) msgs.push("🎯 No combat logged today. Activate training sequence.");
    if (msgs.length === 0) msgs.push("✅ All systems nominal. Maintain current trajectory.");
    return msgs;
  };

  const powerPct = Math.min(netCal / targets.calories, 1.5);

  return (
    <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Power Level */}
      <Panel glow style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginBottom: 4 }}>POWER LEVEL</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 42, fontWeight: 900, color: "#F59E0B", lineHeight: 1, textShadow: "0 0 30px rgba(245,158,11,0.5)" }}>
              {netCal.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {consumed.calories} consumed · {burned} burned
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge color={netCal > targets.calories ? "#ef4444" : "#22c55e"}>
              {netCal > targets.calories ? "OVER LIMIT" : "IN RANGE"}
            </Badge>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
              TARGET: {targets.calories}
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${Math.min(powerPct * 100, 100)}%`,
            background: powerPct > 1 ? "#ef4444" : "linear-gradient(90deg, #F59E0B, #fcd34d)",
            borderRadius: 6,
            boxShadow: `0 0 12px ${powerPct > 1 ? "#ef4444" : "#F59E0B"}`,
            transition: "width 1s ease"
          }} />
        </div>
      </Panel>

      {/* Macro Rings */}
      <Panel style={{ padding: 24 }}>
        <SectionTitle>Macro Matrix</SectionTitle>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <GlowRing value={Math.round(consumed.protein)} max={targets.protein} color="#F59E0B" label="Protein" />
          <GlowRing value={Math.round(consumed.carbs)} max={targets.carbs} color="#60a5fa" label="Carbs" />
          <GlowRing value={Math.round(consumed.fat)} max={targets.fat} color="#a78bfa" label="Fat" />
        </div>
      </Panel>

      {/* Tactical Intel */}
      <Panel style={{ padding: 20 }}>
        <SectionTitle accent>Tactical Intel</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {getTacticalIntel().map((msg, i) => (
            <div key={i} style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.5
            }}>{msg}</div>
          ))}
        </div>
      </Panel>

      {/* Today's Logs */}
      <Panel style={{ padding: 20 }}>
        <SectionTitle>Today's Ops</SectionTitle>
        {todayLogs.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "20px 0" }}>
            No activity logged. Begin fuel injection sequence.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayLogs.slice(-5).reverse().map(log => (
              <div key={log.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{log.type === "food" ? "🍖" : "⚔️"}</span>
                  <div>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{log.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      {log.type === "food" ? `P:${log.protein}g C:${log.carbs}g F:${log.fat}g` : `${log.duration}min · ${log.workoutType}`}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, color: log.type === "food" ? "#F59E0B" : "#22c55e" }}>
                  {log.type === "food" ? "+" : "-"}{log.calories}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function FuelInjection({ onLog }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null); // null | "parsing" | "success" | "error"
  const [parsed, setParsed] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setStatus("parsing");
    setTimeout(() => {
      const results = parseNaturalInput(input);
      setParsed(results);
      setStatus("success");
    }, 900);
  };

  const confirmLog = () => {
    parsed.forEach(item => onLog(item));
    setRecentLogs(prev => [...parsed, ...prev].slice(0, 5));
    setParsed(null);
    setInput("");
    setStatus(null);
  };

  const examples = [
    "I ate ramen and 2 eggs",
    "Had chicken breast with rice",
    "Ran 5km in 30 minutes",
    "Did 45min boxing session",
    "Protein shake and banana"
  ];

  return (
    <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
      <Panel glow style={{ padding: 24 }}>
        <SectionTitle accent>Fuel Injection Protocol</SectionTitle>
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Report your intake or combat activity..."
            style={{
              width: "100%", minHeight: 100, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 8, padding: 14, color: "#fff", fontSize: 14,
              resize: "vertical", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 0 20px rgba(245,158,11,0.05)"
            }}
          />
        </div>
        <button onClick={handleSubmit} style={{
          width: "100%", padding: "14px 20px",
          background: status === "parsing" ? "rgba(245,158,11,0.2)" : "linear-gradient(135deg, #F59E0B, #d97706)",
          border: "none", borderRadius: 8, color: "#000", fontFamily: "'Orbitron', monospace",
          fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer",
          boxShadow: "0 0 20px rgba(245,158,11,0.3)",
          transition: "all 0.2s"
        }}>
          {status === "parsing" ? "⚡ PARSING SIGNAL..." : "⚡ INJECT FUEL"}
        </button>
      </Panel>

      {status === "success" && parsed && (
        <Panel style={{ padding: 20 }}>
          <SectionTitle>Parsed Data</SectionTitle>
          {parsed.map(item => (
            <div key={item.id} style={{
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 8, padding: 14, marginBottom: 10
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, color: "#fff" }}>{item.name}</div>
                <Badge color="#22c55e">{item.type === "food" ? "FUEL" : "COMBAT"}</Badge>
              </div>
              {item.type === "food" ? (
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  <span style={{ color: "#F59E0B" }}>{item.calories} kcal</span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g</span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  {item.duration}min · -{item.calories} kcal burned
                </div>
              )}
              {item.estimated && <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 6 }}>⚠ Estimated values — unknown food entry</div>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={confirmLog} style={{
              flex: 1, padding: "12px", background: "linear-gradient(135deg, #22c55e, #16a34a)",
              border: "none", borderRadius: 8, color: "#fff", fontFamily: "'Orbitron', monospace",
              fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer"
            }}>✓ CONFIRM LOG</button>
            <button onClick={() => { setParsed(null); setStatus(null); }} style={{
              flex: 1, padding: "12px", background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444",
              fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer"
            }}>✗ ABORT</button>
          </div>
        </Panel>
      )}

      <Panel style={{ padding: 20 }}>
        <SectionTitle>Quick Commands</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setInput(ex)} style={{
              textAlign: "left", padding: "10px 14px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer",
              transition: "all 0.2s"
            }}><span style={{ color: "#F59E0B", marginRight: 8 }}>›</span>{ex}</button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function RecipeGenerator() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");

  return (
    <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
      <Panel style={{ padding: 20 }}>
        <SectionTitle accent>Recipe Arsenal</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["ALL", "HIGH PROTEIN", "KETO", "VEGAN"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 12px", background: filter === f ? "#F59E0B" : "rgba(255,255,255,0.05)",
              border: `1px solid ${filter === f ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 6, color: filter === f ? "#000" : "rgba(255,255,255,0.5)",
              fontSize: 9, fontFamily: "'Orbitron', monospace", letterSpacing: 1, cursor: "pointer"
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {RECIPES.filter(r => filter === "ALL" || r.tag === filter).map(recipe => (
            <div key={recipe.id} onClick={() => setSelected(selected?.id === recipe.id ? null : recipe)}
              style={{
                background: selected?.id === recipe.id ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected?.id === recipe.id ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 10, padding: 16, cursor: "pointer",
                transition: "all 0.2s"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{recipe.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#fff", marginBottom: 4 }}>{recipe.name}</div>
                    <Badge>{recipe.tag}</Badge>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, color: "#F59E0B" }}>{recipe.macros.calories}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>KCAL</div>
                </div>
              </div>
              {selected?.id === recipe.id && (
                <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    {[["Protein", recipe.macros.protein, "#F59E0B"], ["Carbs", recipe.macros.carbs, "#60a5fa"], ["Fat", recipe.macros.fat, "#a78bfa"]].map(([label, val, color]) => (
                      <div key={label} style={{ flex: 1, background: `${color}11`, border: `1px solid ${color}22`, borderRadius: 8, padding: "10px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, color }}>{val}g</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#F59E0B", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 8 }}>INGREDIENTS</div>
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", padding: "4px 0" }}>
                        <span style={{ color: "#F59E0B", marginRight: 8 }}>›</span>{ing}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#F59E0B", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 8 }}>PROTOCOL</div>
                    {recipe.instructions.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                        <span style={{ fontFamily: "'Orbitron', monospace", color: "#F59E0B", minWidth: 20 }}>{i + 1}.</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Event Participant Dashboard ──────────────────────────────
function EventDashboard({ event, isAdmin, participants, onUpdateWeight }) {
  const [editingId, setEditingId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditVals({ startWeight: p.startWeight ?? "", endWeight: p.endWeight ?? "" });
  };

  const saveEdit = (pid) => {
    onUpdateWeight(event.id, pid, {
      startWeight: parseFloat(editVals.startWeight) || null,
      endWeight: parseFloat(editVals.endWeight) || null
    });
    setEditingId(null);
  };

  const deadline = event.endDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const totalDays = Math.ceil((event.endDate - event.startDate) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((Date.now() - event.startDate) / (1000 * 60 * 60 * 24));
  const missionPct = Math.min((elapsedDays / totalDays) * 100, 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Mission Timeline */}
      <div style={{
        background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 10, padding: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 3 }}>MISSION DEADLINE</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 700, color: "#F59E0B" }}>{deadline}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 3 }}>TIME REMAINING</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 700, color: "#fff" }}>{formatCountdown(event.endDate)}</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5, overflow: "hidden", marginBottom: 6 }}>
          <div style={{
            height: "100%", width: `${missionPct}%`,
            background: "linear-gradient(90deg, #F59E0B, #d97706)",
            borderRadius: 4, boxShadow: "0 0 8px rgba(245,158,11,0.6)",
            transition: "width 1s ease"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', monospace" }}>
          <span>DAY {Math.max(elapsedDays, 1)}</span>
          <span>DAY {totalDays}</span>
        </div>
      </div>

      {/* Participant Count */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 16, background: "#F59E0B", borderRadius: 2, boxShadow: "0 0 8px #F59E0B" }} />
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 3 }}>
          OPERATIVES ({participants.length})
        </span>
      </div>

      {/* Participant Cards */}
      {participants.map((p, idx) => {
        const isEditing = editingId === p.id;
        const hasEnd = p.endWeight !== null && p.endWeight !== undefined;
        const change = hasEnd ? (p.endWeight - p.startWeight).toFixed(1) : null;
        const isCutting = p.targetWeight < p.startWeight;
        const progressToTarget = hasEnd
          ? Math.min(Math.abs(p.endWeight - p.startWeight) / Math.abs(p.targetWeight - p.startWeight) * 100, 100)
          : 0;

        return (
          <div key={p.id} style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${hasEnd ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 10, padding: 14, position: "relative"
          }}>
            {/* Rank indicator */}
            <div style={{
              position: "absolute", top: 14, right: 14,
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Orbitron', monospace", fontSize: 9, color: "#F59E0B", fontWeight: 700
            }}>{String(idx + 1).padStart(2, "0")}</div>

            <div style={{ marginRight: 32 }}>
              <div style={{ fontWeight: 600, color: "#fff", fontSize: 14, marginBottom: 10 }}>{p.name}</div>

              {isEditing ? (
                /* Admin Edit Mode */
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["START WEIGHT (KG)", "startWeight"], ["END WEIGHT (KG)", "endWeight"]].map(([label, key]) => (
                    <div key={key}>
                      <div style={{ fontSize: 9, fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
                      <input
                        type="number"
                        step="0.1"
                        value={editVals[key]}
                        onChange={e => setEditVals(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="e.g. 84.5"
                        style={{
                          width: "100%", padding: "8px 12px",
                          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.4)",
                          borderRadius: 7, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box"
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={() => saveEdit(p.id)} style={{
                      flex: 1, padding: "9px", background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      border: "none", borderRadius: 7, color: "#fff", fontFamily: "'Orbitron', monospace",
                      fontWeight: 700, fontSize: 9, letterSpacing: 2, cursor: "pointer"
                    }}>✓ SAVE</button>
                    <button onClick={() => setEditingId(null)} style={{
                      flex: 1, padding: "9px", background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, color: "#ef4444",
                      fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: 9, letterSpacing: 2, cursor: "pointer"
                    }}>✗ CANCEL</button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {/* Start Weight */}
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 10px" }}>
                      <div style={{ fontSize: 8, fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 3 }}>START</div>
                      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 700, color: "#60a5fa" }}>
                        {p.startWeight != null ? `${p.startWeight}` : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>—</span>}
                      </div>
                      {p.startWeight != null && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>kg</div>}
                    </div>

                    {/* End Weight */}
                    <div style={{ flex: 1, background: hasEnd ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.04)", border: `1px solid ${hasEnd ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "9px 10px" }}>
                      <div style={{ fontSize: 8, fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 3 }}>CURRENT</div>
                      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 700, color: hasEnd ? "#22c55e" : "rgba(255,255,255,0.2)" }}>
                        {hasEnd ? `${p.endWeight}` : "—"}
                      </div>
                      {hasEnd && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>kg</div>}
                    </div>

                    {/* Target Weight */}
                    <div style={{ flex: 1, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: "9px 10px" }}>
                      <div style={{ fontSize: 8, fontFamily: "'Orbitron', monospace", color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 3 }}>TARGET</div>
                      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 700, color: "#F59E0B" }}>
                        {p.targetWeight != null ? `${p.targetWeight}` : "—"}
                      </div>
                      {p.targetWeight != null && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>kg</div>}
                    </div>
                  </div>

                  {/* Progress bar towards target */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${progressToTarget}%`,
                        background: hasEnd ? "linear-gradient(90deg, #F59E0B, #22c55e)" : "rgba(255,255,255,0.1)",
                        borderRadius: 4,
                        boxShadow: hasEnd ? "0 0 6px rgba(245,158,11,0.4)" : "none",
                        transition: "width 1s ease"
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', monospace" }}>
                        {Math.round(progressToTarget)}% to target
                      </span>
                      {change !== null && (
                        <span style={{
                          fontSize: 9, fontFamily: "'Orbitron', monospace", fontWeight: 700,
                          color: isCutting
                            ? (parseFloat(change) < 0 ? "#22c55e" : "#ef4444")
                            : (parseFloat(change) > 0 ? "#22c55e" : "#ef4444")
                        }}>
                          {parseFloat(change) > 0 ? "+" : ""}{change} kg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Badge color={hasEnd ? "#22c55e" : "rgba(255,255,255,0.2)"}>
                      {hasEnd ? "DATA LOGGED" : "AWAITING DATA"}
                    </Badge>
                    {isAdmin && (
                      <button onClick={() => startEdit(p)} style={{
                        padding: "5px 10px", background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6,
                        color: "#F59E0B", fontSize: 9, fontFamily: "'Orbitron', monospace",
                        letterSpacing: 1, cursor: "pointer"
                      }}>✏ EDIT</button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Event System ─────────────────────────────────────────────
function EventSystem({ isAdmin = false }) {
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [eventTab, setEventTab] = useState({}); // eventId -> "log" | "dashboard"
  const [showCreate, setShowCreate] = useState(false);
  const [logInputs, setLogInputs] = useState({});
  const [eventLogs, setEventLogs] = useState({});
  const [participants, setParticipants] = useState(() => {
    const map = {};
    MOCK_EVENTS.forEach(e => { map[e.id] = e.participants; });
    return map;
  });

  const getTab = (eid) => eventTab[eid] || "log";
  const setTab = (eid, t) => setEventTab(prev => ({ ...prev, [eid]: t }));

  const logEventActivity = (eventId) => {
    const input = logInputs[eventId] || "";
    if (!input.trim()) return;
    const parsed = parseNaturalInput(input);
    setEventLogs(prev => ({ ...prev, [eventId]: [...(prev[eventId] || []), ...parsed] }));
    setLogInputs(prev => ({ ...prev, [eventId]: "" }));
  };

  const updateWeight = (eventId, userId, vals) => {
    setParticipants(prev => ({
      ...prev,
      [eventId]: prev[eventId].map(p => p.id === userId ? { ...p, ...vals } : p)
    }));
  };

  return (
    <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 700, color: "#fff" }}>Active Missions</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Special Training Arc</div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(!showCreate)} style={{
            padding: "8px 14px", background: "linear-gradient(135deg, #F59E0B, #d97706)",
            border: "none", borderRadius: 8, color: "#000", fontFamily: "'Orbitron', monospace",
            fontWeight: 700, fontSize: 9, letterSpacing: 2, cursor: "pointer"
          }}>+ CREATE</button>
        )}
      </div>

      {/* Create Event Form */}
      {showCreate && isAdmin && (
        <Panel glow style={{ padding: 20 }}>
          <SectionTitle accent>Deploy New Mission</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Mission Name", "text"], ["Objective", "text"], ["Start Date", "date"], ["End Date", "date"]].map(([label, type], i) => (
              <div key={i}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 6 }}>{label.toUpperCase()}</div>
                <input type={type} placeholder={type === "text" ? label : undefined} style={{
                  width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8,
                  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box"
                }} />
              </div>
            ))}
            <button style={{
              padding: "12px", background: "linear-gradient(135deg, #F59E0B, #d97706)",
              border: "none", borderRadius: 8, color: "#000", fontFamily: "'Orbitron', monospace",
              fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer", marginTop: 4
            }}>⚡ DEPLOY MISSION</button>
          </div>
        </Panel>
      )}

      {/* Events */}
      {MOCK_EVENTS.map(event => {
        const isActive = event.startDate <= new Date() && event.endDate >= new Date();
        const isExpanded = expandedEvent === event.id;
        const logs = eventLogs[event.id] || [];
        const pts = participants[event.id] || [];
        const currentTab = getTab(event.id);
        const logInput = logInputs[event.id] || "";

        return (
          <Panel key={event.id} glow={isActive} style={{ padding: 0, overflow: "hidden" }}>
            {/* Event Header — always visible, click to expand/collapse */}
            <div onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
              style={{ padding: "20px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#22c55e" : "#6b7280", boxShadow: isActive ? "0 0 8px #22c55e" : "none" }} />
                    <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: isActive ? "#22c55e" : "#6b7280", letterSpacing: 2 }}>
                      {isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <Badge color="rgba(255,255,255,0.2)">{pts.length} OPS</Badge>
                  </div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 15, marginBottom: 4 }}>{event.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{event.description}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 15, fontWeight: 700, color: "#F59E0B" }}>
                    {formatCountdown(event.endDate)}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>REMAINING</div>
                </div>
              </div>
              {/* Expand chevron */}
              <div style={{ textAlign: "center", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>
                  {isExpanded ? "▲ COLLAPSE" : "▼ EXPAND"}
                </span>
              </div>
            </div>

            {/* Expanded Area */}
            {isExpanded && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

                {/* Tab Bar */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {[
                    { id: "dashboard", label: "📊 DASHBOARD" },
                    { id: "log", label: "⚡ COMBAT LOG" },
                  ].map(t => (
                    <button key={t.id} onClick={(e) => { e.stopPropagation(); setTab(event.id, t.id); }} style={{
                      flex: 1, padding: "13px 8px",
                      background: currentTab === t.id ? "rgba(245,158,11,0.1)" : "transparent",
                      border: "none",
                      borderBottom: currentTab === t.id ? "2px solid #F59E0B" : "2px solid transparent",
                      color: currentTab === t.id ? "#F59E0B" : "rgba(255,255,255,0.35)",
                      fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 2,
                      cursor: "pointer", transition: "all 0.2s"
                    }}>{t.label}</button>
                  ))}
                </div>

                {/* DASHBOARD TAB */}
                {currentTab === "dashboard" && (
                  <div style={{ padding: 20 }}>
                    <EventDashboard
                      event={event}
                      isAdmin={isAdmin}
                      participants={pts}
                      onUpdateWeight={updateWeight}
                    />
                  </div>
                )}

                {/* COMBAT LOG TAB */}
                {currentTab === "log" && (
                  <div style={{ padding: 20 }}>
                    {isActive ? (
                      <>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, fontFamily: "'Orbitron', monospace", color: "#F59E0B", letterSpacing: 2, marginBottom: 10 }}>
                            LOG ACTIVITY
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              value={logInput}
                              onChange={e => setLogInputs(prev => ({ ...prev, [event.id]: e.target.value }))}
                              onKeyDown={e => e.key === "Enter" && logEventActivity(event.id)}
                              placeholder="Log mission activity..."
                              style={{
                                flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8,
                                color: "#fff", fontSize: 13, outline: "none"
                              }}
                            />
                            <button onClick={() => logEventActivity(event.id)} style={{
                              padding: "10px 16px", background: "#F59E0B", border: "none",
                              borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer"
                            }}>⚡</button>
                          </div>
                        </div>

                        {/* Quick stats */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                          {[["⚡", "Calories", logs.reduce((a, l) => a + l.calories, 0), "#F59E0B"],
                            ["💪", "Protein", Math.round(logs.reduce((a, l) => a + (l.protein || 0), 0)), "#60a5fa"],
                            ["🔥", "Burned", logs.filter(l => l.type === "workout").reduce((a, l) => a + l.calories, 0), "#22c55e"]
                          ].map(([icon, label, val, color]) => (
                            <div key={label} style={{ flex: 1, background: `${color}11`, border: `1px solid ${color}22`, borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                              <div style={{ fontSize: 16 }}>{icon}</div>
                              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, color, fontWeight: 700 }}>{val}</div>
                              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{label}</div>
                            </div>
                          ))}
                        </div>

                        {logs.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                            No activity logged yet. Begin mission protocol.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {logs.slice(-5).reverse().map((log, i) => (
                              <div key={i} style={{
                                display: "flex", justifyContent: "space-between",
                                padding: "8px 12px", background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8
                              }}>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{log.type === "food" ? "🍖" : "⚔️"} {log.name}</span>
                                <span style={{ fontSize: 12, fontFamily: "'Orbitron', monospace", color: log.type === "food" ? "#F59E0B" : "#22c55e" }}>
                                  {log.type === "food" ? "+" : "-"}{log.calories}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>
                        MISSION WINDOW CLOSED
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

function ProfileSetup({ profile, onSave }) {
  const [form, setForm] = useState(profile);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const bmr = calculateBMR(form);
  const tdee = calculateTDEE(bmr, form.activity);

  return (
    <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
      <Panel glow style={{ padding: 24 }}>
        <SectionTitle accent>Operative Profile</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Sex */}
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 8 }}>UNIT CLASS</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["male", "female"].map(s => (
                <button key={s} onClick={() => update("sex", s)} style={{
                  flex: 1, padding: "10px", background: form.sex === s ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${form.sex === s ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8, color: form.sex === s ? "#F59E0B" : "rgba(255,255,255,0.4)",
                  fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 2, cursor: "pointer",
                  textTransform: "uppercase"
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Numeric inputs */}
          {[["WEIGHT (KG)", "weight", "number"], ["HEIGHT (CM)", "height", "number"], ["AGE", "age", "number"]].map(([label, key, type]) => (
            <div key={key}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 8 }}>{label}</div>
              <input
                type={type}
                value={form[key] || ""}
                onChange={e => update(key, parseFloat(e.target.value))}
                style={{
                  width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8,
                  color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          ))}

          {/* Activity */}
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 8 }}>COMBAT FREQUENCY</div>
            <select
              value={form.activity}
              onChange={e => update("activity", e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8,
                color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box"
              }}
            >
              <option value="sedentary" style={{ background: "#1a1a1a" }}>Sedentary</option>
              <option value="light" style={{ background: "#1a1a1a" }}>Light (1-3x/week)</option>
              <option value="moderate" style={{ background: "#1a1a1a" }}>Moderate (3-5x/week)</option>
              <option value="active" style={{ background: "#1a1a1a" }}>Active (6-7x/week)</option>
              <option value="very_active" style={{ background: "#1a1a1a" }}>Very Active (2x/day)</option>
            </select>
          </div>

          {/* Diet */}
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 8 }}>FUEL PROTOCOL</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["standard", "keto", "vegan", "paleo"].map(d => (
                <button key={d} onClick={() => update("diet", d)} style={{
                  padding: "8px 12px", background: form.diet === d ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${form.diet === d ? "#F59E0B" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8, color: form.diet === d ? "#F59E0B" : "rgba(255,255,255,0.4)",
                  fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 2, cursor: "pointer",
                  textTransform: "uppercase"
                }}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* Calculated Stats */}
      <Panel style={{ padding: 20 }}>
        <SectionTitle>Combat Stats</SectionTitle>
        <div style={{ display: "flex", gap: 12 }}>
          {[["BMR", bmr, "Base Rate"], ["TDEE", tdee, "Daily Target"]].map(([label, val, sub]) => (
            <div key={label} style={{ flex: 1, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 6 }}>{label}</div>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 26, fontWeight: 700, color: "#F59E0B" }}>{val.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>
        <button onClick={() => onSave({ ...form, tdee, bmr })} style={{
          width: "100%", marginTop: 16, padding: "13px",
          background: "linear-gradient(135deg, #F59E0B, #d97706)",
          border: "none", borderRadius: 8, color: "#000", fontFamily: "'Orbitron', monospace",
          fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: "pointer",
          boxShadow: "0 0 20px rgba(245,158,11,0.3)"
        }}>⚡ SAVE OPERATIVE DATA</button>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

const DEFAULT_PROFILE = {
  sex: "male", weight: 75, height: 178, age: 25,
  activity: "moderate", diet: "standard"
};

export default function GearKai() {
  const { user, userProfile, isAdmin, loading, logout } = useAuth();
  const [tab, setTab]       = useState("scouter");
  const [logs, setLogs]     = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [showLogout, setShowLogout] = useState(false);

  // ── Loading splash ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0f0f0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        <div style={{
          width: 56, height: 56, background: "linear-gradient(135deg, #F59E0B, #d97706)",
          borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, boxShadow: "0 0 40px rgba(245,158,11,0.4)",
          animation: "pulse 1.5s infinite"
        }}>⚡</div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 3 }}>
          INITIALIZING SCOUTER...
        </div>
      </div>
    );
  }

  // ── Not logged in → show auth screen ──────────────────────
  if (!user) return <AuthScreen />;

  // ── Logged in → show app ───────────────────────────────────
  const bmr  = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activity);
  const targets = {
    calories: tdee,
    protein:  Math.round(profile.weight * 2),
    carbs:    Math.round((tdee * 0.4) / 4),
    fat:      Math.round((tdee * 0.25) / 9)
  };

  const addLog = (item) => setLogs(prev => [...prev, item]);

  return (
    <div style={{
      background: "#0f0f0f", minHeight: "100vh", color: "#fff",
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: "relative", maxWidth: 480, margin: "0 auto",
      display: "flex", flexDirection: "column"
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 4px; }
        select option { color: #fff !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      {/* Scanline */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(transparent, rgba(245,158,11,0.15), transparent)",
        animation: "scanline 4s linear infinite",
        pointerEvents: "none", zIndex: 100
      }} />

      {/* Grid Background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px", pointerEvents: "none"
      }} />

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(15,15,15,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(245,158,11,0.15)",
        padding: "14px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, background: "linear-gradient(135deg, #F59E0B, #d97706)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "0 0 20px rgba(245,158,11,0.4)"
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 16, color: "#F59E0B", letterSpacing: 3 }}>GEARKAI</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>TACTICAL SCOUTER v2.0</div>
          </div>
        </div>

        {/* User info + logout */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowLogout(!showLogout)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px",
            background: isAdmin ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isAdmin ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 8, cursor: "pointer"
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#22c55e", boxShadow: "0 0 8px #22c55e",
              animation: "pulse 2s infinite", flexShrink: 0
            }} />
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontFamily: "'Orbitron', monospace", fontSize: 9,
                color: isAdmin ? "#F59E0B" : "#fff", letterSpacing: 1,
                maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {userProfile?.displayName || user.email?.split("@")[0] || "OPERATIVE"}
              </div>
              <div style={{ fontSize: 8, color: isAdmin ? "#F59E0B" : "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>
                {isAdmin ? "⚙ ADMIN" : "👤 USER"}
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {showLogout && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "rgba(20,20,20,0.98)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 10, overflow: "hidden", minWidth: 160, zIndex: 200,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
            }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Signed in as</div>
                <div style={{ fontSize: 12, color: "#fff", fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                  {user.email}
                </div>
              </div>
              <button onClick={() => { setShowLogout(false); logout(); }} style={{
                width: "100%", padding: "12px 14px", background: "none", border: "none",
                color: "#ef4444", fontSize: 12, cursor: "pointer", textAlign: "left",
                fontFamily: "'Orbitron', monospace", letterSpacing: 1, fontSize: 10,
                display: "flex", alignItems: "center", gap: 8
              }}>
                <span>⏻</span> LOGOUT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tap outside to close dropdown */}
      {showLogout && (
        <div onClick={() => setShowLogout(false)}
          style={{ position: "fixed", inset: 0, zIndex: 49 }} />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
        {tab === "scouter"  && <Scouter logs={logs} targets={targets} />}
        {tab === "fuel"     && <FuelInjection onLog={addLog} />}
        {tab === "recipes"  && <RecipeGenerator />}
        {tab === "events"   && <EventSystem isAdmin={isAdmin} />}
        {tab === "profile"  && <ProfileSetup profile={profile} onSave={setProfile} />}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "sticky", bottom: 0, zIndex: 50,
        background: "rgba(15,15,15,0.97)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(245,158,11,0.1)",
        display: "flex", justifyContent: "space-around", padding: "4px 0 8px"
      }}>
        {[
          { id: "scouter",  icon: "📡", label: "Scouter"   },
          { id: "fuel",     icon: "⚡", label: "Fuel"      },
          { id: "recipes",  icon: "🍖", label: "Arsenal"   },
          { id: "events",   icon: "🎯", label: "Missions"  },
          { id: "profile",  icon: "👤", label: "Operative" },
        ].map(item => (
          <NavItem key={item.id} icon={item.icon} label={item.label}
            active={tab === item.id} onClick={() => setTab(item.id)} />
        ))}
      </div>
    </div>
  );
}
