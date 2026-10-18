import SwiftUI

struct CatalogView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    @State private var query = ""
    @State private var mode = "cosmetics"
    @State private var category = "all"

    private var modes: [SimpleChip] {
        [.init(id: "cosmetics", title: "Косметика"), .init(id: "offers", title: "Партнёры")]
    }

    private var searching: Bool { query.trimmingCharacters(in: .whitespaces).count >= 2 }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if searching {
                    searchResults
                } else {
                    Chips(items: modes, title: \.title, selection: $mode)
                        .padding(.top, 12)

                    if mode == "cosmetics" {
                        VStack(spacing: 0) {
                            SectionHeader(title: "Бренды клуба")
                            BrandRow()
                        }
                        .padding(.top, 22)

                        Chips(items: Catalog.categories, title: \.title, selection: $category)
                            .padding(.top, 18)

                        LazyVGrid(columns: grid, alignment: .leading, spacing: 20) {
                            ForEach(Catalog.products(category: category)) { ProductCard(product: $0) }
                        }
                        .padding(.horizontal, Metrics.pad)
                        .padding(.top, 18)
                    } else {
                        VStack(spacing: 10) {
                            ForEach(Catalog.sections.filter { !$0.isShop }) { SectionBannerView(section: $0) }
                        }
                        .padding(.horizontal, Metrics.pad)
                        .padding(.top, 18)

                        VStack(spacing: 0) {
                            SectionHeader(title: "Все предложения")
                            VStack(spacing: 12) {
                                ForEach(Catalog.offers) { OfferCard(offer: $0) }
                            }
                            .padding(.horizontal, Metrics.pad)
                        }
                        .padding(.top, 28)
                    }
                }
            }
            .padding(.bottom, 28)
        }
        .background(Palette.bg)
        .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always),
                    prompt: "Поиск по клубу")
    }

    private var grid: [GridItem] {
        [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)]
    }

    @ViewBuilder private var searchResults: some View {
        let found = Catalog.search(query)
        if found.products.isEmpty && found.offers.isEmpty {
            EmptyStateView(icon: "magnifyingglass", title: "Ничего не нашлось",
                           text: "Попробуйте «крем», «сыворотка», «ампулы», «чекап» или «спорт».")
        } else {
            if !found.products.isEmpty {
                SectionHeader(title: "Товары · \(found.products.count)")
                LazyVGrid(columns: grid, alignment: .leading, spacing: 20) {
                    ForEach(found.products) { ProductCard(product: $0) }
                }
                .padding(.horizontal, Metrics.pad)
            }
            if !found.offers.isEmpty {
                SectionHeader(title: "Предложения · \(found.offers.count)")
                    .padding(.top, 28)
                VStack(spacing: 12) {
                    ForEach(found.offers) { OfferCard(offer: $0) }
                }
                .padding(.horizontal, Metrics.pad)
            }
        }
    }
}
