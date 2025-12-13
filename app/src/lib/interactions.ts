/**
 * Interaction utilities for gesture detection and haptic feedback
 * Provides cross-browser support for swipe gestures and device haptics
 */

export interface SwipeEvent {
  direction: "left" | "right" | "up" | "down";
  distance: number;
  velocity: number;
}

const SWIPE_THRESHOLD = 50; // pixels
const SWIPE_TIME_THRESHOLD = 500; // milliseconds

interface TouchStart {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Setup swipe gesture detection on an element
 */
export function setupSwipeDetection(
  element: HTMLElement,
  callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  }
): () => void {
  let touchStart: TouchStart | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      timestamp: Date.now(),
    };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      timestamp: Date.now(),
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.timestamp - touchStart.timestamp;

    // Only process if swipe is within time threshold
    if (deltaTime > SWIPE_TIME_THRESHOLD) {
      touchStart = null;
      return;
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if swipe is horizontal or vertical
    if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        callbacks.onSwipeLeft?.();
      } else {
        callbacks.onSwipeRight?.();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > SWIPE_THRESHOLD) {
      if (deltaY < 0) {
        callbacks.onSwipeUp?.();
      } else {
        callbacks.onSwipeDown?.();
      }
    }

    touchStart = null;
  };

  element.addEventListener("touchstart", handleTouchStart, false);
  element.addEventListener("touchend", handleTouchEnd, false);

  // Return cleanup function
  return () => {
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchend", handleTouchEnd);
  };
}

/**
 * Trigger haptic feedback if available
 * Supports vibration API and iOS Webkit haptics
 */
export function triggerHaptic(
  pattern: "light" | "medium" | "heavy" | "success" | "error"
): void {
  // Standard Vibration API
  if ("vibrate" in navigator) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 20, 10],
      error: [30, 10, 30],
    };
    navigator.vibrate(patterns[pattern] ?? 20);
  }

  // iOS Webkit haptic feedback (Safari iOS 13+)
  const webkitMessenger = (
    window as Window & {
      webkit?: {
        messageHandlers?: {
          triggerHaptic?: { postMessage: (msg: unknown) => void };
        };
      };
    }
  ).webkit?.messageHandlers?.triggerHaptic;
  if (webkitMessenger) {
    webkitMessenger.postMessage({
      type: pattern,
    });
  }
}

/**
 * Provide visual feedback for button press (scale animation)
 */
export function createButtonPressAnimation(element: HTMLElement): void {
  const originalTransform = element.style.transform || "";
  element.style.transform = "scale(0.95)";
  element.style.transition = "transform 0.1s ease-out";

  setTimeout(() => {
    element.style.transform = originalTransform || "scale(1)";
  }, 100);
}

/**
 * Check if device supports haptic feedback
 */
export function supportsHaptic(): boolean {
  const webkitMessenger = (window as Window & { webkit?: unknown }).webkit;
  return (
    "vibrate" in navigator ||
    (typeof window !== "undefined" && !!webkitMessenger)
  );
}

/**
 * Get touch point from mouse or touch event
 */
export function getTouchPoint(
  event: MouseEvent | TouchEvent
): { x: number; y: number } | null {
  if (event instanceof TouchEvent && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  } else if (event instanceof MouseEvent) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
  return null;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
