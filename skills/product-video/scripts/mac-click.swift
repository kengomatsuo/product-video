// mclick x y : a real left click at screen point x,y, in global top-left coordinates
import CoreGraphics
let a = CommandLine.arguments, p = CGPoint(x: Double(a[1])!, y: Double(a[2])!)
let seq: [(CGEventType, Double)] = a.count > 3 ? [(.mouseMoved, 0)] : [(.mouseMoved, 0.15), (.leftMouseDown, 0.06), (.leftMouseUp, 0)]
for (t, b) in seq {
  let e = CGEvent(mouseEventSource: nil, mouseType: t, mouseCursorPosition: p, mouseButton: .left)!
  e.setIntegerValueField(.mouseEventClickState, value: 1)
  e.post(tap: .cghidEventTap)
  usleep(UInt32(b * 1_000_000))
}
