import UIKit

/// Тактильный отклик на действия — то, чего не даёт веб-версия.
enum Haptics {
    private static let light = UIImpactFeedbackGenerator(style: .light)
    private static let medium = UIImpactFeedbackGenerator(style: .medium)
    private static let selection = UISelectionFeedbackGenerator()
    private static let notice = UINotificationFeedbackGenerator()

    static func tap()    { light.impactOccurred() }
    static func press()  { medium.impactOccurred() }
    static func select() { selection.selectionChanged() }
    static func success(){ notice.notificationOccurred(.success) }
    static func warning(){ notice.notificationOccurred(.warning) }
    static func error()  { notice.notificationOccurred(.error) }
}
