/**
 * Engineering Precision Workspace — Fabric.js defaults (global `fabric` from CDN).
 * Accents: primary #73ffe3, secondary #c3f400, tertiary #ffa44c
 */

export const DS = {
  primary: "#73ffe3",
  secondary: "#c3f400",
  tertiary: "#ffa44c",
  error: "#ff716c",
  surface: "#0e0e0e",
  surfaceContainer: "#1a1919",
  surfaceContainerHigh: "#201f1f",
  outlineVariant: "#484847",
  onSurface: "#ffffff",
  onSurfaceVariant: "#adaaaa",
};

const FONT_STACK =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

let applied = false;

/**
 * Patch Fabric prototypes once: selection chrome, resize handles, default text.
 */
export function applyFabricDesignSystem(fabric) {
  if (!fabric || applied) return;
  applied = true;

  const { primary, surfaceContainer } = DS;

  const Obj = fabric.Object.prototype;
  Obj.borderColor = primary;
  Obj.cornerColor = surfaceContainer;
  Obj.cornerStrokeColor = primary;
  Obj.transparentCorners = false;
  Obj.cornerSize = 10;
  Obj.touchCornerSize = 26;
  Obj.cornerStyle = "rect";
  Obj.borderDashArray = [5, 4];
  Obj.borderScaleFactor = 1;
  Obj.strokeUniform = true;
  Obj.borderOpacityWhenMoving = 0.92;
  Obj.padding = 2;

  const Text = fabric.IText.prototype;
  Text.fontFamily = FONT_STACK;
  Text.fontWeight = "600";
  Text.fontSize = 18;
  Text.charSpacing = -18;
  Text.lineHeight = 1.22;
  Text.fill = primary;

  try {
    if (fabric.ActiveSelection?.prototype) {
      const AS = fabric.ActiveSelection.prototype;
      AS.borderColor = primary;
      AS.borderDashArray = [5, 4];
      AS.cornerColor = surfaceContainer;
      AS.cornerStrokeColor = primary;
      AS.transparentCorners = false;
    }
  } catch {
    /* ignore */
  }
}

export function configureCanvasChrome(canvas) {
  if (!canvas) return;
  canvas.selectionColor = "rgba(115, 255, 227, 0.1)";
  canvas.selectionBorderColor = DS.primary;
  canvas.selectionLineWidth = 1;
}

export function getDefaultTextOptions(color) {
  return {
    fontFamily: FONT_STACK,
    fontWeight: "600",
    fontSize: 18,
    charSpacing: -18,
    lineHeight: 1.22,
    fill: color || DS.primary,
  };
}

export function getShapeStrokeOptions(color) {
  return {
    fill: "transparent",
    stroke: color || DS.primary,
    strokeWidth: 1.5,
    strokeUniform: true,
    strokeLineCap: "round",
    strokeLineJoin: "round",
  };
}
