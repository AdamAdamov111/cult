import Foundation

/// Весь контент приложения: каталог, бренды, предложения, сторис, баннеры.
/// Лежит в бандле, поэтому приложение полностью работает офлайн.
struct Content: Decodable {
    let generated: String
    let membershipPrice: Int
    let sections: [SectionDef]
    let cosmeticsCats: [CatalogCategory]
    let brands: [Brand]
    let products: [Product]
    let offers: [Offer]
    let stories: [Story]
    let banners: [Banner]
}

enum Catalog {
    static let shared: Content = {
        guard let url = Bundle.main.url(forResource: "content", withExtension: "json"),
              let data = try? Data(contentsOf: url) else {
            fatalError("content.json не найден в бандле")
        }
        do {
            return try JSONDecoder().decode(Content.self, from: data)
        } catch {
            fatalError("content.json не разобрался: \(error)")
        }
    }()

    static var membershipPrice: Int { shared.membershipPrice }
    static var sections: [SectionDef] { shared.sections }
    static var brands: [Brand] { shared.brands }
    static var products: [Product] { shared.products }
    static var offers: [Offer] { shared.offers }
    static var stories: [Story] { shared.stories }
    static var banners: [Banner] { shared.banners }
    static var categories: [CatalogCategory] { shared.cosmeticsCats }

    private static let productIndex: [String: Product] = Dictionary(
        uniqueKeysWithValues: shared.products.map { ($0.id, $0) }
    )
    private static let offerIndex: [String: Offer] = Dictionary(
        uniqueKeysWithValues: shared.offers.map { ($0.id, $0) }
    )

    static func product(_ id: String) -> Product? { productIndex[id] }
    static func offer(_ id: String) -> Offer? { offerIndex[id] }
    static func brand(_ id: String) -> Brand? { brands.first { $0.id == id } }
    static func section(_ id: String) -> SectionDef? { sections.first { $0.id == id } }

    static var onSale: [Product] { products.filter(\.isOnSale) }
    static var coming: [Product] { products.filter { !$0.isOnSale } }
    static var hits: [Product] { products.filter { $0.hit == true && $0.isOnSale } }

    static func products(brand title: String) -> [Product] {
        products.filter { $0.brand == title && $0.isOnSale }
    }

    static func products(category: String) -> [Product] {
        let list = category == "all" ? products : products.filter { $0.cat == category }
        return list.sorted { a, b in
            if a.isOnSale != b.isOnSale { return a.isOnSale }
            return a.rrp > b.rrp
        }
    }

    static func offers(section: String) -> [Offer] {
        offers.filter { $0.section == section }
    }

    static func partners(section: String) -> [String] {
        var seen = Set<String>()
        return offers(section: section).compactMap { seen.insert($0.brand).inserted ? $0.brand : nil }
    }

    static var totalOfferValue: Int { offers.reduce(0) { $0 + ($1.value ?? 0) } }

    static func search(_ query: String) -> (products: [Product], offers: [Offer]) {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard q.count >= 2 else { return ([], []) }
        let p = products.filter {
            $0.title.lowercased().contains(q)
            || $0.tagline.lowercased().contains(q)
            || $0.brand.lowercased().contains(q)
            || $0.collections.contains { $0.lowercased().contains(q) }
        }
        let o = offers.filter {
            ($0.title + $0.brand + $0.summary).lowercased().contains(q)
        }
        return (Array(p.prefix(40)), o)
    }
}

// MARK: - Формат цен

enum Money {
    private static let formatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.groupingSeparator = "\u{00A0}"
        f.maximumFractionDigits = 0
        return f
    }()

    static func string(_ value: Int) -> String {
        (formatter.string(from: NSNumber(value: value)) ?? "\(value)") + "\u{00A0}₽"
    }
}
