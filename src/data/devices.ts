/** On-board equipment that can fail. Names and fallbacks are demo content, not clinical guidance. */
export interface Device {
  id: string;
  name: string;
  /** Indicators this device produces. */
  indicators: string[];
  /** What the crew can do while it is down. Holding-step wording only. */
  fallback: string;
}

export const DEVICES: Device[] = [
  {
    id: "bp_cuff",
    name: "Blood pressure cuff",
    indicators: ["bp_systolic"],
    fallback:
      "Count the pulse by hand, note symptoms, and tell the medical team the cuff is down. Re-measure when it is back.",
  },
  {
    id: "glucose_meter",
    name: "Glucose meter",
    indicators: ["glucose"],
    fallback:
      "Note symptoms and the time of the last meal, and tell the medical team. Use the backup meter if one is on board.",
  },
  {
    id: "thermometer",
    name: "Thermometer",
    indicators: ["temp"],
    fallback:
      "Note symptoms and the cabin temperature, compare with a crewmate's reading, and tell the medical team.",
  },
  {
    id: "co2_sensor",
    name: "Cabin CO2 sensor",
    indicators: ["co2"],
    fallback:
      "Check ventilation and the scrubber by hand. Treat the cabin as high CO2 until the sensor is back.",
  },
  {
    id: "ultrasound",
    name: "Ultrasound",
    indicators: [],
    fallback:
      "No scan can be taken. Describe what you see in words and attach a camera photo instead, so Earth can review it when the link allows.",
  },
];

export type DeviceState = Record<string, boolean>; // true = working

export const ALL_WORKING: DeviceState = Object.fromEntries(DEVICES.map((d) => [d.id, true]));

export function getDevice(id: string): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}

export function isDown(state: DeviceState, id: string | undefined): boolean {
  return !!id && state[id] === false;
}

/** The device that produces an indicator, if it is one of ours. */
export function deviceForIndicator(indicator: string): Device | undefined {
  return DEVICES.find((d) => d.indicators.includes(indicator));
}

/** The failed device behind an indicator, or undefined if it is working or has no device. */
export function failedDeviceFor(state: DeviceState, indicator: string): Device | undefined {
  const d = deviceForIndicator(indicator);
  return d && isDown(state, d.id) ? d : undefined;
}

/** Devices a lunar rover crew carries. The rest stay at the base habitat. Demo content. */
export const ROVER_KIT = ["bp_cuff", "thermometer", "co2_sensor"];

export function carriedOn(envId: string | undefined, id: string): boolean {
  return envId !== "rover" || ROVER_KIT.includes(id);
}

/** Working state after accounting for what the current environment carries. */
export function effectiveDevices(state: DeviceState, envId: string | undefined): DeviceState {
  return Object.fromEntries(DEVICES.map((d) => [d.id, state[d.id] !== false && carriedOn(envId, d.id)]));
}

export const AT_BASE_FALLBACK =
  "Not carried on the rover. Note symptoms, tell the crew, and re-measure when you are back at base.";

/** How to describe an unavailable device: failed, or left at base on a rover traverse. */
export function deviceIssue(device: Device, envId: string | undefined): { title: string; fallback: string; reason: "failed" | "at_base" } {
  if (!carriedOn(envId, device.id)) {
    return { title: `${device.name} is at base, not on the rover`, fallback: AT_BASE_FALLBACK, reason: "at_base" };
  }
  return { title: `${device.name} has failed`, fallback: device.fallback, reason: "failed" };
}
