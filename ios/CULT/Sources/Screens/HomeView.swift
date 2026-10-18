import SwiftUI

struct HomeView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router
    @Environment(\.openURL) private var openURL

    @State private var storyIndex: Int?

    private var featured: [Offer] {
        ["tr-maldives", "sp-wc-year", "bt-omny-smas", "hl-mayr-detox", "hl-jar-parenie", "sp-padel-court"]
            .compactMap { Catalog.offer($0) }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0, pinnedViews: []) {
                BannerCarousel().padding(.top, 8)

                StoriesRow { storyIndex = $0 }
                    .padding(.top, 18)

                membershipStrip.padding(.horizontal, Metrics.pad).padding(.top, 18)

                block(title: "Хиты клуба", link: "Весь каталог") {
                    router.switchTo(.catalog)
                } content: {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(alignment: .top, spacing: 10) {
                            ForEach(Catalog.hits) { ProductCard(product: $0).frame(width: 154) }
                        }
                        .padding(.horizontal, Metrics.pad)
                    }
                    .scrollClipDisabled()
                }

                block(title: "Пять сфер клуба") {
                    VStack(spacing: 10) {
                        ForEach(Catalog.sections) { SectionBannerView(section: $0) }
                    }
                    .padding(.horizontal, Metrics.pad)

                    Note(text: "Суммарная выгода по действующим предложениям партнёров — "
                         + "до \(Money.string(Catalog.totalOfferValue)) в год. "
                         + "Доступ открывается сразу после оплаты членства.")
                        .padding(.horizontal, Metrics.pad)
                        .padding(.top, 12)
                }

                block(title: "Сейчас в клубе") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(alignment: .top, spacing: 10) {
                            ForEach(featured) { OfferCard(offer: $0).frame(width: 268) }
                        }
                        .padding(.horizontal, Metrics.pad)
                    }
                    .scrollClipDisabled()
                }

                block(title: "Бренды клуба", link: "Все бренды") {
                    router.go(.section("cosmetics"))
                } content: {
                    BrandRow()
                }

                block(title: "Косметика BYRAIN", link: "Все товары") {
                    router.go(.section("cosmetics"))
                } content: {
                    LazyVGrid(columns: [GridItem(.flexible(), spacing: 10),
                                        GridItem(.flexible(), spacing: 10)],
                              alignment: .leading, spacing: 20) {
                        ForEach(Catalog.products(brand: "BYRAIN").prefix(8)) { ProductCard(product: $0) }
                    }
                    .padding(.horizontal, Metrics.pad)
                }

                footer
            }
            .padding(.bottom, 28)
        }
        .background(Palette.bg)
        .fullScreenCover(item: Binding(
            get: { storyIndex.map { StoryStart(index: $0) } },
            set: { storyIndex = $0?.index }
        )) { start in
            StoriesViewer(storyIndex: start.index) { target in
                router.go(target) { openURL($0) }
            }
        }
    }

    private struct StoryStart: Identifiable { let index: Int; var id: Int { index } }

    @ViewBuilder private var membershipStrip: some View {
        if state.isMember {
            SavingStrip {
                VStack(alignment: .leading, spacing: 2) {
                    if state.savedTotal > 0 {
                        Text("Сэкономлено в клубе")
                            .font(.system(size: 11)).foregroundStyle(Palette.goldInk)
                        Text(Money.string(state.savedTotal))
                            .font(Typo.bold(16)).monospacedDigit()
                            .foregroundStyle(Palette.goldInk)
                    } else {
                        Text("Клубные цены открыты")
                            .font(Typo.semi(15)).foregroundStyle(Palette.goldInk)
                        Text("Минус 50% на весь каталог BYRAIN и доступ ко всем предложениям партнёров")
                            .font(.system(size: 11)).foregroundStyle(Palette.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
        } else {
            Button { router.go(.join) } label: {
                SavingStrip(icon: "crown") {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Членство \(Money.string(Catalog.membershipPrice)) в месяц")
                            .font(Typo.semi(15)).foregroundStyle(Palette.goldInk)
                        Text("Вся косметика −50%, доступ к \(Catalog.offers.count) предложениям партнёров")
                            .font(.system(size: 11)).foregroundStyle(Palette.muted)
                            .multilineTextAlignment(.leading)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .overlay(alignment: .trailing) {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Palette.gold)
                        .padding(.trailing, 14)
                }
            }
            .buttonStyle(PressStyle())
        }
    }

    private var footer: some View {
        VStack(spacing: 7) {
            Text("CULT")
                .font(Typo.bold(13)).tracking(5)
                .foregroundStyle(Palette.faint)
            Text("Закрытый клуб BYRAIN · Швейцария")
                .font(.system(size: 11)).foregroundStyle(Palette.muted)
        }
        .padding(.top, 34)
    }

    @ViewBuilder
    private func block<C: View>(title: String, link: String? = nil,
                                action: (() -> Void)? = nil,
                                @ViewBuilder content: () -> C) -> some View {
        VStack(spacing: 0) {
            SectionHeader(title: title, link: link, action: action)
            content()
        }
        .padding(.top, 28)
    }
}
