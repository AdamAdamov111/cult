import Foundation
import CoreGraphics

// MARK: - Цель перехода (баннер, кадр сторис)

enum Target: Hashable {
    case product(String)
    case offer(String)
    case brand(String)
    case section(String)
    case join
    case external(String)
}

extension Target: Decodable {
    private enum Keys: String, CodingKey { case t, id, url }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: Keys.self)
        let kind = try c.decode(String.self, forKey: .t)
        switch kind {
        case "product":  self = .product(try c.decode(String.self, forKey: .id))
        case "offer":    self = .offer(try c.decode(String.self, forKey: .id))
        case "brand":    self = .brand(try c.decode(String.self, forKey: .id))
        case "section":  self = .section(try c.decode(String.self, forKey: .id))
        case "join":     self = .join
        case "external": self = .external(try c.decode(String.self, forKey: .url))
        default:
            throw DecodingError.dataCorruptedError(forKey: .t, in: c, debugDescription: "неизвестная цель \(kind)")
        }
    }
}

// MARK: - Контент

struct Product: Codable, Identifiable, Hashable {
    let id: String
    let slug: String
    let title: String
    let tagline: String
    let rrp: Int
    let club: Int
    let volume: String
    let short: String
    let images: [String]
    let collections: [String]
    let desc: String
    let inci: String
    let effects: [String]
    let indications: [String]
    let usage: String
    let url: String
    let brand: String
    let cat: String
    let hit: Bool?

    var isOnSale: Bool { rrp > 0 }
    var saving: Int { max(0, rrp - club) }
    var discountPercent: Int { rrp > 0 ? Int((1 - Double(club) / Double(rrp)) * 100 + 0.5) : 0 }
    var cover: String { images.first ?? "" }
}

struct Offer: Codable, Identifiable, Hashable {
    let id: String
    let section: String
    let brand: String
    let title: String
    let deal: String
    let summary: String
    let terms: [String]
    let address: String?
    let city: String
    let valid: String
    let image: String
    let kind: String          // promo — промокод, request — заявка
    let value: Int?

    var needsRequest: Bool { kind == "request" }
}

struct SectionDef: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let kicker: String
    let sub: String
    let image: String
    let ratio: String
    let from: String
    let to: String

    /// «1600/900» → 1.777…
    var aspect: CGFloat {
        let parts = ratio.split(separator: "/").compactMap { Double($0) }
        guard parts.count == 2, parts[1] > 0 else { return 328.0 / 168.0 }
        return CGFloat(parts[0] / parts[1])
    }

    var isShop: Bool { id == "cosmetics" }
}

struct Brand: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let country: String
    let about: String
    let discount: Double
    let site: String
    let count: Int

    var discountPercent: Int { Int(discount * 100 + 0.5) }
}

struct StorySlide: Codable, Hashable {
    let image: String
    let eyebrow: String
    let title: String
    let text: String
    let cta: String
    let target: Target

    private enum Keys: String, CodingKey { case image, eyebrow, title, text, cta, target }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: Keys.self)
        image = try c.decode(String.self, forKey: .image)
        eyebrow = try c.decode(String.self, forKey: .eyebrow)
        title = try c.decode(String.self, forKey: .title)
        text = try c.decode(String.self, forKey: .text)
        cta = try c.decode(String.self, forKey: .cta)
        target = try c.decode(Target.self, forKey: .target)
    }
    func encode(to encoder: Encoder) throws {}
}

struct Story: Codable, Identifiable, Hashable {
    let id: String
    let section: String
    let label: String
    let cover: String
    let slides: [StorySlide]

    private enum Keys: String, CodingKey { case id, section, label, cover, slides }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: Keys.self)
        id = try c.decode(String.self, forKey: .id)
        section = try c.decode(String.self, forKey: .section)
        label = try c.decode(String.self, forKey: .label)
        cover = try c.decode(String.self, forKey: .cover)
        slides = try c.decode([StorySlide].self, forKey: .slides)
    }
    func encode(to encoder: Encoder) throws {}
}

struct Banner: Codable, Identifiable, Hashable {
    let id: String
    let eyebrow: String
    let title: String
    let sub: String
    let cta: String
    let image: String
    let target: Target
    let sponsored: Bool?
    let fit: String?

    var isContain: Bool { fit == "contain" }

    private enum Keys: String, CodingKey { case id, eyebrow, title, sub, cta, image, target, sponsored, fit }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: Keys.self)
        id = try c.decode(String.self, forKey: .id)
        eyebrow = try c.decode(String.self, forKey: .eyebrow)
        title = try c.decode(String.self, forKey: .title)
        sub = try c.decode(String.self, forKey: .sub)
        cta = try c.decode(String.self, forKey: .cta)
        image = try c.decode(String.self, forKey: .image)
        target = try c.decode(Target.self, forKey: .target)
        sponsored = try c.decodeIfPresent(Bool.self, forKey: .sponsored)
        fit = try c.decodeIfPresent(String.self, forKey: .fit)
    }
    func encode(to encoder: Encoder) throws {}
}

struct CatalogCategory: Codable, Identifiable, Hashable {
    let id: String
    let title: String
}

// MARK: - Пользовательские данные

struct Coupon: Codable, Identifiable, Hashable {
    var id: String { code }
    let code: String
    let offerId: String
    let brand: String
    let title: String
    let deal: String
    let issued: Date
    let expires: Date
}

struct OrderLine: Codable, Hashable {
    let title: String
    let qty: Int
    let price: Int
}

struct Order: Codable, Identifiable, Hashable {
    let id: String
    let date: Date
    let lines: [OrderLine]
    let shipping: Int
    let total: Int
    let saved: Int
    var status: String
}

struct Profile: Codable, Hashable {
    var name = ""
    var phone = ""
    var email = ""
    var address = ""
    var delivery = "courier"
}

enum Delivery: String, CaseIterable, Identifiable {
    case courier, cdek, pickup
    var id: String { rawValue }

    var title: String {
        switch self {
        case .courier: "Курьером по Москве"
        case .cdek:    "СДЭК по России"
        case .pickup:  "Самовывоз, Москва"
        }
    }
    var subtitle: String {
        switch self {
        case .courier: "на следующий день"
        case .cdek:    "2–5 дней, до пункта выдачи"
        case .pickup:  "шоурум, по записи"
        }
    }
    var price: Int {
        switch self {
        case .courier: 400
        case .cdek:    450
        case .pickup:  0
        }
    }
}
