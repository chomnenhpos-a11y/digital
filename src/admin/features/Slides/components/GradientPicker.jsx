import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_GRADIENT =
  "linear-gradient(90deg, #FF5733 0%, #FFC300 100%)";

const DEFAULT_STOPS = [
  {
    id: 1,
    color: "#FF5733",
    position: 0,
  },
  {
    id: 2,
    color: "#FFC300",
    position: 100,
  },
];

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function splitGradientStops(value) {
  const result = [];
  let current = "";
  let depth = 0;

  for (const char of value) {
    if (char === "(") depth++;
    if (char === ")") depth--;

    if (char === "," && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

function parseGradient(value) {
  if (!value || !value.includes("gradient")) {
    return {
      type: "linear",
      angle: 90,
      stops: DEFAULT_STOPS.map((stop) => ({
        ...stop,
        id: createId(),
      })),
    };
  }

  const linearMatch = value.match(
    /^linear-gradient\(\s*([0-9.]+)deg\s*,\s*(.*)\)$/i
  );

  if (linearMatch) {
    const angle = Number(linearMatch[1]) || 90;

    const stops = splitGradientStops(linearMatch[2])
      .map((item) => {
        const match = item.match(/^(.*?)\s+([0-9.]+)%$/);

        if (!match) return null;

        return {
          id: createId(),
          color: match[1].trim(),
          position: Number(match[2]),
        };
      })
      .filter(Boolean);

    return {
      type: "linear",
      angle,
      stops:
        stops.length >= 2
          ? stops
          : DEFAULT_STOPS.map((stop) => ({
              ...stop,
              id: createId(),
            })),
    };
  }

  const radialMatch = value.match(
    /^radial-gradient\(\s*(.*?)\)$/i
  );

  if (radialMatch) {
    const stops = splitGradientStops(radialMatch[1])
      .map((item) => {
        const match = item.match(/^(.*?)\s+([0-9.]+)%$/);

        if (!match) return null;

        return {
          id: createId(),
          color: match[1].trim(),
          position: Number(match[2]),
        };
      })
      .filter(Boolean);

    return {
      type: "radial",
      angle: 90,
      stops:
        stops.length >= 2
          ? stops
          : DEFAULT_STOPS.map((stop) => ({
              ...stop,
              id: createId(),
            })),
    };
  }

  return {
    type: "linear",
    angle: 90,
    stops: DEFAULT_STOPS.map((stop) => ({
      ...stop,
      id: createId(),
    })),
  };
}

function buildGradient(type, angle, stops) {
  const sortedStops = [...stops].sort(
    (a, b) => a.position - b.position
  );

  const colors = sortedStops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");

  if (type === "radial") {
    return `radial-gradient(circle, ${colors})`;
  }

  return `linear-gradient(${angle}deg, ${colors})`;
}

function normalizeHex(value) {
  if (!value) return "#FFFFFF";

  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value;
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(value)) {
    return (
      "#" +
      value
        .slice(1)
        .split("")
        .map((char) => char + char)
        .join("")
    );
  }

  return "#FFFFFF";
}

export default function GradientPicker({ value, onChange }) {
  const initializedRef = useRef(false);

  const initial = useMemo(
    () => parseGradient(value || DEFAULT_GRADIENT),
    []
  );

  const [type, setType] = useState(initial.type);
  const [angle, setAngle] = useState(initial.angle);
  const [stops, setStops] = useState(initial.stops);
  const [selectedStopId, setSelectedStopId] = useState(
    initial.stops[0]?.id
  );
  const [draggingId, setDraggingId] = useState(null);

  const gradient = useMemo(
    () => buildGradient(type, angle, stops),
    [type, angle, stops]
  );

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    if (!value) return;

    const currentGradient = buildGradient(type, angle, stops);

    if (value === currentGradient) return;

    const parsed = parseGradient(value);

    setType(parsed.type);
    setAngle(parsed.angle);
    setStops(parsed.stops);

    if (parsed.stops.length > 0) {
      setSelectedStopId(parsed.stops[0].id);
    }
  }, [value]);

  const emitGradient = (
    nextStops,
    nextType = type,
    nextAngle = angle
  ) => {
    onChange(
      buildGradient(nextType, nextAngle, nextStops)
    );
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    emitGradient(stops, newType, angle);
  };

  const handleAngleChange = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return;

    const safeAngle = Math.max(
      0,
      Math.min(360, number)
    );

    setAngle(safeAngle);
    emitGradient(stops, type, safeAngle);
  };

  const updateStop = (id, changes) => {
    const newStops = stops.map((stop) =>
      stop.id === id
        ? {
            ...stop,
            ...changes,
          }
        : stop
    );

    setStops(newStops);
    setSelectedStopId(id);
    emitGradient(newStops);
  };

  const addStop = () => {
    if (stops.length >= 8) return;

    const sorted = [...stops].sort(
      (a, b) => a.position - b.position
    );

    let position = 50;

    if (sorted.length >= 2) {
      let largestGap = 0;
      let gapPosition = 50;

      for (let i = 0; i < sorted.length - 1; i++) {
        const gap =
          sorted[i + 1].position -
          sorted[i].position;

        if (gap > largestGap) {
          largestGap = gap;

          gapPosition =
            sorted[i].position + gap / 2;
        }
      }

      position = Math.round(gapPosition);
    }

    const newStop = {
      id: createId(),
      color: "#FFFFFF",
      position,
    };

    const newStops = [...stops, newStop];

    setStops(newStops);
    setSelectedStopId(newStop.id);
    emitGradient(newStops);
  };

  const removeStop = (id) => {
    if (stops.length <= 2) return;

    const newStops = stops.filter(
      (stop) => stop.id !== id
    );

    setStops(newStops);

    const nextStop = newStops[newStops.length - 1];

    setSelectedStopId(nextStop?.id);
    emitGradient(newStops);
  };

  const handleStopDrag = (event) => {
    if (!draggingId) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    let position =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    position = Math.max(
      0,
      Math.min(100, position)
    );

    position = Math.round(position);

    updateStop(draggingId, {
      position,
    });
  };

  const selectedStop = stops.find(
    (stop) => stop.id === selectedStopId
  );

  return (
    <div
      className="space-y-4"
      onPointerUp={() => setDraggingId(null)}
      onPointerMove={
        draggingId ? handleStopDrag : undefined
      }
    >
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Gradient Type
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("linear")}
            className={`px-3 py-2 text-sm rounded-lg border transition ${
              type === "linear"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-[#fcfafb] text-slate-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Linear
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("radial")}
            className={`px-3 py-2 text-sm rounded-lg border transition ${
              type === "radial"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-[#fcfafb] text-slate-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Radial
          </button>
        </div>
      </div>

      <div
        className="w-full h-32 rounded-xl border border-gray-200 shadow-inner"
        style={{
          background: gradient,
        }}
      />

      {type === "linear" && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-600">
              Angle
            </label>

            <span className="text-xs font-medium text-slate-500">
              {angle}°
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) =>
                handleAngleChange(e.target.value)
              }
              className="flex-1"
            />

            <input
              type="number"
              min="0"
              max="360"
              value={angle}
              onChange={(e) =>
                handleAngleChange(e.target.value)
              }
              className="w-20 px-2 py-2 text-sm bg-[#fcfafb] rounded-lg outline-none border border-gray-200 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-600">
            Color Stops
          </label>

          <button
            type="button"
            onClick={addStop}
            disabled={stops.length >= 8}
            className="text-xs font-semibold text-[#870d4c] hover:text-[#9d1159] disabled:text-gray-400"
          >
            + Add color
          </button>
        </div>

        <div
          className="relative h-12 select-none"
          onPointerMove={
            draggingId ? handleStopDrag : undefined
          }
        >
          <div
            className="absolute left-0 right-0 top-4 h-5 rounded-full border border-gray-200"
            style={{
              background: gradient,
            }}
          />

          {stops.map((stop) => (
            <button
              key={stop.id}
              type="button"
              onClick={() =>
                setSelectedStopId(stop.id)
              }
              onPointerDown={(event) => {
                event.preventDefault();
                setSelectedStopId(stop.id);
                setDraggingId(stop.id);
              }}
              className={`absolute top-2 w-9 h-9 rounded-full border-2 shadow-md -translate-x-1/2 cursor-grab active:cursor-grabbing transition ${
                selectedStopId === stop.id
                  ? "border-slate-900 scale-110"
                  : "border-white"
              }`}
              style={{
                left: `${stop.position}%`,
                background: stop.color,
              }}
              title={`${stop.color} ${stop.position}%`}
            />
          ))}
        </div>

        <div className="space-y-2">
          {[...stops]
            .sort(
              (a, b) =>
                a.position - b.position
            )
            .map((stop) => (
              <div
                key={stop.id}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  selectedStopId === stop.id
                    ? "border-slate-300 bg-[#fcfafb]"
                    : "border-gray-100 bg-[#fcfafb]"
                }`}
              >
                <input
                  type="color"
                  value={normalizeHex(stop.color)}
                  onChange={(e) =>
                    updateStop(stop.id, {
                      color: e.target.value,
                    })
                  }
                  className="w-9 h-9 p-1 bg-white rounded-md border border-gray-200 cursor-pointer"
                />

                <input
                  type="text"
                  value={stop.color}
                  onChange={(e) =>
                    updateStop(stop.id, {
                      color: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0 px-2 py-2 text-xs uppercase bg-white rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                />

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) => {
                    const position =
                      Number(e.target.value);

                    if (Number.isNaN(position)) return;

                    updateStop(stop.id, {
                      position: Math.max(
                        0,
                        Math.min(100, position)
                      ),
                    });
                  }}
                  className="w-16 px-2 py-2 text-xs bg-white rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-gray-200"
                />

                <span className="text-xs text-slate-400">
                  %
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeStop(stop.id)
                  }
                  disabled={stops.length <= 2}
                  className="w-7 h-7 text-red-500 hover:bg-red-50 rounded-md disabled:text-gray-300 disabled:hover:bg-transparent"
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          CSS Gradient
        </label>

        <textarea
          value={gradient}
          readOnly
          rows={3}
          className="w-full px-3 py-2 text-xs font-mono bg-[#fcfafb] rounded-lg border border-gray-200 outline-none resize-none"
        />
      </div>

      {selectedStop && (
        <div className="text-[11px] text-slate-400">
          Selected: {selectedStop.color} at{" "}
          {selectedStop.position}%
        </div>
      )}
    </div>
  );
}
