import SwiftUI
import CoreImage.CIFilterBuiltins

/// QR-код средствами системы — без сторонних библиотек и сетевых запросов.
struct QRView: View {
    let value: String
    var size: CGFloat = 150

    var body: some View {
        Group {
            if let image = Self.generate(value) {
                Image(uiImage: image)
                    .interpolation(.none)
                    .resizable()
            } else {
                Rectangle().fill(.white)
            }
        }
        .frame(width: size, height: size)
        .padding(9)
        .background(.white, in: RoundedRectangle(cornerRadius: 8))
    }

    private static func generate(_ string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"
        guard let output = filter.outputImage else { return nil }
        let scaled = output.transformed(by: CGAffineTransform(scaleX: 10, y: 10))
        guard let cg = context.createCGImage(scaled, from: scaled.extent) else { return nil }
        return UIImage(cgImage: cg)
    }
}
