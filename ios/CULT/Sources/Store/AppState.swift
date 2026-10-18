import SwiftUI
import Observation

/// Состояние пользователя: корзина, членство, заказы, купоны, профиль.
/// Хранится в Application Support, переживает перезапуск.
@Observable
final class AppState {

    // MARK: Сохраняемое

    var memberUntil: Date?
    var autoRenew = true
    var cart: [String: Int] = [:]
    var favorites: Set<String> = []
    var viewedSlides: Set<String> = []
    var coupons: [Coupon] = []
    var orders: [Order] = []
    var profile = Profile()
    var savedTotal = 0

    // MARK: Сеансовое

    var toast: String?
    private var toastTask: Task<Void, Never>?

    // MARK: Членство

    var isMember: Bool {
        guard let memberUntil else { return false }
        return memberUntil > .now
    }

    /// Дата следующего списания в человеческом виде.
    func memberUntilText(_ style: DateFormatter.Style = .long) -> String {
        guard let memberUntil else { return "" }
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateStyle = style
        f.timeStyle = .none
        return f.string(from: memberUntil)
    }

    func grantMembership(months: Int = 1) {
        let base = isMember ? memberUntil! : Date.now
        memberUntil = Calendar.current.date(byAdding: .month, value: months, to: base)
        autoRenew = true
        save()
    }

    func setMembership(expiry: Date?, autoRenew renew: Bool) {
        memberUntil = expiry
        autoRenew = renew
        save()
    }

    func cancelAutoRenew() {
        autoRenew = false
        save()
        say("Автопродление отключено")
    }

    // MARK: Корзина

    var cartCount: Int { cart.values.reduce(0, +) }

    var cartLines: [(product: Product, qty: Int)] {
        cart.compactMap { id, qty in
            guard let p = Catalog.product(id) else { return nil }
            return (p, qty)
        }
        .sorted { $0.product.title < $1.product.title }
    }

    var cartTotals: (club: Int, rrp: Int, saved: Int) {
        var club = 0, rrp = 0
        for (p, qty) in cartLines {
            club += p.club * qty
            rrp += p.rrp * qty
        }
        return (club, rrp, rrp - club)
    }

    func qty(_ id: String) -> Int { cart[id] ?? 0 }

    func add(_ id: String, qty: Int = 1) {
        cart[id, default: 0] = min(99, (cart[id] ?? 0) + qty)
        Haptics.success()
        save()
        say("Добавлено в корзину")
    }

    func setQty(_ id: String, _ value: Int) {
        Haptics.select()
        if value <= 0 { cart.removeValue(forKey: id) } else { cart[id] = min(99, value) }
        save()
    }

    func remove(_ id: String) {
        Haptics.tap()
        cart.removeValue(forKey: id)
        save()
    }

    func clearCart() { cart.removeAll(); save() }

    // MARK: Избранное и сторис

    func isFavorite(_ id: String) -> Bool { favorites.contains(id) }

    func toggleFavorite(_ id: String) {
        Haptics.tap()
        if favorites.contains(id) { favorites.remove(id) } else { favorites.insert(id) }
        save()
    }

    func markViewed(story: String, slide: Int) {
        let key = "\(story):\(slide)"
        guard !viewedSlides.contains(key) else { return }
        viewedSlides.insert(key)
        save()
    }

    func isUnseen(_ story: Story) -> Bool {
        story.slides.indices.contains { !viewedSlides.contains("\(story.id):\($0)") }
    }

    // MARK: Купоны

    func coupon(for offerId: String) -> Coupon? {
        coupons.first { $0.offerId == offerId && $0.expires > .now }
    }

    @discardableResult
    func issueCoupon(for offer: Offer) -> Coupon {
        if let existing = coupon(for: offer.id) { return existing }
        let suffix = String(UUID().uuidString.prefix(5)).uppercased()
        let tail = String(Int(Date.now.timeIntervalSince1970) % 1000)
        let coupon = Coupon(
            code: "CULT-\(suffix)-\(tail)",
            offerId: offer.id,
            brand: offer.brand,
            title: offer.title,
            deal: offer.deal,
            issued: .now,
            expires: Calendar.current.date(byAdding: .day, value: 14, to: .now) ?? .now
        )
        coupons.insert(coupon, at: 0)
        Haptics.success()
        save()
        return coupon
    }

    // MARK: Заказы

    @discardableResult
    func placeOrder(shipping: Int) -> Order {
        let totals = cartTotals
        let order = Order(
            id: "C" + String(Int(Date.now.timeIntervalSince1970)).suffix(7),
            date: .now,
            lines: cartLines.map { OrderLine(title: $0.product.title, qty: $0.qty, price: $0.product.club) },
            shipping: shipping,
            total: totals.club + shipping,
            saved: totals.saved,
            status: "Оплачен"
        )
        orders.insert(order, at: 0)
        savedTotal += totals.saved
        cart.removeAll()
        Haptics.success()
        save()
        return order
    }

    // MARK: Подсказки

    func say(_ message: String) {
        toastTask?.cancel()
        withAnimation(.spring(duration: 0.3)) { toast = message }
        toastTask = Task { @MainActor in
            try? await Task.sleep(for: .seconds(1.9))
            guard !Task.isCancelled else { return }
            withAnimation(.easeOut(duration: 0.2)) { toast = nil }
        }
    }

    // MARK: Хранение

    private struct Persisted: Codable {
        var memberUntil: Date?
        var autoRenew: Bool
        var cart: [String: Int]
        var favorites: Set<String>
        var viewedSlides: Set<String>
        var coupons: [Coupon]
        var orders: [Order]
        var profile: Profile
        var savedTotal: Int
    }

    private static var fileURL: URL {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("cult-state.json")
    }

    init() { load() }

    func save() {
        let snapshot = Persisted(
            memberUntil: memberUntil, autoRenew: autoRenew, cart: cart,
            favorites: favorites, viewedSlides: viewedSlides, coupons: coupons,
            orders: orders, profile: profile, savedTotal: savedTotal
        )
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        try? data.write(to: Self.fileURL, options: .atomic)
    }

    private func load() {
        guard let data = try? Data(contentsOf: Self.fileURL),
              let s = try? JSONDecoder().decode(Persisted.self, from: data) else { return }
        memberUntil = s.memberUntil
        autoRenew = s.autoRenew
        cart = s.cart
        favorites = s.favorites
        viewedSlides = s.viewedSlides
        coupons = s.coupons
        orders = s.orders
        profile = s.profile
        savedTotal = s.savedTotal
    }

    /// Для демонстрации партнёрам — сброс в исходное состояние.
    func resetAll() {
        memberUntil = nil; autoRenew = true; cart = [:]; favorites = []
        viewedSlides = []; coupons = []; orders = []; profile = Profile(); savedTotal = 0
        save()
        Haptics.warning()
        say("Состояние сброшено")
    }
}
