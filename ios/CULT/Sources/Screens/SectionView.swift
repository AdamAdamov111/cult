import SwiftUI

struct SectionView: View {
    let sectionId: String
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    @State private var category = "all"
    @State private var partner = "all"

    private var section: SectionDef? { Catalog.section(sectionId) }

    var body: some View {
        if let section {
            ScrollView {
                LazyVStack(spacing: 0) {
                    header(section)

                    if section.isShop {
                        shop
                    } else {
                        partners(section)
                    }
                }
                .padding(.bottom, 28)
            }
            .background(Palette.bg)
            .navigationTitle(section.title)
            .navigationBarTitleDisplayMode(.inline)
        } else {
            EmptyStateView(icon: "questionmark", title: "Раздел не найден")
        }
    }

    private func header(_ s: SectionDef) -> some View {
        ZStack(alignment: .bottomLeading) {
            BundleImage(path: s.image)
                .aspectRatio(s.aspect, contentMode: .fill)
            LinearGradient(
                stops: [.init(color: .black.opacity(0.88), location: 0.04),
                        .init(color: .black.opacity(0.48), location: 0.46),
                        .init(color: .black.opacity(0.08), location: 0.84)],
                startPoint: .bottom, endPoint: .top)
            VStack(alignment: .leading, spacing: 4) {
                Eyebrow(text: s.kicker, color: Palette.gold)
                Text(s.title).font(Typo.bold(28)).tracking(0.5).foregroundStyle(.white)
                Text(s.sub).font(.system(size: 12.5)).foregroundStyle(.white.opacity(0.9))
            }
            .padding(Metrics.pad)
        }
    }

    @ViewBuilder private var shop: some View {
        VStack(spacing: 0) {
            SectionHeader(title: "Бренды клуба")
            BrandRow()
        }
        .padding(.top, 22)

        Chips(items: Catalog.categories, title: \.title, selection: $category)
            .padding(.top, 18)

        LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)],
                  alignment: .leading, spacing: 20) {
            ForEach(Catalog.products(category: category)) { ProductCard(product: $0) }
        }
        .padding(.horizontal, Metrics.pad)
        .padding(.top, 18)

        if !state.isMember {
            BigButton(title: "Открыть клубные цены", icon: "crown.fill", kind: .gold) {
                router.go(.join)
            }
            .padding(.horizontal, Metrics.pad)
            .padding(.top, 22)
        }
    }

    @ViewBuilder private func partners(_ s: SectionDef) -> some View {
        let all = Catalog.offers(section: s.id)
        let brands = Catalog.partners(section: s.id)
        let shown = partner == "all" ? all : all.filter { $0.brand == partner }
        let value = all.reduce(0) { $0 + ($1.value ?? 0) }

        if brands.count > 1 {
            Chips(items: [SimpleChip(id: "all", title: "Все партнёры")]
                    + brands.map { SimpleChip(id: $0, title: $0) },
                  title: \.title, selection: $partner)
                .padding(.top, 18)
        }

        Note(text: "\(all.count) предложений в разделе · выгода до \(Money.string(value)). "
             + (state.isMember ? "Промокод выдаётся внутри карточки." : "Доступ — после вступления в клуб."))
            .padding(.horizontal, Metrics.pad)
            .padding(.top, 18)

        VStack(spacing: 12) {
            ForEach(shown) { OfferCard(offer: $0) }
        }
        .padding(.horizontal, Metrics.pad)
        .padding(.top, 14)

        if !state.isMember {
            BigButton(title: "Вступить и забрать", icon: "lock.open.fill", kind: .gold) {
                router.go(.join)
            }
            .padding(.horizontal, Metrics.pad)
            .padding(.top, 22)
        }
    }
}
