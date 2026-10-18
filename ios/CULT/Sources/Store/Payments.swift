import Foundation

/// Оплата товаров — вне StoreKit.
///
/// Физические товары Apple запрещает проводить через внутренние покупки
/// (App Store Review Guidelines, 3.1.5). Боевой контур: Apple Pay или карта
/// через платёжного провайдера, деньги идут на расчётный счёт напрямую.
/// Пока эндпоинт не задан, оплата имитируется — в интерфейсе это помечено.
enum Payments {
    static let endpoint: URL? = nil   // здесь появится адрес платёжного API

    static var isDemo: Bool { endpoint == nil }

    enum Result { case paid, cancelled, failed(String) }

    static func payOrder(amount: Int, lines: [(id: String, qty: Int)]) async -> Result {
        guard endpoint != nil else {
            try? await Task.sleep(for: .milliseconds(700))   // имитация платёжного окна
            return .paid
        }
        return .failed("Платёжный контур не настроен")
    }
}
