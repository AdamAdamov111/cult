import Foundation
import StoreKit
import Observation

/// Подписка на членство через StoreKit 2.
///
/// Членство — цифровая услуга внутри приложения, поэтому по правилам App Store
/// она продаётся через внутреннюю покупку. Физические товары BYRAIN оплачиваются
/// вне StoreKit: Apple прямо запрещает проводить их через внутренние покупки.
@Observable
final class MembershipStore {

    static let productID = "ru.byrain.cult.membership.monthly"

    enum Status: Equatable {
        case loading
        case ready
        case unavailable(String)
    }

    private(set) var status: Status = .loading
    private(set) var product: StoreKit.Product?
    private(set) var purchasing = false

    /// Цена из App Store, если магазин доступен, иначе цена из контента.
    var priceText: String {
        product?.displayPrice ?? Money.string(Catalog.membershipPrice)
    }

    private var updatesTask: Task<Void, Never>?

    init() {
        updatesTask = Task { [weak self] in
            for await update in Transaction.updates {
                await self?.handle(update)
            }
        }
    }

    deinit { updatesTask?.cancel() }

    func load() async {
        do {
            let products = try await StoreKit.Product.products(for: [Self.productID])
            product = products.first
            status = product == nil
                ? .unavailable("Подписка не найдена в App Store Connect")
                : .ready
        } catch {
            status = .unavailable(error.localizedDescription)
        }
    }

    /// Текущее право доступа по данным StoreKit — источник правды о членстве.
    func currentEntitlement() async -> (expiry: Date?, autoRenew: Bool)? {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  transaction.productID == Self.productID else { continue }
            let renews = transaction.revocationDate == nil && !transaction.isUpgraded
            return (transaction.expirationDate, renews)
        }
        return nil
    }

    enum PurchaseResult { case success, cancelled, pending, failed(String) }

    func purchase() async -> PurchaseResult {
        guard let product else { return .failed("Подписка недоступна") }
        purchasing = true
        defer { purchasing = false }
        do {
            switch try await product.purchase() {
            case .success(let verification):
                guard case .verified(let transaction) = verification else {
                    return .failed("Покупка не прошла проверку подписи")
                }
                await transaction.finish()
                return .success
            case .userCancelled:
                return .cancelled
            case .pending:
                return .pending
            @unknown default:
                return .failed("Неизвестный ответ App Store")
            }
        } catch {
            return .failed(error.localizedDescription)
        }
    }

    func restore() async {
        try? await AppStore.sync()
    }

    private func handle(_ update: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = update else { return }
        await transaction.finish()
    }
}
