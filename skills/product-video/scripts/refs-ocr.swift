// On-screen text of each image, via macOS Vision. Prints: file<TAB>line
import Foundation
import Vision
import AppKit

for path in CommandLine.arguments.dropFirst() {
    guard let img = NSImage(contentsOfFile: path),
          let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { continue }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.usesLanguageCorrection = true
    try? VNImageRequestHandler(cgImage: cg).perform([req])
    let h = Double(cg.height)
    for obs in req.results ?? [] {
        guard let top = obs.topCandidates(1).first, top.confidence > 0.5 else { continue }
        // box height as a share of the image: big type is headline copy
        let size = obs.boundingBox.height
        print("\(path)\t\(String(format: "%.3f", size))\t\(Int(h))\t\(top.string)")
    }
}
