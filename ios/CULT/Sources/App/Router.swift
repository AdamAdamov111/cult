import SwiftUI

/// Экраны, которые кладутся в стек навигации поверх вкладки.
enum Route: Hashable {
    case product(String)
    case offer(String)
    case section(String)
    case brand(String)
    case join
    case orders
    case coupons
}

enum Tab: String, Hashable, CaseIterable {
    case home, catalog, cart, profile

    var title: String {
        switch self {
        case .home: "Главная"
        case .catalog: "Каталог"
        case .cart: "Корзина"
        case .profile: "Профиль"
        }
    }

    var icon: String {
        switch self {
        case .home: "house"
        case .catalog: "square.grid.2x2"
        case .cart: "bag"
        case .profile: "person"
        }
    }
}

/// Навигация по всему приложению: отдельный стек на каждую вкладку.
@Observable
final class Router {
    var tab: Tab = .home
    var paths: [Tab: [Route]] = [:]

    var path: [Route] {
        get { paths[tab] ?? [] }
        set { paths[tab] = newValue }
    }

    func go(_ route: Route) {
        Haptics.tap()
        paths[tab, default: []].append(route)
    }

    func go(_ target: Target, openURL: ((URL) -> Void)? = nil) {
        switch target {
        case .product(let id): go(.product(id))
        case .offer(let id):   go(.offer(id))
        case .brand(let id):   go(.brand(id))
        case .section(let id): go(.section(id))
        case .join:            go(.join)
        case .external(let s): if let url = URL(string: s) { openURL?(url) }
        }
    }

    func switchTo(_ newTab: Tab) {
        if tab == newTab {
            if !(paths[newTab] ?? []).isEmpty { paths[newTab] = [] }
        } else {
            Haptics.select()
            tab = newTab
        }
    }

    func reset(_ newTab: Tab) {
        paths[newTab] = []
        tab = newTab
    }

    func popToRoot() { paths[tab] = [] }
}
