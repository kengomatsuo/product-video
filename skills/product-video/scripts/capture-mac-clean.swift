// Records one Safari window with the cursor left out, and logs pointer position and button state beside it.
//   macrec <out.mov> <seconds> [title-substring]
import AppKit
import AVFoundation
import ScreenCaptureKit

final class Rec: NSObject, SCStreamOutput {
  let writer: AVAssetWriter; let input: AVAssetWriterInput; var started = false
  var first: Double? = nil
  init(url: URL, w: Int, h: Int) throws {
    writer = try AVAssetWriter(outputURL: url, fileType: .mov)
    input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: w, AVVideoHeightKey: h,
      AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 40_000_000]])
    input.expectsMediaDataInRealTime = true; writer.add(input)
  }
  func stream(_ s: SCStream, didOutputSampleBuffer b: CMSampleBuffer, of t: SCStreamOutputType) {
    guard t == .screen, b.isValid,
      let a = CMSampleBufferGetSampleAttachmentsArray(b, createIfNecessary: false) as? [[SCStreamFrameInfo: Any]],
      let raw = a.first?[.status] as? Int, SCFrameStatus(rawValue: raw) == .complete else { return }
    let pts = CMSampleBufferGetPresentationTimeStamp(b)
    if !started { started = true; first = pts.seconds; writer.startWriting(); writer.startSession(atSourceTime: pts) }
    if input.isReadyForMoreMediaData { input.append(b) }
  }
}

@main struct M { static func main() async throws {
_ = NSApplication.shared
let a = CommandLine.arguments
let out = a[1], secs = Double(a[2])!, want = a.count > 3 ? a[3] : "Night Harbor"
let c = try await SCShareableContent.excludingDesktopWindows(true, onScreenWindowsOnly: true)
guard let win = c.windows.first(where: { $0.owningApplication?.applicationName == (ProcessInfo.processInfo.environment["MACREC_APP"] ?? "Safari") && $0.windowLayer == 0 && $0.frame.width > 400 && (want.isEmpty || ($0.title ?? "").contains(want)) }) else { print("no window titled \(want)"); exit(1) }
let w = Int(win.frame.width * 2), h = Int(win.frame.height * 2)
let cfg = SCStreamConfiguration()
cfg.width = w; cfg.height = h; cfg.minimumFrameInterval = CMTime(value: 1, timescale: 60); cfg.showsCursor = false; cfg.queueDepth = 8; cfg.pixelFormat = kCVPixelFormatType_32BGRA
let rec = try Rec(url: URL(fileURLWithPath: out), w: w, h: h)
// the whole display, cropped to the window, so popovers and menus outside the window's own layer are kept
guard let disp = c.displays.first(where: { $0.frame.intersects(win.frame) }) else { print("no display"); exit(1) }
cfg.sourceRect = CGRect(x: win.frame.minX - disp.frame.minX, y: win.frame.minY - disp.frame.minY, width: win.frame.width, height: win.frame.height)
let st = SCStream(filter: SCContentFilter(display: disp, excludingApplications: [], exceptingWindows: []), configuration: cfg, delegate: nil)
try st.addStreamOutput(rec, type: .screen, sampleHandlerQueue: DispatchQueue(label: "rec"))
try await st.startCapture()
let primary = NSScreen.screens[0].frame.height
var log = ""
let t0 = CACurrentMediaTime()
while CACurrentMediaTime() - t0 < secs {
  let p = NSEvent.mouseLocation, now = CACurrentMediaTime()
  let x = (p.x - win.frame.minX) * 2, y = (primary - p.y - win.frame.minY) * 2
  log += "{\"t\":\(now - (rec.first ?? now)),\"x\":\(x),\"y\":\(y),\"down\":\(NSEvent.pressedMouseButtons & 1 == 1)}\n"
  try await Task.sleep(nanoseconds: 8_000_000)
}
try await st.stopCapture()
rec.input.markAsFinished(); await rec.writer.finishWriting()
try log.write(toFile: out + ".cursor.jsonl", atomically: true, encoding: .utf8)
print(w, h, rec.writer.status.rawValue, rec.writer.error?.localizedDescription ?? "ok")
}}
