import SwiftUI
import UIKit

/// Загрузка картинок из бандла с кэшем и декодированием вне главного потока.
/// Пути в контенте вида «img/sec-health.jpg» → Images/sec-health.jpg.
actor ImageStore {
    static let shared = ImageStore()
    private let cache = NSCache<NSString, UIImage>()

    init() { cache.countLimit = 160 }

    func image(_ path: String) -> UIImage? {
        guard !path.isEmpty else { return nil }
        let key = path as NSString
        if let hit = cache.object(forKey: key) { return hit }
        guard let url = Self.url(for: path),
              let data = try? Data(contentsOf: url),
              let image = UIImage(data: data) else { return nil }
        cache.setObject(image, forKey: key)
        return image
    }

    nonisolated static func url(for path: String) -> URL? {
        guard let base = Bundle.main.resourceURL else { return nil }
        let relative = path.hasPrefix("img/") ? String(path.dropFirst(4)) : path
        let url = base.appendingPathComponent("Images").appendingPathComponent(relative)
        return FileManager.default.fileExists(atPath: url.path) ? url : nil
    }
}

/// Картинка из бандла: мягкое появление, подложка на время загрузки.
struct BundleImage: View {
    let path: String
    var mode: ContentMode = .fill

    @State private var image: UIImage?

    var body: some View {
        ZStack {
            Palette.surface3
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: mode)
                    .transition(.opacity)
            }
        }
        .clipped()
        .task(id: path) {
            if let loaded = await ImageStore.shared.image(path) {
                withAnimation(.easeOut(duration: 0.22)) { image = loaded }
            } else {
                image = nil
            }
        }
    }
}
