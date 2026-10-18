import SwiftUI

/// Карусель на главной: места под партнёров, автопрокрутка до первого касания.
struct BannerCarousel: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router
    @Environment(\.openURL) private var openURL

    @State private var index = 0
    @State private var touched = false

    private var banners: [Banner] {
        // члену клуба не показываем приглашение вступить
        Catalog.banners.filter { banner in
            if case .join = banner.target, state.isMember { return false }
            return true
        }
    }

    var body: some View {
        VStack(spacing: 11) {
            GeometryReader { geo in
                let w = geo.size.width
                TabView(selection: $index) {
                    ForEach(Array(banners.enumerated()), id: \.element.id) { i, banner in
                        card(banner)
                            .frame(width: w, height: geo.size.height)
                            .clipped()
                            .tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .frame(height: bannerHeight)
            .padding(.horizontal, Metrics.pad)

            HStack(spacing: 5) {
                ForEach(banners.indices, id: \.self) { i in
                    Capsule()
                        .fill(i == index ? Palette.ink : Palette.line)
                        .frame(width: i == index ? 16 : 5, height: 5)
                        .animation(.snappy(duration: 0.25), value: index)
                }
            }
        }
        .simultaneousGesture(DragGesture().onChanged { _ in touched = true })
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(5.2))
                guard !touched, !banners.isEmpty else { continue }
                withAnimation(.easeInOut(duration: 0.5)) {
                    index = (index + 1) % banners.count
                }
            }
        }
    }

    /// Высота плашки считается от ширины экрана — содержимое гарантированно помещается.
    private var bannerHeight: CGFloat {
        let width = UIScreen.main.bounds.width - Metrics.pad * 2
        return width / (328.0 / 192.0)
    }

    private func card(_ banner: Banner) -> some View {
        Button {
            Haptics.tap()
            router.go(banner.target) { openURL($0) }
        } label: {
            ZStack(alignment: .bottomLeading) {
                if banner.isContain {
                    LinearGradient(colors: [Color(UIColor(hex: 0x0A0A0A)), Color(UIColor(hex: 0x26211B))],
                                   startPoint: .topLeading, endPoint: .bottomTrailing)
                    GeometryReader { geo in
                        BundleImage(path: banner.image, mode: .fit)
                            .frame(width: geo.size.width * 0.52, height: geo.size.height)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                    }
                    LinearGradient(
                        stops: [.init(color: .black, location: 0),
                                .init(color: .black.opacity(0.9), location: 0.4),
                                .init(color: .black.opacity(0.1), location: 0.78),
                                .init(color: .clear, location: 1)],
                        startPoint: .leading, endPoint: .trailing)
                } else {
                    BundleImage(path: banner.image)
                    LinearGradient(
                        stops: [.init(color: .black.opacity(0.86), location: 0.02),
                                .init(color: .black.opacity(0.42), location: 0.52),
                                .init(color: .black.opacity(0.12), location: 1)],
                        startPoint: .bottom, endPoint: .top)
                }

                VStack(alignment: .leading, spacing: 5) {
                    Eyebrow(text: banner.eyebrow, color: Palette.gold)
                    Text(banner.title)
                        .font(Typo.semi(18)).tracking(-0.3)
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(banner.sub)
                        .font(.system(size: 11.5))
                        .foregroundStyle(.white.opacity(0.88))
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    Text(banner.cta)
                        .font(Typo.bold(11.5))
                        .foregroundStyle(.black)
                        .padding(.horizontal, 13).frame(height: 29)
                        .background(.white, in: Capsule())
                        .padding(.top, 7)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)

                if banner.sponsored == true {
                    Text("ПАРТНЁР")
                        .font(.system(size: 8, weight: .semibold))
                        .tracking(1)
                        .foregroundStyle(.white.opacity(0.7))
                        .padding(.horizontal, 5).padding(.vertical, 2)
                        .overlay(RoundedRectangle(cornerRadius: 3)
                            .strokeBorder(.white.opacity(0.35), lineWidth: 1))
                        .padding(9)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous))
        }
        .buttonStyle(PressStyle())
    }
}
