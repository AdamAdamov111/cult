import SwiftUI

struct ProductView: View {
    let productId: String
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router
    @Environment(\.openURL) private var openURL

    @State private var qty = 1
    @State private var page = 0

    var body: some View {
        if let p = Catalog.product(productId) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    gallery(p)
                    head(p)
                    details(p)
                    related(p)
                }
                .padding(.bottom, 120)
            }
            .background(Palette.bg)
            .navigationTitle(p.title)
            .navigationBarTitleDisplayMode(.inline)
            .safeAreaInset(edge: .bottom) {
                if p.isOnSale { bottomBar(p) }
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        state.toggleFavorite(p.id)
                    } label: {
                        Image(systemName: state.isFavorite(p.id) ? "heart.fill" : "heart")
                            .foregroundStyle(state.isFavorite(p.id) ? Palette.sale : Palette.ink)
                    }
                }
            }
        } else {
            EmptyStateView(icon: "questionmark", title: "Товар не найден")
        }
    }

    private func gallery(_ p: Product) -> some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $page) {
                ForEach(Array(p.images.enumerated()), id: \.offset) { i, path in
                    BundleImage(path: path, mode: .fit)
                        .background(Palette.surface2)
                        .tag(i)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .aspectRatio(1, contentMode: .fit)

            if p.images.count > 1 {
                HStack(spacing: 5) {
                    ForEach(p.images.indices, id: \.self) { i in
                        Capsule()
                            .fill(i == page ? Palette.ink : Palette.line)
                            .frame(width: i == page ? 16 : 5, height: 5)
                    }
                }
                .padding(.bottom, 10)
                .animation(.snappy(duration: 0.25), value: page)
            }
        }
    }

    private func head(_ p: Product) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Eyebrow(text: p.volume.isEmpty ? p.brand : "\(p.brand) · \(p.volume)")
            Text(p.title)
                .font(Typo.semi(21)).tracking(-0.4)
                .foregroundStyle(Palette.ink)
                .padding(.top, 7)
            if !p.tagline.isEmpty {
                Text(p.tagline)
                    .font(.system(size: 13))
                    .foregroundStyle(Palette.muted)
                    .padding(.top, 7)
            }

            PriceView(club: p.club, rrp: p.rrp, size: .large, isMember: state.isMember) {
                router.go(.join)
            }
            .padding(.top, 15)

            if p.isOnSale && !state.isMember {
                SavingStrip(icon: "crown") {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Выгода на этом товаре")
                            .font(.system(size: 11)).foregroundStyle(Palette.goldInk)
                        Text(Money.string(p.saving))
                            .font(Typo.bold(16)).monospacedDigit()
                            .foregroundStyle(Palette.goldInk)
                    }
                }
                .padding(.top, 16)
            }

            if !p.isOnSale {
                Note(text: "Продукт готовится к выходу. Цена появится вместе со стартом продаж.")
                    .padding(.top, 14)
            }

            Label("Доставка курьером по Москве — 400 ₽, по России — СДЭК",
                  systemImage: "shippingbox")
                .font(.system(size: 12))
                .foregroundStyle(Palette.muted)
                .padding(.top, 16)
        }
        .padding(.horizontal, Metrics.pad)
        .padding(.top, 16)
    }

    @ViewBuilder private func details(_ p: Product) -> some View {
        VStack(spacing: 0) {
            if !p.desc.isEmpty {
                Accordion(label: "Описание", openByDefault: true) {
                    paragraphs(p.desc)
                }
            }
            if !p.effects.isEmpty {
                Accordion(label: "Эффекты") { bullets(p.effects) }
            }
            if !p.indications.isEmpty {
                Accordion(label: "Показания") { bullets(p.indications) }
            }
            if !p.usage.isEmpty {
                Accordion(label: "Способ применения") { paragraphs(p.usage) }
            }
            if !p.inci.isEmpty {
                Accordion(label: "Состав") {
                    Text(p.inci)
                        .font(.system(size: 10.5))
                        .foregroundStyle(Palette.muted)
                        .lineSpacing(3)
                }
            }
            if !p.collections.isEmpty {
                Accordion(label: "Коллекции и показания") {
                    FlowTags(items: p.collections.map { $0.components(separatedBy: " / ").first ?? $0 })
                }
            }
        }
        .padding(.horizontal, Metrics.pad)
        .padding(.top, 20)
    }

    private func paragraphs(_ text: String) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            ForEach(Array(text.components(separatedBy: "\n").filter { !$0.isEmpty }.enumerated()), id: \.offset) { _, line in
                Text(line)
                    .font(.system(size: 13))
                    .foregroundStyle(Palette.ink2)
                    .lineSpacing(3)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private func bullets(_ items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                HStack(alignment: .top, spacing: 9) {
                    Circle().fill(Palette.gold).frame(width: 4, height: 4).padding(.top, 7)
                    Text(item)
                        .font(.system(size: 12.5))
                        .foregroundStyle(Palette.ink2)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    @ViewBuilder private func related(_ p: Product) -> some View {
        VStack(spacing: 0) {
            SectionHeader(title: "С этим товаром покупают")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 10) {
                    ForEach(Catalog.onSale.filter { $0.id != p.id && $0.brand == p.brand }.prefix(6)) {
                        ProductCard(product: $0).frame(width: 150)
                    }
                }
                .padding(.horizontal, Metrics.pad)
            }
            .scrollClipDisabled()
        }
        .padding(.top, 28)
    }

    private func bottomBar(_ p: Product) -> some View {
        VStack(spacing: 0) {
            Divider()
            HStack(spacing: 12) {
                if state.isMember {
                    QtyStepper(value: $qty)
                    BigButton(title: "В корзину · \(Money.string(p.club * qty))") {
                        state.add(p.id, qty: qty)
                    }
                } else {
                    BigButton(title: "Вступить и купить за \(Money.string(p.club))", kind: .gold) {
                        router.go(.join)
                    }
                }
            }
            .padding(.horizontal, Metrics.pad)
            .padding(.vertical, 10)
        }
        .background(.bar)
    }
}

/// Теги в несколько строк — для коллекций товара.
struct FlowTags: View {
    let items: [String]
    var body: some View {
        FlexibleStack(spacing: 6) {
            ForEach(items, id: \.self) { item in
                Text(item)
                    .font(.system(size: 11.5))
                    .foregroundStyle(Palette.ink2)
                    .padding(.horizontal, 11).frame(height: 28)
                    .background(Palette.surface, in: Capsule())
                    .overlay(Capsule().strokeBorder(Palette.line, lineWidth: 1))
            }
        }
    }
}

struct FlexibleStack: Layout {
    var spacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 320
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > width, x > 0 {
                x = 0; y += rowHeight + spacing; rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: width, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, rowHeight: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX, x > bounds.minX {
                x = bounds.minX; y += rowHeight + spacing; rowHeight = 0
            }
            view.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
