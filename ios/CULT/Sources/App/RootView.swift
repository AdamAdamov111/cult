import SwiftUI

struct RootView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    var body: some View {
        @Bindable var router = router

        ZStack(alignment: .bottom) {
            TabView(selection: Binding(
                get: { router.tab },
                set: { router.switchTo($0) }
            )) {
                ForEach(Tab.allCases, id: \.self) { tab in
                    stack(for: tab)
                        .tabItem {
                            Label(tab.title, systemImage: router.tab == tab ? "\(tab.icon).fill" : tab.icon)
                        }
                        .badge(tab == .cart && state.cartCount > 0 ? state.cartCount : 0)
                        .tag(tab)
                }
            }

            if let toast = state.toast {
                ToastView(text: toast)
                    .padding(.bottom, 68)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .allowsHitTesting(false)
            }
        }
    }

    @ViewBuilder
    private func stack(for tab: Tab) -> some View {
        @Bindable var router = router

        NavigationStack(path: Binding(
            get: { router.paths[tab] ?? [] },
            set: { router.paths[tab] = $0 }
        )) {
            root(for: tab)
                .navigationTitle(tab == .home ? "" : tab.title)
                .navigationBarTitleDisplayMode(tab == .home ? .inline : .large)
                .toolbar { if tab == .home { homeToolbar } }
                .navigationDestination(for: Route.self) { destination($0) }
        }
    }

    @ViewBuilder
    private func root(for tab: Tab) -> some View {
        switch tab {
        case .home:    HomeView()
        case .catalog: CatalogView()
        case .cart:    CartView()
        case .profile: ProfileView()
        }
    }

    @ToolbarContentBuilder
    private var homeToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Text("CULT")
                .font(Typo.bold(16)).tracking(4)
                .foregroundStyle(Palette.ink)
                .fixedSize()
        }
        ToolbarItem(placement: .topBarTrailing) {
            if state.isMember {
                Button { router.switchTo(.profile) } label: {
                    HStack(spacing: 5) {
                        Circle().fill(Palette.gold).frame(width: 5, height: 5)
                        Text("до " + state.memberUntilText(.medium))
                            .font(Typo.semi(11))
                            .fixedSize()
                    }
                    .foregroundStyle(Palette.onInk)
                    .padding(.horizontal, 11).frame(height: 28)
                    .background(Palette.ink, in: Capsule())
                }
            } else {
                Button { router.go(.join) } label: {
                    Text("Вступить")
                        .font(Typo.bold(11))
                        .foregroundStyle(Palette.ink)
                        .padding(.horizontal, 12).frame(height: 28)
                        .overlay(Capsule().strokeBorder(Palette.ink, lineWidth: 1))
                }
            }
        }
    }

    @ViewBuilder
    private func destination(_ route: Route) -> some View {
        switch route {
        case .product(let id): ProductView(productId: id)
        case .offer(let id):   OfferView(offerId: id)
        case .section(let id): SectionView(sectionId: id)
        case .brand(let id):   BrandView(brandId: id)
        case .join:            JoinView()
        case .orders:          OrdersView()
        case .coupons:         CouponsView()
        }
    }
}

/// Короткое системное уведомление поверх интерфейса.
struct ToastView: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(Palette.onInk)
            .padding(.horizontal, 18).padding(.vertical, 11)
            .background(Palette.ink, in: Capsule())
            .shadow(color: .black.opacity(0.18), radius: 14, y: 4)
    }
}
