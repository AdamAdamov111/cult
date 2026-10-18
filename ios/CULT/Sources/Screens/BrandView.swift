import SwiftUI

struct BrandView: View {
    let brandId: String
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router
    @Environment(\.openURL) private var openURL

    @State private var sort = "default"

    private var sorts: [SimpleChip] {
        [.init(id: "default", title: "По умолчанию"),
         .init(id: "cheap", title: "Сначала дешевле"),
         .init(id: "rich", title: "Сначала дороже")]
    }

    var body: some View {
        if let brand = Catalog.brand(brandId) {
            let items = Catalog.products(brand: brand.title)
            let sorted = sort == "cheap" ? items.sorted { $0.club < $1.club }
                       : sort == "rich"  ? items.sorted { $0.club > $1.club }
                       : items
            let maxSaving = items.map(\.saving).max() ?? 0

            ScrollView {
                LazyVStack(spacing: 0) {
                    hero(brand, count: items.count)
                    BrandRow(active: brand.id).padding(.top, 18)

                    Note(text: "Клубная цена бренда — минус \(brand.discountPercent)% от розницы. "
                         + "Максимальная выгода на одной позиции — \(Money.string(maxSaving)).")
                        .padding(.horizontal, Metrics.pad)
                        .padding(.top, 18)

                    Chips(items: sorts, title: \.title, selection: $sort)
                        .padding(.top, 18)

                    LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)],
                              alignment: .leading, spacing: 20) {
                        ForEach(sorted) { ProductCard(product: $0) }
                    }
                    .padding(.horizontal, Metrics.pad)
                    .padding(.top, 18)

                    if !state.isMember {
                        BigButton(title: "Открыть цены \(brand.title)", icon: "crown.fill", kind: .gold) {
                            router.go(.join)
                        }
                        .padding(.horizontal, Metrics.pad).padding(.top, 22)
                    }

                    BigButton(title: "Сайт бренда", icon: "arrow.up.right", kind: .ghost) {
                        if let url = URL(string: brand.site) { openURL(url) }
                    }
                    .padding(.horizontal, Metrics.pad).padding(.top, 10)
                }
                .padding(.bottom, 28)
            }
            .background(Palette.bg)
            .navigationTitle(brand.title)
            .navigationBarTitleDisplayMode(.inline)
        } else {
            EmptyStateView(icon: "questionmark", title: "Бренд не найден")
        }
    }

    private func hero(_ brand: Brand, count: Int) -> some View {
        ZStack(alignment: .topTrailing) {
            LinearGradient(colors: [Color(UIColor(hex: 0x0A0A0A)), Color(UIColor(hex: 0x272320))],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Circle()
                .fill(RadialGradient(colors: [Palette.gold.opacity(0.32), .clear],
                                     center: .center, startRadius: 0, endRadius: 130))
                .frame(width: 260, height: 260)
                .offset(x: 80, y: -110)

            VStack(alignment: .leading, spacing: 0) {
                Text(brand.title)
                    .font(Typo.bold(26)).tracking(3)
                    .foregroundStyle(.white)
                Eyebrow(text: "\(brand.country) · \(count) позиций", color: Palette.gold)
                    .padding(.top, 10)
                Text(brand.about)
                    .font(.system(size: 13))
                    .foregroundStyle(.white.opacity(0.85))
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, 13)
                Text("−\(brand.discountPercent)% для членов клуба")
                    .font(Typo.bold(12))
                    .foregroundStyle(.black)
                    .padding(.horizontal, 13).frame(height: 29)
                    .background(.white, in: Capsule())
                    .padding(.top, 15)
            }
            .padding(Metrics.pad)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .clipped()
    }
}
