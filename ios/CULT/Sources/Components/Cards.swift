import SwiftUI

// MARK: - Карточка товара

struct ProductCard: View {
    let product: Product
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                router.go(.product(product.id))
            } label: {
                ZStack(alignment: .topLeading) {
                    BundleImage(path: product.cover, mode: .fit)
                        .aspectRatio(1, contentMode: .fill)
                        .background(Palette.surface2)
                        .clipShape(RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))

                    HStack(spacing: 4) {
                        if product.hit == true {
                            Tag(text: "ХИТ", bg: Palette.ink, fg: Palette.onInk)
                        }
                        if !product.isOnSale {
                            Tag(text: "СКОРО", bg: Palette.surface3, fg: Palette.muted)
                        }
                    }
                    .padding(7)
                }
            }
            .buttonStyle(PressStyle())
            .overlay(alignment: .topTrailing) {
                Button {
                    state.toggleFavorite(product.id)
                } label: {
                    Image(systemName: state.isFavorite(product.id) ? "heart.fill" : "heart")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(state.isFavorite(product.id) ? Palette.sale : Palette.ink2)
                        .frame(width: 32, height: 32)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }

            Button {
                router.go(.product(product.id))
            } label: {
                VStack(alignment: .leading, spacing: 3) {
                    Text(product.title)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Palette.ink)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                        .frame(height: 32, alignment: .top)
                    if !product.volume.isEmpty {
                        Text(product.volume).font(.system(size: 10)).foregroundStyle(Palette.faint)
                    }
                    PriceView(club: product.club, rrp: product.rrp, size: .small,
                              isMember: state.isMember) { router.go(.join) }
                        .padding(.top, 3)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .buttonStyle(.plain)
            .padding(.top, 9)

            if product.isOnSale {
                cta.padding(.top, 9)
            }
        }
    }

    @ViewBuilder private var cta: some View {
        if state.isMember {
            let inCart = state.qty(product.id)
            Button {
                state.add(product.id)
            } label: {
                Text(inCart > 0 ? "В корзине · \(inCart)" : "В корзину")
                    .font(Typo.semi(13))
                    .frame(maxWidth: .infinity, minHeight: 38)
                    .foregroundStyle(inCart > 0 ? Palette.ink : Palette.onInk)
                    .background(inCart > 0 ? Palette.surface : Palette.ink,
                                in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(inCart > 0 ? Palette.line : .clear, lineWidth: 1))
            }
            .buttonStyle(PressStyle())
        } else {
            Button {
                router.go(.join)
            } label: {
                Text("Вступить · −\(product.discountPercent)%")
                    .font(Typo.semi(13))
                    .frame(maxWidth: .infinity, minHeight: 38)
                    .foregroundStyle(Palette.goldInk)
                    .background(Palette.goldWash, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(Palette.gold.opacity(0.58), lineWidth: 1))
            }
            .buttonStyle(PressStyle())
        }
    }
}

struct Tag: View {
    let text: String
    var bg: Color
    var fg: Color
    var body: some View {
        Text(text)
            .font(Typo.bold(10)).tracking(0.3)
            .foregroundStyle(fg)
            .padding(.horizontal, 6).padding(.vertical, 4)
            .background(bg, in: RoundedRectangle(cornerRadius: 5))
    }
}

// MARK: - Карточка предложения партнёра

struct OfferCard: View {
    let offer: Offer
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    var body: some View {
        Button {
            router.go(.offer(offer.id))
        } label: {
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .topLeading) {
                    BundleImage(path: offer.image)
                        .aspectRatio(16.0 / 9.0, contentMode: .fill)
                    HStack {
                        Text(offer.deal)
                            .font(Typo.bold(11))
                            .foregroundStyle(Palette.onInk)
                            .padding(.horizontal, 9).frame(height: 24)
                            .background(Palette.ink, in: RoundedRectangle(cornerRadius: 6))
                        Spacer()
                        if !state.isMember {
                            Image(systemName: "lock.fill")
                                .font(.system(size: 11))
                                .foregroundStyle(.white)
                                .frame(width: 26, height: 26)
                                .background(.black.opacity(0.55), in: Circle())
                        }
                    }
                    .padding(9)
                }
                .clipped()

                VStack(alignment: .leading, spacing: 4) {
                    Eyebrow(text: offer.brand)
                    Text(offer.title)
                        .font(Typo.semi(14.5))
                        .foregroundStyle(Palette.ink)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    HStack(spacing: 10) {
                        Label(offer.city, systemImage: "mappin.and.ellipse")
                        Label(offer.valid, systemImage: "clock")
                    }
                    .font(.system(size: 11))
                    .foregroundStyle(Palette.faint)
                    .lineLimit(1)
                    .padding(.top, 4)
                }
                .padding(.horizontal, 13)
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Palette.surface)
            .clipShape(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous)
                .strokeBorder(Palette.line, lineWidth: 1))
        }
        .buttonStyle(PressStyle())
    }
}

// MARK: - Баннер раздела

struct SectionBannerView: View {
    let section: SectionDef
    @Environment(Router.self) private var router

    var body: some View {
        Button {
            router.go(.section(section.id))
        } label: {
            ZStack(alignment: .bottomLeading) {
                BundleImage(path: section.image)
                    .aspectRatio(section.aspect, contentMode: .fill)

                LinearGradient(
                    stops: [
                        .init(color: .black.opacity(0.86), location: 0.04),
                        .init(color: .black.opacity(0.46), location: 0.44),
                        .init(color: .black.opacity(0.06), location: 0.82),
                    ],
                    startPoint: .bottom, endPoint: .top
                )

                VStack(alignment: .leading, spacing: 3) {
                    Eyebrow(text: section.kicker, color: Palette.gold)
                    Text(section.title)
                        .font(Typo.bold(24)).tracking(0.5)
                        .foregroundStyle(.white)
                    Text(section.sub)
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.9))
                }
                .padding(18)

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 34, height: 34)
                    .background(.ultraThinMaterial, in: Circle())
                    .environment(\.colorScheme, .dark)
                    .padding(16)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
            }
            .clipShape(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous))
        }
        .buttonStyle(PressStyle())
    }
}

// MARK: - Бренды

struct BrandRow: View {
    var active: String?
    @Environment(Router.self) private var router

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(Catalog.brands) { brand in
                    Button {
                        router.go(.brand(brand.id))
                    } label: {
                        VStack(alignment: .leading, spacing: 0) {
                            Text(brand.title)
                                .font(Typo.bold(11.5)).tracking(0.6)
                                .foregroundStyle(Palette.ink)
                                .lineLimit(2)
                                .multilineTextAlignment(.leading)
                            Spacer(minLength: 4)
                            HStack(spacing: 4) {
                                Text("−\(brand.discountPercent)%")
                                    .font(Typo.bold(10)).monospacedDigit()
                                    .foregroundStyle(Palette.goldInk)
                                Text("· \(brand.count)")
                                    .font(.system(size: 9.5))
                                    .foregroundStyle(Palette.faint)
                            }
                        }
                        .padding(.horizontal, 11).padding(.vertical, 10)
                        .frame(width: 118, height: 64, alignment: .leading)
                        .background(active == brand.id ? Palette.surface2 : Palette.surface,
                                    in: RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous)
                            .strokeBorder(active == brand.id ? Palette.ink : Palette.line, lineWidth: 1))
                    }
                    .buttonStyle(PressStyle())
                }
            }
            .padding(.horizontal, Metrics.pad)
        }
        .scrollClipDisabled()
    }
}
